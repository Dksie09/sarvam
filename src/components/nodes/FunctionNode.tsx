import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Zap, X, Play, Settings, Code, AlertTriangle } from "lucide-react";

interface FunctionNodeData {
  label: string;
  nodeType: string;
  language?: "javascript" | "python" | "cURL";
  code?: string;
  timeout?: number;
  retryCount?: number;
  onFailAction?: "stop" | "retry" | "continue";
  isConfigured?: boolean;
  lastTestResult?: "success" | "error" | "pending" | null;
  errorMessage?: string;
  isRetrying?: boolean;
  currentRetryAttempt?: number;
}

export const FunctionNode: React.FC<NodeProps<FunctionNodeData>> = ({
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

  const isConfigured = data.code && data.code.trim() !== "";
  const language = data.language || "javascript";

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "javascript":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "python":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "curl":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTestResultIcon = () => {
    if (data.isRetrying) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-yellow-600">
            Retry {data.currentRetryAttempt || 1}
          </span>
        </div>
      );
    }

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
          ? "border-purple-500 shadow-lg ring-2 ring-purple-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Delete button - only show when selected */}
      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 rounded-lg">
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {data.label || "Function Node"}
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
        {/* Language Badge */}
        {isConfigured && (
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${getLanguageColor(
                language
              )}`}
            >
              {language === "javascript"
                ? "JavaScript"
                : language === "python"
                ? "Python"
                : "cURL"}
            </span>
            <span className="text-xs text-gray-500">
              {data.timeout ? `${data.timeout}s timeout` : "No timeout"}
            </span>
          </div>
        )}

        {/* Code Preview */}
        <div className="">
          {isConfigured ? (
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">
                  Code Preview
                </span>
              </div>
              <pre className="text-xs text-gray-700 font-mono leading-relaxed overflow-hidden">
                {data.code!.length > 100
                  ? `${data.code!.substring(0, 100)}...`
                  : data.code}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Double click to configure
            </p>
          )}
        </div>

        {/* Error Message */}
        {data.lastTestResult === "error" && data.errorMessage && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-red-700">
                Last Test Failed
              </span>
            </div>
            <p className="text-xs text-red-600 truncate">{data.errorMessage}</p>
          </div>
        )}

        {/* Success/Failure Outputs */}
        {isConfigured && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1.5">
              {/* Success Output */}
              <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-green-50 rounded border relative">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="truncate flex-1">On Success</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="success"
                  className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !relative !transform-none !right-0 !top-0"
                  style={{
                    position: "absolute",
                    right: -6,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>

              {/* Error Output */}
              <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-red-50 rounded border relative">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="truncate flex-1">On Error</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="error"
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
