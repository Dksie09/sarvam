import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { MessageSquare, X, Play, Plus, Settings } from "lucide-react";

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

  const handleAddTransition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("configureNode", {
      detail: { nodeId: id, nodeData: data },
    });
    window.dispatchEvent(event);
  };

  const hasConfiguredPrompt = data.prompt && data.prompt.trim() !== "";
  const transitions = data.transitions || [];

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
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleConfigure}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <Play className="w-4 h-4 text-gray-400" />
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
