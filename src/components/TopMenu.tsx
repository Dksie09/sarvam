"use client";
import {
  ArrowLeft,
  Play,
  Save,
  Settings,
  MoreVertical,
  Pen,
  ArrowRight,
  Trash2,
  BarChart3,
  Loader2,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Node, Edge } from "reactflow";

interface TopMenuProps {
  nodes: Node[];
  edges: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

export const TopMenu = ({ nodes, edges, onSave }: TopMenuProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [flowName, setFlowName] = useState("Untitled Flow");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("flowName");
      if (savedName) setFlowName(savedName);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flowName", flowName);
    }
  }, [flowName]);

  const handleRename = () => {
    setIsRenaming(false);
  };

  const handleTestFlow = () => {
    if (isTesting) return;

    setIsTesting(true);
    // Find the start node by its ID
    const startNode = document.querySelector('[data-id="start-node"]');
    if (startNode) {
      // Create and dispatch a custom event with the node ID
      const event = new CustomEvent("startNodeClick", {
        detail: { nodeId: "start-node" },
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Listen for flow completion
      const handleFlowComplete = (e: CustomEvent) => {
        if (e.detail.success) {
          toast.success("Flow test completed successfully!");

          // Additional end node check after flow completion
          setTimeout(() => {
            const hasEndNode = Array.from(
              document.querySelectorAll(".react-flow__node")
            ).some(
              (node: Element) => node.getAttribute("data-type") === "end-call"
            );
            if (hasEndNode) {
              toast.success("End node is present in the flow!");
            } else {
              toast.error("Warning: No end node found in the flow!");
            }
          }, 1000);
        } else {
          toast.error("Flow test failed!");
        }
        setIsTesting(false);
        window.removeEventListener(
          "flowComplete",
          handleFlowComplete as EventListener
        );
      };

      window.addEventListener(
        "flowComplete",
        handleFlowComplete as EventListener
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save flow state to localStorage
      const flowState = {
        nodes,
        edges,
        flowName,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem("flowState", JSON.stringify(flowState));

      // Call onSave callback if provided
      if (onSave) {
        onSave(nodes, edges);
      }

      setIsSaved(true);
      toast.success("Flow saved successfully!");
    } catch (error) {
      toast.error("Failed to save flow");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
      // Reset saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Flows</span>
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <div className="flex items-end gap-3">
          {isRenaming ? (
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="h-7 w-48"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">
                {flowName}
              </h1>
              <button
                onClick={() => setIsRenaming(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Pen className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-[2px]">Flow Editor</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSaved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Save</span>
        </button>

        <button
          onClick={handleTestFlow}
          disabled={isTesting}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isTesting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {isTesting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isTesting ? "Running..." : "Test Flow"}
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart3 className="w-4 h-4 mr-2" />
              Stats for Nerds
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4" />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              Publish
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2 " />
              Delete all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
