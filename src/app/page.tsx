// "use client";

// import React, { useState, useCallback, useRef, useEffect } from "react";
// import ReactFlow, {
//   Background,
//   Controls,
//   ReactFlowProvider,
//   BackgroundVariant,
//   Node,
//   Edge,
//   addEdge,
//   useNodesState,
//   useEdgesState,
//   Connection,
//   OnConnect,
//   ReactFlowInstance,
//   NodeTypes,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import { Plus } from "lucide-react";
// import { TopMenu } from "@/components/TopMenu";
// import { RightSidebar } from "@/components/RightSidebar";
// import { ConversationNode } from "@/components/nodes/ConversationNode";
// import NodeConfigModal from "@/components/modals/NodeConfigModal";

// const initialNodes: Node[] = [];
// const initialEdges: Edge[] = [];

// // Define custom node types
// const nodeTypes: NodeTypes = {
//   conversation: ConversationNode,
// };

// // Define types for node data
// interface NodeData {
//   id: string;
//   label?: string;
//   prompt?: string;
//   transitions?: string[];
//   aiModel?: string;
//   voice?: string;
//   language?: string;
//   interruptionSensitivity?: number;
//   blacklistedWords?: string[];
//   boostedKeywords?: string[];
//   maxCallDuration?: number;
//   startMode?: "auto" | "manual";
//   agreeToTerms?: boolean;
//   allowEmails?: boolean;
//   strictlyNecessaryCookies?: boolean;
//   functionalCookies?: boolean;
//   welcomeMessage?: string;
//   endingMessage?: string;
//   timeoutMessage?: string;
//   fallbackMessage?: string;
// }

// interface ConfigModalState {
//   isOpen: boolean;
//   nodeId: string | null;
//   nodeData: NodeData | null;
// }

// // Main FlowAuthoringApp with custom nodes and delete functionality
// export default function FlowAuthoringApp() {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
//   const [reactFlowInstance, setReactFlowInstance] =
//     useState<ReactFlowInstance | null>(null);
//   const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
//   const [configModal, setConfigModal] = useState<ConfigModalState>({
//     isOpen: false,
//     nodeId: null,
//     nodeData: null,
//   });
//   const reactFlowWrapper = useRef<HTMLDivElement>(null);

//   const onConnect: OnConnect = useCallback(
//     (params: Connection) => setEdges((eds) => addEdge(params, eds)),
//     [setEdges]
//   );

//   const onInit = useCallback((instance: ReactFlowInstance) => {
//     setReactFlowInstance(instance);
//   }, []);

//   const onSelectionChange = useCallback(
//     ({ nodes: selectedNodes }: { nodes: Node[] }) => {
//       setSelectedNodes(selectedNodes.map((node: Node) => node.id));
//     },
//     []
//   );

//   const onDragOver = useCallback((event: React.DragEvent) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = "move";
//   }, []);

//   const onDrop = useCallback(
//     (event: React.DragEvent) => {
//       event.preventDefault();

//       if (!reactFlowWrapper.current || !reactFlowInstance) {
//         return;
//       }

//       const nodeType = event.dataTransfer.getData("application/reactflow");

//       // Check if the dropped element is a valid node type
//       if (!nodeType) {
//         return;
//       }

//       const position = reactFlowInstance.screenToFlowPosition({
//         x: event.clientX,
//         y: event.clientY,
//       });

//       // Create node based on type
//       const newNode: Node = {
//         id: `${nodeType}-${Date.now()}`,
//         type: nodeType === "conversation" ? "conversation" : "default",
//         position,
//         data: {
//           label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
//           nodeType: nodeType,
//           // Default data for conversation nodes
//           ...(nodeType === "conversation" && {
//             prompt: "", // Start with empty prompt
//             transitions: [], // Start with empty transitions
//           }),
//         },
//       };

//       setNodes((nds) => nds.concat(newNode));
//     },
//     [reactFlowInstance, setNodes]
//   );

//   // Handle center plus button click
//   const handleCenterPlusClick = useCallback(() => {
//     const newNode: Node = {
//       id: `conversation-${Date.now()}`,
//       type: "conversation",
//       position: { x: 250, y: 250 },
//       data: {
//         label: "Conversation Node",
//         nodeType: "conversation",
//         prompt: "", // Start with empty prompt
//         transitions: [], // Start with empty transitions
//       },
//     };
//     setNodes((nds) => nds.concat(newNode));
//   }, [setNodes]);

//   // Handle node deletion
//   const handleDeleteNode = useCallback(
//     (nodeId: string) => {
//       setNodes((nds) => nds.filter((node) => node.id !== nodeId));
//       setEdges((eds) =>
//         eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
//       );
//     },
//     [setNodes, setEdges]
//   );

