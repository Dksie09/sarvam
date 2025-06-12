import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  MessageSquare,
  X,
  Play,
  Plus,
  Settings,
  AlertTriangle,
} from "lucide-react";

interface ConversationNodeData {
  label: string;
  nodeType: string;
  prompt?: string;
  transitions?: string[];
  aiModel?: string;
  voice?: string;
  language?: string;
  isLoading?: boolean;
  isCompleted?: boolean;
  isError?: boolean;
  errorMessage?: string;
  lastTestResult?: "success" | "error" | "pending" | null;
}

export const ConversationNode: React.FC<NodeProps<ConversationNodeData>> = ({
  data,
  selected,
  id,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("deleteNode", { detail: { nodeId: id } });
    window.dispatchEvent(event);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("configureNode", {
      detail: { nodeId: id, nodeData: data },
    });
    window.dispatchEvent(event);
  };
  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("configureNode", {
      detail: { nodeId: id, nodeData: data },
    });
    window.dispatchEvent(event);
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.isError) {
      // Reset state when clicking cross icon
      const event = new CustomEvent("nodeRun", {
        detail: {
          nodeId: id,
          reset: true,
        },
      });
      window.dispatchEvent(event);
    } else {
      const event = new CustomEvent("nodeRun", { detail: { nodeId: id } });
      window.dispatchEvent(event);
    }
  };

  const handleAddTransition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("configureNode", {
      detail: { nodeId: id, nodeData: data },
    });
    window.dispatchEvent(event);
  };

  const hasConfiguredPrompt = data.prompt && data.prompt.trim() !== "";
  const transitions = data.transitions || [];

  const getRunButtonIcon = () => {
    if (data.isLoading) {
      return (
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      );
    }
    if (data.isCompleted) {
      return (
        <div className="w-4 h-4 text-green-500 flex items-center justify-center">
          ✓
        </div>
      );
    }
    if (data.isError) {
      return (
        <div className="w-4 h-4 text-red-500 flex items-center justify-center">
          ✕
        </div>
      );
    }
    return <Play className="w-4 h-4 text-gray-400" />;
  };

  const getTestResultIcon = () => {
    switch (data.lastTestResult) {
      case "success":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "error":
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case "pending":
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg border-2 shadow-sm min-w-[280px] max-w-[320px] transition-all cursor-pointer ${
        selected
          ? "border-pink-500 shadow-lg ring-2 ring-pink-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {data.isLoading && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-20">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {data.isCompleted && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg z-20 text-xs animate-tick">
          ✓
        </div>
      )}
      {/* Delete button - only show when selected */}
      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-pink-50 rounded-lg">
            <MessageSquare className="w-4 h-4 text-pink-600" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-900">
              {data.label || "Conversation Node"}
            </span>
            {getTestResultIcon()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleConfigure}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleRun}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {getRunButtonIcon()}
          </button>
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3">
        {/* Prompt Preview */}
        <div className="">
          {hasConfiguredPrompt ? (
            <p className="text-sm text-gray-700 line-clamp-3 border rounded-lg border-pink-200 p-2">
              {data.prompt!.length > 120
                ? `${data.prompt!.substring(0, 120)}...`
                : data.prompt}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Double click to configure
            </p>
          )}
        </div>

        {/* Error Message */}
        {data.isError && data.errorMessage && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-red-700">
                Configuration Error
              </span>
            </div>
            <p className="text-xs text-red-600 truncate">{data.errorMessage}</p>
          </div>
        )}

        {/* Transitions Section - Only show if node is configured */}
        {hasConfiguredPrompt && (
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transitions
              </span>
              <button
                onClick={handleAddTransition}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            {/* Show transitions if they exist, otherwise show empty state */}
            <div className="space-y-1.5">
              {transitions.length > 0 ? (
                transitions.map((transition, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded border relative"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                    <span className="truncate flex-1">{transition}</span>

                    {/* Individual Handle for each transition */}
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`transition-${index}`}
                      className="!w-3 !h-3 !bg-pink-500 !border-2 !border-white !relative !transform-none !right-0 !top-0"
                      style={{
                        position: "absolute",
                        right: -6,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 p-2 text-center">
                  No transitions added yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration indicators */}
        {(data.aiModel || data.voice || data.language) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1 text-xs">
              {data.aiModel && (
                <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded">
                  {data.aiModel}
                </span>
              )}
              {data.voice && (
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                  {data.voice}
                </span>
              )}
              {data.language && (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                  {data.language}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
        style={{ left: -6 }}
      />
    </div>
  );
};
