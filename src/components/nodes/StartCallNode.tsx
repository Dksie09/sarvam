import { X } from "lucide-react";
import { NodeProps } from "reactflow";

interface StartCallData {
  label: string;
  nodeType: string;
  isLoading?: boolean;
  isCompleted?: boolean;
}

export default function StartCallNode({
  data,
  selected,
}: NodeProps<StartCallData>) {
  const handleDelete = () => {
    // Delete functionality will be handled by the parent component
  };

  return (
    <div className="relative">
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex items-center">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-500">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold">{data.label}</div>
            <div className="text-gray-500">Start Call</div>
          </div>
        </div>
      </div>

      {/* Delete button - only show when selected, and adjust position if animating */}
      {selected && (
        <button
          onClick={handleDelete}
          className={`absolute w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10 ${
            data.isLoading || data.isCompleted
              ? "top-2 left-2"
              : "-top-2 -left-2"
          }`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