//   // Handle node configuration
//   const handleConfigureNode = useCallback(
//     (nodeId: string, nodeData: NodeData) => {
//       setConfigModal({
//         isOpen: true,
//         nodeId,
//         nodeData,
//       });
//     },
//     []
//   );

//   // Handle saving node configuration
//   const handleSaveNodeConfig = useCallback(
//     (updatedData: Partial<NodeData>) => {
//       if (configModal.nodeId) {
//         setNodes((nds) =>
//           nds.map((node) =>
//             node.id === configModal.nodeId
//               ? { ...node, data: { ...node.data, ...updatedData } }
//               : node
//           )
//         );
//       }
//       setConfigModal({ isOpen: false, nodeId: null, nodeData: null });
//     },
//     [configModal.nodeId, setNodes]
//   );

//   // Listen for delete and configure events from nodes
//   useEffect(() => {
//     const handleDeleteEvent = (event: CustomEvent) => {
//       handleDeleteNode(event.detail.nodeId);
//     };

//     const handleConfigureEvent = (event: CustomEvent) => {
//       handleConfigureNode(event.detail.nodeId, event.detail.nodeData);
//     };

//     window.addEventListener("deleteNode", handleDeleteEvent as EventListener);
//     window.addEventListener(
//       "configureNode",
//       handleConfigureEvent as EventListener
//     );

//     return () => {
//       window.removeEventListener(
//         "deleteNode",
//         handleDeleteEvent as EventListener
//       );
//       window.removeEventListener(
//         "configureNode",
//         handleConfigureEvent as EventListener
//       );
//     };
//   }, [handleDeleteNode, handleConfigureNode]);

//   // Handle keyboard delete
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (
//         (event.key === "Delete" || event.key === "Backspace") &&
//         selectedNodes.length > 0
//       ) {
//         selectedNodes.forEach((nodeId) => {
//           handleDeleteNode(nodeId);
//         });
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [selectedNodes, handleDeleteNode]);

//   return (
//     <div className="h-screen w-full flex bg-gray-50">
//       {/* Main Content Area (Left side) */}
//       <div className="flex-1 flex flex-col">
//         {/* Top Menu */}
//         <TopMenu />

//         {/* Flow Canvas */}
//         <div className="flex-1 relative" ref={reactFlowWrapper}>
//           <ReactFlowProvider>
//             <ReactFlow
//               nodes={nodes}
//               edges={edges}
//               onNodesChange={onNodesChange}
//               onEdgesChange={onEdgesChange}
//               onConnect={onConnect}
//               onInit={onInit}
//               onDrop={onDrop}
//               onDragOver={onDragOver}
//               onSelectionChange={onSelectionChange}
//               nodeTypes={nodeTypes}
//               className="bg-white"
//               defaultViewport={{ x: 0, y: 0, zoom: 1 }}
//               minZoom={0.1}
//               maxZoom={2}
//               attributionPosition="bottom-left"
//               fitView
//               selectNodesOnDrag={false}
//               multiSelectionKeyCode="Control"
//             >
//               <Background
//                 color="#F5F5F5"
//                 gap={30}
//                 size={5}
//                 variant={BackgroundVariant.Dots}
//               />
//               <Controls
//                 position="bottom-right"
//                 className="bg-white shadow-lg border border-gray-200 rounded-lg"
//               />
//             </ReactFlow>

//             {/* Placeholder message when no nodes */}
//             {nodes.length === 0 && (
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <div className="text-center">
//                   <button
//                     onClick={handleCenterPlusClick}
//                     className="w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4 pointer-events-auto transition-colors"
//                   >
//                     <Plus className="w-8 h-8 text-blue-600" />
//                   </button>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">
//                     Start Building Your Flow
//                   </h3>
//                   <p className="text-gray-500">
//                     Drag nodes from the sidebar or click the plus button
//                   </p>
//                 </div>
//               </div>
//             )}
//           </ReactFlowProvider>
//         </div>
//       </div>

//       {/* Right Sidebar */}
//       <RightSidebar />

//       {/* Node Configuration Modal */}
//       <NodeConfigModal
//         isOpen={configModal.isOpen}
//         onClose={() =>
//           setConfigModal({ isOpen: false, nodeId: null, nodeData: null })
//         }
//         nodeData={configModal.nodeData || { id: "default" }}
//         onSave={handleSaveNodeConfig}
//       />
//     </div>
//   );
// }
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
  Connection,
  OnConnect,
  ReactFlowInstance,
  NodeTypes,
  OnSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus } from "lucide-react";
