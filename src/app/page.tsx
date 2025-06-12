"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  BackgroundVariant,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  NodeTypes,
  MiniMap,
  EdgeProps,
  getBezierPath,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus } from "lucide-react";
import { TopMenu } from "@/components/TopMenu";
import { RightSidebar } from "@/components/RightSidebar";
import { ConversationNode } from "@/components/nodes/ConversationNode";
import { CallTransferNode } from "@/components/nodes/CallTransferNode";
import { PressDigitNode } from "@/components/nodes/PressDigitNode";
import { EndCallNode } from "@/components/nodes/EndCallNode";
import NodeConfigModal from "@/components/modals/NodeConfigModal";
import CallTransferConfigModal from "@/components/modals/CallTransferConfigModal";
import PressDigitConfigModal from "@/components/modals/PressDigitConfigModal";
import FunctionConfigModal from "@/components/modals/FunctionConfigModal";
import { StartNode } from "@/components/nodes/StartNode";
import { FunctionNode } from "@/components/nodes/FunctionNode";
import HelpButton from "@/components/HelpButton";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Define custom node types
const nodeTypes: NodeTypes = {
  conversation: ConversationNode,
  "call-transfer": CallTransferNode,
  "press-digit": PressDigitNode,
  "end-call": EndCallNode,
  start: StartNode,
  function: FunctionNode,
};

// Define types for node data
interface DigitMapping {
  digit: string;
  label: string;
  color: string;
}

// Define the node data type
interface NodeData {
  id: string;
  label: string;
  nodeType: string;
  // Conversation node specific fields
  prompt?: string;
  transitions?: string[];
  aiModel?: string;
  voice?: string;
  language?: string;
  interruptionSensitivity?: number;
  blacklistedWords?: string[];
  boostedKeywords?: string[];
  maxCallDuration?: number;
  startMode?: "auto" | "manual";
  agreeToTerms?: boolean;
  allowEmails?: boolean;
  strictlyNecessaryCookies?: boolean;
  functionalCookies?: boolean;
  welcomeMessage?: string;
  endingMessage?: string;
  timeoutMessage?: string;
  fallbackMessage?: string;
  // Call transfer node specific fields
  transferType?: "warm" | "cold" | "blind";
  destination?: string;
  timeout?: number;
  greetingMessage?: string;
  // Press digit node specific fields
  instructions?: string;
  validDigits?: string[];
  digitMappings?: DigitMapping[];
  maxAttempts?: number;
  pauseDetectionDelay?: number;
  interDigitTimeout?: number;
  totalInputTimeout?: number;
  invalidInputMessage?: string;
  repeatInstructions?: boolean;
  dtmfSensitivity?: number;
  // Function node specific fields
  programmingLanguage?: "javascript" | "python" | "curl";
  code?: string;
  retryCount?: number;
  onFailAction?: "stop" | "retry" | "continue";
  // Common fields
  isLoading?: boolean;
  isCompleted?: boolean;
  isError?: boolean;
  errorMessage?: string;
  lastTestResult?: "success" | "error" | "pending" | null;
}

interface ConfigModalState {
  isOpen: boolean;
  nodeId: string | null;
  nodeData: NodeData | null;
}

// Custom edge component with delete button
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("deleteEdge", { detail: { edgeId: id } });
    window.dispatchEvent(event);
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {selected && (
        <g
          transform={`translate(${labelX} ${labelY})`}
          className="cursor-pointer"
          onClick={handleDelete}
        >
          <circle
            r={10}
            fill="white"
            stroke="#dc2626"
            strokeWidth={2}
            className="hover:fill-red-50 transition-colors"
          />
          <line
            x1="-4"
            y1="-4"
            x2="4"
            y2="4"
            stroke="#dc2626"
            strokeWidth={2}
          />
          <line
            x1="4"
            y1="-4"
            x2="-4"
            y2="4"
            stroke="#dc2626"
            strokeWidth={2}
          />
        </g>
      )}
    </>
  );
};

