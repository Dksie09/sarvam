import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  PhoneCall,
  X,
  Play,
  Settings,
  Phone,
  AlertTriangle,
  User,
} from "lucide-react";

interface CallTransferNodeData {
  label: string;
  nodeType: string;
  transferType?: "warm" | "cold" | "blind";
  destination?: string;
  destinationType?: "phone" | "extension" | "department" | "agent";
  transferMessage?: string;
  waitTime?: number;
  timeout?: number;
  fallbackAction?: "retry" | "end" | "continue";
  priority?: "high" | "medium" | "low";
  recordingAction?: "continue" | "stop" | "pause";
  isConfigured?: boolean;
  lastTestResult?: "success" | "error" | "pending" | null;
  errorMessage?: string;
  isLoading?: boolean;
  isCompleted?: boolean;
  isError?: boolean;
}

export const CallTransferNode: React.FC<NodeProps<CallTransferNodeData>> = ({
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

  const isConfigured = data.destination && data.destination.trim() !== "";

  const getTransferTypeColor = (type: string) => {
    switch (type) {
      case "warm":
        return "bg-green-50 text-green-700 border-green-200";
      case "cold":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "blind":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getDestinationIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className="w-3 h-3" />;
      case "extension":
        return <span className="text-xs font-bold">#</span>;
      case "department":
        return <User className="w-3 h-3" />;
      case "agent":
        return <User className="w-3 h-3" />;
      default:
        return <Phone className="w-3 h-3" />;
    }
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
          ? "border-orange-500 shadow-lg ring-2 ring-orange-200"
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
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <PhoneCall className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {data.label || "Call Transfer"}
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
        {/* Transfer Type Badge */}
        {isConfigured && data.transferType && (
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${getTransferTypeColor(
                data.transferType
              )}`}
            >
              {data.transferType === "warm"
                ? "Warm Transfer"
                : data.transferType === "cold"
                ? "Cold Transfer"
                : "Blind Transfer"}
            </span>
            {data.priority && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded border ${
                  data.priority === "high"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : data.priority === "medium"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {data.priority} priority
              </span>
            )}
          </div>
        )}

        {/* Destination Preview */}
        <div className="">
          {isConfigured ? (
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2">
                {getDestinationIcon(data.destinationType || "phone")}
                <span className="text-xs font-medium text-orange-700">
                  Transfer to {data.destinationType || "Phone"}
                </span>
              </div>

              {data.transferMessage && (
                <div className="mt-2 text-xs text-orange-600">
                  &quot;
                  {data.transferMessage.length > 80
                    ? `${data.transferMessage.substring(0, 80)}...`
                    : data.transferMessage}
                  &quot;
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Double click to configure
            </p>
          )}
        </div>

        {/* Additional configuration details */}
        {isConfigured && (
          <div className="space-y-2 mt-1">
            {data.waitTime && data.waitTime > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  {/* <Clock className="w-3 h-3" /> */}
                  Wait time:
                </span>
                <span className="font-medium">{data.waitTime}s</span>
              </div>
            )}
            {data.timeout && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Timeout:</span>
                <span className="font-medium">{data.timeout}s</span>
              </div>
            )}
            {data.recordingAction && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Recording:</span>
                <span className="font-medium capitalize">
                  {data.recordingAction}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Success/Failure Outputs */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>Outputs</span>
              <span>Success / Failure</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-green-50 rounded border relative">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                <span className="flex-1">On Success</span>
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
              <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-red-50 rounded border relative">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></div>
                <span className="flex-1">On Failure</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="failure"
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
        </div>
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