import { TopMenu } from "@/components/TopMenu";
import { RightSidebar } from "@/components/RightSidebar";
import { ConversationNode } from "@/components/nodes/ConversationNode";
import { FunctionNode } from "@/components/nodes/FunctionNode";
import NodeConfigModal from "@/components/modals/NodeConfigModal";
import FunctionConfigModal from "@/components/modals/FunctionConfigModal";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Define custom node types
const nodeTypes: NodeTypes = {
  conversation: ConversationNode,
  function: FunctionNode,
};

// Main FlowAuthoringApp with custom nodes and delete functionality
export default function FlowAuthoringApp() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Separate modals for different node types
  const [conversationModal, setConversationModal] = useState<{
    isOpen: boolean;
    nodeId: string | null;
    nodeData: any;
  }>({
    isOpen: false,
    nodeId: null,
    nodeData: null,
  });

  const [functionModal, setFunctionModal] = useState<{
    isOpen: boolean;
    nodeId: string | null;
    nodeData: any;
  }>({
    isOpen: false,
    nodeId: null,
    nodeData: null,
  });

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const onSelectionChange: OnSelectionChange = useCallback(
    ({ nodes: selectedNodes }) => {
      setSelectedNodes(selectedNodes.map((node) => node.id));
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

      // Check if the dropped element is a valid node type
      if (!nodeType) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create node based on type
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type:
          nodeType === "conversation"
            ? "conversation"
            : nodeType === "function"
            ? "function"
            : "default",
        position,
        data: {
          label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
          nodeType: nodeType,
          // Default data for conversation nodes
          ...(nodeType === "conversation" && {
            prompt: "",
            transitions: [],
          }),
          // Default data for function nodes
          ...(nodeType === "function" && {
            language: "javascript",
            code: "",
            timeout: 30,
            retryCount: 0,
            onFailAction: "stop",
            isConfigured: false,
          }),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Handle center plus button click
  const handleCenterPlusClick = useCallback(() => {
    const newNode: Node = {
      id: `conversation-${Date.now()}`,
      type: "conversation",
      position: { x: 250, y: 250 },
      data: {
        label: "Conversation Node",
        nodeType: "conversation",
        prompt: "",
        transitions: [],
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

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

  // Handle node configuration - route to correct modal based on node type
  const handleConfigureNode = useCallback((nodeId: string, nodeData: any) => {
    const nodeType = nodeData.nodeType;

    if (nodeType === "conversation") {
      setConversationModal({
        isOpen: true,
        nodeId,
        nodeData,
      });
    } else if (nodeType === "function") {
      setFunctionModal({
        isOpen: true,
        nodeId,
        nodeData,
      });
    }
  }, []);

  // Handle saving conversation node configuration
  const handleSaveConversationConfig = useCallback(
    (updatedData: any) => {
      if (conversationModal.nodeId) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === conversationModal.nodeId
              ? { ...node, data: { ...node.data, ...updatedData } }
              : node
          )
        );
      }
      setConversationModal({ isOpen: false, nodeId: null, nodeData: null });
    },
    [conversationModal.nodeId, setNodes]
  );

  // Handle saving function node configuration
  const handleSaveFunctionConfig = useCallback(
    (updatedData: any) => {
      if (functionModal.nodeId) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === functionModal.nodeId
              ? { ...node, data: { ...node.data, ...updatedData } }
              : node
          )
        );
      }
      setFunctionModal({ isOpen: false, nodeId: null, nodeData: null });
    },
    [functionModal.nodeId, setNodes]
  );

  // Listen for delete and configure events from nodes
  useEffect(() => {
    const handleDeleteEvent = (event: CustomEvent) => {
      handleDeleteNode(event.detail.nodeId);
    };

    const handleConfigureEvent = (event: CustomEvent) => {
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

  // Handle keyboard delete
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

  return (
    <div className="h-screen w-full flex bg-gray-50">
      {/* Main Content Area (Left side) */}
      <div className="flex-1 flex flex-col">
        {/* Top Menu */}
        <TopMenu />

        {/* Flow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              className="bg-white"
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.1}
              maxZoom={2}
              attributionPosition="bottom-left"
              fitView
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
                className="bg-white shadow-lg border border-gray-200 rounded-lg"
              />
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

      {/* Conversation Node Configuration Modal */}
      <NodeConfigModal
        isOpen={conversationModal.isOpen}
        onClose={() =>
          setConversationModal({ isOpen: false, nodeId: null, nodeData: null })
        }
        nodeData={conversationModal.nodeData || {}}
        onSave={handleSaveConversationConfig}
      />

      {/* Function Node Configuration Modal */}
      <FunctionConfigModal
        isOpen={functionModal.isOpen}
        onClose={() =>
          setFunctionModal({ isOpen: false, nodeId: null, nodeData: null })
        }
        nodeData={functionModal.nodeData || {}}
        onSave={handleSaveFunctionConfig}
      />
    </div>
  );
}
