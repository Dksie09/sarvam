import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { PhoneOff, X } from "lucide-react";

interface EndCallNodeData {
  label: string;
  nodeType: string;
  isLoading?: boolean;
  isCompleted?: boolean;
}

export const EndCallNode: React.FC<NodeProps<EndCallNodeData>> = ({
  data,
  selected,
  id,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("deleteNode", { detail: { nodeId: id } });
    window.dispatchEvent(event);
  };

  return (
    <div
      className={`relative bg-white rounded-lg border-2 shadow-sm w-[80px] h-[80px] flex items-center justify-center transition-all cursor-pointer ${
        selected
          ? "border-red-500 shadow-lg ring-2 ring-red-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Delete button - only show when selected */}
      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Node Content */}
      <div className="flex flex-col items-center gap-1">
        <div className="p-1.5 bg-red-50 rounded-lg">
          <PhoneOff className="w-4 h-4 text-red-600" />
        </div>
        <span className="text-xs font-medium text-gray-900">
          {data.label || "End"}
        </span>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-gray-400 !border-2 !border-white"
        style={{ left: -5 }}
      />
    </div>
  );
};
