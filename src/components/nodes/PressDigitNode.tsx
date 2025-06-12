import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Hash, X, Play, Settings, AlertTriangle, Clock } from "lucide-react";

interface DigitMapping {
  digit: string;
  label: string;
  color: string;
}

interface PressDigitNodeData {
  label: string;
  nodeType: string;
  instructions?: string;
  validDigits?: string[];
  digitMappings?: DigitMapping[];
  maxAttempts?: number;
  pauseDetectionDelay?: number;
  interDigitTimeout?: number;
  totalInputTimeout?: number;
  invalidInputMessage?: string;
  timeoutMessage?: string;
  repeatInstructions?: boolean;
  dtmfSensitivity?: number;
  isConfigured?: boolean;
  lastTestResult?: "success" | "error" | "pending" | null;
  errorMessage?: string;
  isLoading?: boolean;
  isCompleted?: boolean;
  isError?: boolean;
}

export const PressDigitNode: React.FC<NodeProps<PressDigitNodeData>> = ({
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

  const isConfigured =
    data.instructions &&
    data.instructions.trim() !== "" &&
    data.digitMappings &&
    data.digitMappings.length > 0;
  const digitMappings = data.digitMappings || [];

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
          ? "border-sky-500 shadow-lg ring-2 ring-sky-200"
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
          <div className="p-1.5 bg-sky-50 rounded-lg">
            <Hash className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {data.label || "Press Digit"}
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
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <Play className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3">
        {/* Configuration Status */}
        {isConfigured && data.pauseDetectionDelay && (
          <div className="mb-3 flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded border bg-sky-50 text-sky-700 border-sky-200">
              <Clock className="w-3 h-3 inline mr-1" />
              {data.pauseDetectionDelay}s pause detection
            </span>
            {data.maxAttempts && (
              <span className="px-2 py-1 text-xs font-medium rounded border bg-gray-50 text-gray-700 border-gray-200">
                {data.maxAttempts} attempts max
              </span>
            )}
          </div>
        )}

        {/* Instructions Preview */}
        <div className="">
          {!isConfigured && (
            <p className="text-sm text-gray-400 italic">
              Double click to configure digit input
            </p>
          )}
        </div>

        {/* Error Message */}
        {data.lastTestResult === "error" && data.errorMessage && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-red-700">
                Configuration Error
              </span>
            </div>
            <p className="text-xs text-red-600 truncate">{data.errorMessage}</p>
          </div>
        )}

        {/* Individual Digit Outputs */}
        {isConfigured && digitMappings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Digit Options
              </span>
              <span className="text-xs text-gray-500">
                {digitMappings.length} configured
              </span>
            </div>

            <div className="space-y-1.5">
              {digitMappings.map((mapping) => (
                <div
                  key={mapping.digit}
                  className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-sky-50 rounded border relative"
                >
                  <div className="w-5 h-5 rounded bg-sky-100 flex items-center justify-center font-mono font-bold text-sky-700 flex-shrink-0">
                    {mapping.digit}
                  </div>
                  <span className="truncate flex-1">
                    {mapping.label.length > 20
                      ? `${mapping.label.substring(0, 20)}...`
                      : mapping.label}
                  </span>

                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`digit-${mapping.digit}`}
                    className="!w-3 !h-3 !bg-sky-500 !border-2 !border-white !relative !transform-none !right-0 !top-0"
                    style={{
                      position: "absolute",
                      right: -6,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
              ))}
              {data.validDigits && data.validDigits.includes("any") && (
                <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-sky-50 rounded border relative">
                  <div className="w-5 h-5 rounded bg-sky-100 flex items-center justify-center font-mono font-bold text-sky-700 flex-shrink-0">
                    *
                  </div>
                  <span className="truncate flex-1">Any other digit</span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id="digit-any"
                    className="!w-3 !h-3 !bg-sky-500 !border-2 !border-white !relative !transform-none !right-0 !top-0"
                    style={{
                      position: "absolute",
                      right: -6,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
              )}
              {/* Not Responded Connection */}
              <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-red-50 rounded border relative">
                <div className="w-5 h-5 rounded bg-red-100 flex items-center justify-center font-mono font-bold text-red-700 flex-shrink-0">
                  ⏱
                </div>
                <span className="truncate flex-1">Not Responded</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="not-responded"
                  className="!w-3 !h-3 !bg-red-500 !border-2 !border-white !relative !transform-none !right-0 !top-0"
                  style={{
                    position: "absolute",
                    right: -6,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Configuration indicators */}
        {(data.invalidInputMessage || data.timeoutMessage) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1 text-xs">
              {data.invalidInputMessage && (
                <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                  Invalid Input Msg
                </span>
              )}
              {data.timeoutMessage && (
                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                  Timeout Msg
                </span>
              )}
              {data.repeatInstructions && (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                  Repeat Instructions
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