// Define custom edge types
const edgeTypes = {
  custom: CustomEdge,
};

// Main FlowAuthoringApp with custom nodes and delete functionality
export default function FlowAuthoringApp() {
  // Initialize state with saved data or defaults
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("flowState");
    if (savedState) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedState);
        if (savedNodes) setNodes(savedNodes);
        if (savedEdges) setEdges(savedEdges);
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    const flowState = {
      nodes,
      edges,
      lastSaved: new Date().toISOString(),
    };

    localStorage.setItem("flowState", JSON.stringify(flowState));
  }, [nodes, edges]);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [configModal, setConfigModal] = useState<ConfigModalState>({
    isOpen: false,
    nodeId: null,
    nodeData: null,
  });
  const [animationState, setAnimationState] = useState<{
    isAnimating: boolean;
    activeNodeId: string | null;
    activeEdgeId: string | null;
    loadingNodes: Set<string>;
    completedNodes: Set<string>;
  }>({
    isAnimating: false,
    activeNodeId: null,
    activeEdgeId: null,
    loadingNodes: new Set(),
    completedNodes: new Set(),
  });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [showMinimap, setShowMinimap] = useState(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setSelectedNodes(selectedNodes.map((node: Node) => node.id));
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const nodeType = event.dataTransfer.getData("application/reactflow");

      if (!nodeType) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create start node if it doesn't exist and this is the first node
      const startNodeExists = nodes.some((node) => node.type === "start");

      // If dragging a start node and no start exists, create it
      if (!startNodeExists && nodeType === "start") {
        const startNode: Node = {
          id: "start-node",
          type: "start",
          position: { x: position.x - 150, y: position.y },
          data: {
            label: "Start",
            nodeType: "start",
          },
        };
        setNodes((nds) => nds.concat(startNode));
        return;
      }

      // Create the new node
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: `${nodeType
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}`,
          nodeType: nodeType,
          ...(nodeType === "conversation" && {
            prompt: "",
            transitions: [],
          }),
          ...(nodeType === "call-transfer" && {
            transferType: "direct",
            destination: "",
            timeout: 30,
            greetingMessage: "",
          }),
          ...(nodeType === "function" && {
            programmingLanguage: "javascript",
            code: "",
            timeout: 30,
            retryCount: 0,
            onFailAction: "stop",
          }),
        },
      };

      // If this is the first node and it's not a start node, create a start node first
      if (!startNodeExists && nodeType !== "start") {
        const startNode: Node = {
          id: "start-node",
          type: "start",
          position: { x: position.x - 150, y: position.y },
          data: {
            label: "Start",
            nodeType: "start",
          },
        };
        setNodes((nds) => nds.concat(startNode));
      }

      setNodes((nds) => nds.concat(newNode));

      // If this is the first node, create an edge from start node
      if (!startNodeExists) {
        const newEdge: Edge = {
          id: `edge-start-${newNode.id}`,
          source: "start-node",
          target: newNode.id,
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 2 },
        };
        setEdges((eds) => eds.concat(newEdge));
      }
    },
    [reactFlowInstance, setNodes, setEdges, nodes]
  );

  // Handle center plus button click
  const handleCenterPlusClick = useCallback(() => {
    if (!reactFlowInstance || !reactFlowWrapper.current) return;

    // Get the center of the visible area
    const {
      x: viewportX,
      y: viewportY,
      zoom,
    } = reactFlowInstance.getViewport();
    const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
    const centerX = width / 2 / zoom - viewportX;
    const centerY = height / 2 / zoom - viewportY;

    // Create start node if it doesn't exist
    const startNodeExists = nodes.some((node) => node.type === "start");
    if (!startNodeExists) {
      const startNode: Node = {
        id: "start-node",
        type: "start",
        position: { x: centerX - 150, y: centerY },
        data: {
          label: "Start",
          nodeType: "start",
        },
      };
      setNodes((nds) => nds.concat(startNode));
    }

    // Create the new conversation node
    const newNode: Node = {
      id: `conversation-${Date.now()}`,
      type: "conversation",
      position: { x: centerX + 50, y: centerY },
      data: {
        label: "Conversation Node",
        nodeType: "conversation",
        prompt: "",
        transitions: [],
      },
    };

    // Add the new node
    setNodes((nds) => nds.concat(newNode));

    // If this is the first node, create an edge from start node
    if (!startNodeExists) {
      const newEdge: Edge = {
        id: `edge-start-${newNode.id}`,
        source: "start-node",
        target: newNode.id,
        type: "smoothstep",
        animated: false,
        style: { strokeWidth: 2 },
      };
      setEdges((eds) => eds.concat(newEdge));
    }
  }, [setNodes, setEdges, nodes, reactFlowInstance]);

  // Handle node deletion
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Handle node configuration
  const handleConfigureNode = useCallback(
    (nodeId: string, nodeData: NodeData) => {
      setConfigModal({
        isOpen: true,
        nodeId,
        nodeData,
      });
    },
    []
  );

  // Handle saving node configuration
  const handleSaveNodeConfig = useCallback(
    (updatedData: Partial<NodeData>) => {
      if (configModal.nodeId) {
        setNodes((nds) => {
          // First check if the node still exists
          const nodeExists = nds.some((node) => node.id === configModal.nodeId);
          if (!nodeExists) {
            console.warn("Node no longer exists, skipping update");
            return nds;
          }

          return nds.map((node) =>
            node.id === configModal.nodeId
              ? { ...node, data: { ...node.data, ...updatedData } }
              : node
          );
        });
      }
    },
    [configModal.nodeId, setNodes]
  );

  // Listen for delete and configure events from nodes
  useEffect(() => {
    const handleDeleteEvent = (event: CustomEvent<{ nodeId: string }>) => {
      handleDeleteNode(event.detail.nodeId);
    };

    const handleConfigureEvent = (
      event: CustomEvent<{ nodeId: string; nodeData: NodeData }>
    ) => {
      handleConfigureNode(event.detail.nodeId, event.detail.nodeData);
    };

    window.addEventListener("deleteNode", handleDeleteEvent as EventListener);
    window.addEventListener(
      "configureNode",
      handleConfigureEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "deleteNode",
        handleDeleteEvent as EventListener
      );
      window.removeEventListener(
        "configureNode",
        handleConfigureEvent as EventListener
      );
    };
  }, [handleDeleteNode, handleConfigureNode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNodes.length > 0
      ) {
        selectedNodes.forEach((nodeId) => {
          handleDeleteNode(nodeId);
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNodes, handleDeleteNode]);

  // Handle interaction start
  const handleInteractionStart = useCallback(() => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    setShowMinimap(true);
  }, []);

  // Handle interaction end
  const handleInteractionEnd = useCallback(() => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setShowMinimap(false);
    }, 1000); // 1 second delay before hiding
  }, []);

  // Handle viewport movement
  const handleMove = useCallback(() => {
    handleInteractionStart();
  }, [handleInteractionStart]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  // Validate node configuration
  const validateNode = useCallback((node: Node<NodeData>): string | null => {
    switch (node.type) {
      case "conversation":
        if (!node.data.prompt || node.data.prompt.trim() === "") {
          return "Conversation node requires a prompt.";
        }
        if (!node.data.aiModel) {
          return "Conversation node requires an AI model.";
        }
        if (!node.data.voice) {
          return "Conversation node requires a voice.";
        }
        break;
      case "call-transfer":
        if (!node.data.destination || node.data.destination.trim() === "") {
          return "Call Transfer node requires a destination.";
        }
        if (!node.data.transferType) {
          return "Call Transfer node requires a transfer type.";
        }
        break;
      case "press-digit":
        if (!node.data.instructions || node.data.instructions.trim() === "") {
          return "Press Digit node requires instructions.";
        }
        if (!node.data.validDigits || node.data.validDigits.length === 0) {
          return "Press Digit node requires valid digits.";
        }
        break;
      case "function":
        if (!node.data.code || node.data.code.trim() === "") {
          return "Function node requires code.";
        }
        if (!node.data.programmingLanguage) {
          return "Function node requires a programming language.";
        }
        break;
      case "end-call":
        // End call node doesn't require validation
        break;
      case "start":
        // Start node doesn't require validation
        break;
      default:
        return `Unknown node type: ${node.type}`;
    }
    return null; // No error
  }, []);

  // Add node run handler
  const handleNodeRun = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Set loading state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  isLoading: true,
                  isCompleted: false,
                  isError: false,
                  errorMessage: undefined,
                  lastTestResult: "pending",
                },
              }
            : n
        )
      );

      // Simulate validation after a short delay
      setTimeout(() => {
        const error = validateNode(node);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    isLoading: false,
                    isCompleted: !error,
                    isError: !!error,
                    errorMessage: error || undefined,
                    lastTestResult: error ? "error" : "success",
                  },
                }
              : n
          )
        );
      }, 1000);
    },
    [nodes, validateNode]
  );

  // Add node run event listener
  useEffect(() => {
    const handleNodeRunEvent = (event: CustomEvent<{ nodeId: string }>) => {
      handleNodeRun(event.detail.nodeId);
    };

    window.addEventListener("nodeRun", handleNodeRunEvent as EventListener);

    return () => {
      window.removeEventListener(
        "nodeRun",
        handleNodeRunEvent as EventListener
      );
    };
  }, [handleNodeRun]);

  // Add animation handler
  const handleStartNodeClick = useCallback(
    (nodeId: string) => {
      if (animationState.isAnimating) return;

      // Clear previous animation and error states
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isLoading: false,
            isCompleted: false,
            isError: false,
            errorMessage: undefined,
            lastTestResult: null,
          },
        }))
      );
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: false,
          style: { ...edge.style, stroke: undefined, strokeWidth: undefined },
        }))
      );

      // Find the specific start node that was clicked
      const startNode = nodes.find((node) => node.id === nodeId);
      if (!startNode || startNode.type !== "start") {
        setAnimationState((prev) => ({ ...prev, isAnimating: false }));
        return;
      }

      // Start animation state
      setAnimationState({
        isAnimating: true,
        activeNodeId: startNode.id,
        activeEdgeId: null,
        loadingNodes: new Set([startNode.id]),
        completedNodes: new Set(),
      });

      const visited = new Set<string>();
      const sequence: { nodeId: string | null; edgeId: string | null }[] = [];

      const traverse = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
        sequence.push({ nodeId, edgeId: null });

        for (const edge of outgoingEdges) {
          sequence.push({ nodeId: null, edgeId: edge.id });
          traverse(edge.target);
        }
      };

      traverse(startNode.id);

      // Animate sequence
      const processNextItem = (index: number) => {
        if (index >= sequence.length) {
          setAnimationState((prev) => ({ ...prev, isAnimating: false }));
          // Dispatch flow completion event
          const event = new CustomEvent("flowComplete", {
            detail: { success: true },
            bubbles: true,
          });
          window.dispatchEvent(event);
          return;
        }

        const item = sequence[index];
        const delay = 1000; // 1 second per step

        if (item.nodeId) {
          const currentNode = nodes.find((n) => n.id === item.nodeId);
          if (currentNode) {
            // Start loading animation for the node
            setAnimationState((prev) => ({
              ...prev,
              activeNodeId: item.nodeId,
              loadingNodes: new Set([
                ...prev.loadingNodes,
                item.nodeId as string,
              ]),
            }));

            // Skip delay for start node
            const isStartNode = currentNode.type === "start";
            const nodeDelay = isStartNode ? 0 : delay;

            // Simulate node execution
            setTimeout(() => {
              // Validate node during execution
              const error = validateNode(currentNode);
              if (error) {
                // Mark node as error
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === item.nodeId
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            isLoading: false,
                            isError: true,
                            errorMessage: error,
                            lastTestResult: "error",
                          },
                        }
                      : node
                  )
                );
                setAnimationState((prev) => ({
                  ...prev,
                  loadingNodes: new Set(
                    [...prev.loadingNodes].filter((id) => id !== item.nodeId)
                  ),
                  isAnimating: false,
                }));
                // Dispatch flow error event
                const event = new CustomEvent("flowComplete", {
                  detail: { success: false },
                  bubbles: true,
                });
                window.dispatchEvent(event);
                return;
              }

              // Mark node as completed
              setAnimationState((prev) => ({
                ...prev,
                loadingNodes: new Set(
                  [...prev.loadingNodes].filter((id) => id !== item.nodeId)
                ),
                completedNodes: new Set([
                  ...prev.completedNodes,
                  item.nodeId as string,
                ]),
              }));

              // Update node data with success state
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === item.nodeId
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          isLoading: false,
                          isCompleted: true,
                          lastTestResult: "success",
                        },
                      }
                    : node
                )
              );

              // Process next item after delay
              setTimeout(() => processNextItem(index + 1), delay);
            }, nodeDelay);
          }
        } else if (item.edgeId) {
          // Animate edge
          setAnimationState((prev) => ({
            ...prev,
            activeEdgeId: item.edgeId,
          }));

          // Process next item after delay
          setTimeout(() => processNextItem(index + 1), delay);
        }
      };

      // Start the sequence
      processNextItem(0);
    },
    [nodes, edges, animationState.isAnimating, validateNode, setNodes, setEdges]
  );

  // Add animation styles to nodes and edges
  const getNodeStyle = useCallback(
    (node: Node) => {
      const isActive = animationState.activeNodeId === node.id;
      const isCompleted = animationState.completedNodes.has(node.id);
      const isLoading = animationState.loadingNodes.has(node.id);
      const isError = node.data.isError;

      return {
        ...node.style,
        transition: "all 0.3s ease",
        borderColor: isError
          ? "#dc2626" // Red for error
          : isCompleted
          ? "#16a34a" // Green for completed
          : isActive
          ? "#16a34a" // Green for active
          : isLoading
          ? "#f59e0b" // Orange for loading
          : undefined,
        borderWidth:
          isActive || isCompleted || isError || isLoading ? "2px" : undefined,
        borderRadius: "0.5rem",
        opacity: isCompleted ? 0.8 : 1,
        boxShadow: isActive
          ? "0 0 0 2px rgba(22, 163, 74, 0.2)"
          : isError
          ? "0 0 0 2px rgba(220, 38, 38, 0.2)"
          : isLoading
          ? "0 0 0 2px rgba(245, 158, 11, 0.2)"
          : undefined,
      };
    },
    [
      animationState.activeNodeId,
      animationState.completedNodes,
      animationState.loadingNodes,
    ]
  );

  const getEdgeStyle = useCallback(
    (edge: Edge) => {
      const isActive = animationState.activeEdgeId === edge.id;
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const isSourceCompleted = sourceNode?.data.isCompleted;
      const isTargetCompleted = targetNode?.data.isCompleted;
      const isSourceError = sourceNode?.data.isError;
      const isTargetError = targetNode?.data.isError;

      return {
        ...edge.style,
        transition: "all 0.3s ease",
        stroke: isActive
          ? "#16a34a" // Green for active
          : isSourceError || isTargetError
          ? "#dc2626" // Red for error
          : isSourceCompleted && isTargetCompleted
          ? "#16a34a" // Green for completed
          : undefined,
        strokeWidth: isActive
          ? 3
          : isSourceCompleted && isTargetCompleted
          ? 2
          : undefined,
        strokeDasharray: isActive ? "5,5" : undefined,
        animation: isActive ? "flowing 1s linear infinite" : undefined,
      };
    },
    [animationState.activeEdgeId, nodes]
  );

  // Listen for start node click
  useEffect(() => {
    const handleStartNodeClickEvent = (
      event: CustomEvent<{ nodeId: string }>
    ) => {
      handleStartNodeClick(event.detail.nodeId);
    };

    window.addEventListener(
      "startNodeClick",
      handleStartNodeClickEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "startNodeClick",
        handleStartNodeClickEvent as EventListener
      );
    };
  }, [handleStartNodeClick]);

  // Add animation keyframes
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes tick {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes flowing {
        from { stroke-dashoffset: 10; }
        to { stroke-dashoffset: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add click away handler to clear animations
  useEffect(() => {
    const handleClickAway = (e: MouseEvent) => {
      // Don't clear if clicking on a node or edge
      const target = e.target as HTMLElement;
      if (
        target.closest(".react-flow__node") ||
        target.closest(".react-flow__edge")
      ) {
        return;
      }

      setAnimationState({
        isAnimating: false,
        activeNodeId: null,
        activeEdgeId: null,
        loadingNodes: new Set(),
        completedNodes: new Set(),
      });

      // Clear error states on click away
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, isError: false, errorMessage: undefined },
        }))
      );
    };

    document.addEventListener("click", handleClickAway);
    return () => {
      document.removeEventListener("click", handleClickAway);
    };
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdges([edge.id]);
  }, []);

  // Handle edge deletion
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
      setSelectedEdges([]);
    },
    [setEdges]
  );

  // Listen for edge deletion events
  useEffect(() => {
    const handleDeleteEdgeEvent = (event: CustomEvent<{ edgeId: string }>) => {
      handleDeleteEdge(event.detail.edgeId);
    };

    window.addEventListener(
      "deleteEdge",
      handleDeleteEdgeEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "deleteEdge",
        handleDeleteEdgeEvent as EventListener
      );
    };
  }, [handleDeleteEdge]);

  // Add click away handler to clear edge selection
  useEffect(() => {
    const handleClickAway = (e: MouseEvent) => {
      // Don't clear if clicking on an edge or its delete button
      const target = e.target as HTMLElement;
      if (
        target.closest(".react-flow__edge") ||
        target.closest(".react-flow__edge-path") ||
        target.closest("circle") ||
        target.closest("line")
      ) {
        return;
      }

      setSelectedEdges([]);
    };

    document.addEventListener("click", handleClickAway);
    return () => {
      document.removeEventListener("click", handleClickAway);
    };
  }, []);

  return (
    <div className="h-screen w-full flex bg-gray-50">
      {/* Main Content Area (Left side) */}
      <div className="flex-1 flex flex-col">
        {/* Top Menu */}
        <TopMenu
          nodes={nodes}
          edges={edges}
          onSave={(savedNodes, savedEdges) => {
            setNodes(savedNodes);
            setEdges(savedEdges);
          }}
        />

        {/* Flow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes.map((node) => ({
                ...node,
                style: getNodeStyle(node),
                data: {
                  ...node.data,
                  isLoading: animationState.loadingNodes.has(node.id),
                  isCompleted: animationState.completedNodes.has(node.id),
                },
              }))}
              edges={edges.map((edge) => ({
                ...edge,
                type: "custom",
                style: {
                  ...getEdgeStyle(edge),
                  cursor: "pointer",
                },
                selected: selectedEdges.includes(edge.id),
              }))}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={(params) => {
                const newEdge = {
                  ...params,
                  type: "custom",
                  style: { strokeWidth: 2 },
                };
                setEdges((eds) => addEdge(newEdge, eds));
              }}
              onInit={onInit}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onSelectionChange={onSelectionChange}
              onEdgeClick={onEdgeClick}
              onMouseDown={handleInteractionStart}
              onMouseUp={handleInteractionEnd}
              onMouseLeave={handleInteractionEnd}
              onNodeDragStart={handleInteractionStart}
              onNodeDragStop={handleInteractionEnd}
              onPaneClick={handleInteractionStart}
              onPaneScroll={handleInteractionStart}
              onMove={handleMove}
              onMoveEnd={handleInteractionEnd}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              className="bg-white"
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              attributionPosition="bottom-left"
              selectNodesOnDrag={false}
              multiSelectionKeyCode="Control"
            >
              <Background
                color="#F5F5F5"
                gap={30}
                size={5}
                variant={BackgroundVariant.Dots}
              />
              <Controls
                position="bottom-right"
                className="bg-white shadow-lg border border-gray-200 rounded-xl p-1"
                showInteractive={false}
                style={
                  {
                    "--react-flow-controls-button-bg": "white",
                    "--react-flow-controls-button-color": "#6B7280",
                    "--react-flow-controls-button-border": "1px solid #E5E7EB",
                    "--react-flow-controls-button-hover-bg": "#F3F4F6",
                    "--react-flow-controls-button-hover-color": "#374151",
                    "--react-flow-controls-button-size": "32px",
                    "--react-flow-controls-button-radius": "8px",
                    "--react-flow-controls-button-margin": "4px",
                  } as React.CSSProperties
                }
              />
              {showMinimap && (
                <MiniMap
                  className="!absolute !right-4 !top-4 !w-48 !h-32 !bg-white !rounded-xl !shadow-lg !border !border-gray-200 !transition-opacity !duration-300"
                  style={{
                    opacity: showMinimap ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out",
                  }}
                />
              )}
            </ReactFlow>

            {/* Placeholder message when no nodes */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <button
                    onClick={handleCenterPlusClick}
                    className="w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4 pointer-events-auto transition-colors"
                  >
                    <Plus className="w-8 h-8 text-blue-600" />
                  </button>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Building Your Flow
                  </h3>
                  <p className="text-gray-500">
                    Drag nodes from the sidebar or click the plus button
                  </p>
                </div>
              </div>
            )}
          </ReactFlowProvider>
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Configuration Modal */}
      {configModal.isOpen && configModal.nodeData && (
        <>
          {configModal.nodeData.nodeType === "conversation" && (
            <NodeConfigModal
              isOpen={configModal.isOpen}
              onClose={() =>
                setConfigModal({ isOpen: false, nodeId: null, nodeData: null })
              }
              nodeData={configModal.nodeData}
              onSave={handleSaveNodeConfig}
            />
          )}
          {configModal.nodeData.nodeType === "call-transfer" && (
            <CallTransferConfigModal
              isOpen={configModal.isOpen}
              onClose={() =>
                setConfigModal({ isOpen: false, nodeId: null, nodeData: null })
              }
              nodeData={configModal.nodeData}
              onSave={handleSaveNodeConfig}
            />
          )}
          {configModal.nodeData.nodeType === "press-digit" && (
            <PressDigitConfigModal
              isOpen={configModal.isOpen}
              onClose={() =>
                setConfigModal({ isOpen: false, nodeId: null, nodeData: null })
              }
              nodeData={configModal.nodeData}
              onSave={handleSaveNodeConfig}
            />
          )}
          {configModal.nodeData.nodeType === "function" && (
            <FunctionConfigModal
              isOpen={configModal.isOpen}
              onClose={() =>
                setConfigModal({ isOpen: false, nodeId: null, nodeData: null })
              }
              nodeData={configModal.nodeData}
              onSave={handleSaveNodeConfig}
            />
          )}
        </>
      )}

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}
