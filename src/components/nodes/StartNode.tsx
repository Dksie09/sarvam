import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Play, X } from "lucide-react";

interface StartNodeData {
  label: string;
  nodeType: string;
}

export const StartNode: React.FC<NodeProps<StartNodeData>> = ({
  data,
  selected,
  id,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("deleteNode", { detail: { nodeId: id } });
    window.dispatchEvent(event);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent("startNodeClick", { detail: { nodeId: id } });
    window.dispatchEvent(event);
  };

  return (
    <div
      className={`relative bg-white rounded-lg border-2 shadow-sm w-[80px] h-[80px] flex items-center justify-center transition-all ${
        selected
          ? "border-green-500 shadow-lg ring-2 ring-green-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Delete button - only show when selected */}
      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Node Content */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleClick}
          className="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 text-green-600" />
        </button>
        <span className="text-xs font-medium text-gray-900">
          {data.label || "Start"}
        </span>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-gray-400 !border-2 !border-white"
        style={{ right: -5 }}
      />
    </div>
  );
};
