"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BoxIcon,
  Search,
  MessageSquare,
  Zap,
  PhoneCall,
  Hash,
  PhoneOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Separator } from "./ui/separator";

interface Node {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category?: string;
}

// Draggable Node Component
const DraggableNode = ({ node }: { node: Node }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      key={node.id}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing group border border-transparent hover:border-gray-200 transition-all"
      draggable
      onDragStart={(event) => onDragStart(event, node.id)}
    >
      <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
        <node.icon className={`w-4 h-4 ${node.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 mb-1">{node.name}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          {node.description}
        </p>
      </div>
      {/* Drag indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-0.5">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Updated RightSidebar component
export const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("mobile");
        setIsCollapsed(true);
      } else if (width < 1024) {
        setScreenSize("tablet");
        setIsCollapsed(true);
      } else {
        setScreenSize("desktop");
        setIsCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const actionNodes: Node[] = [
    {
      id: "conversation",
      name: "Conversation",
      description: "Define prompt and transition conditions",
      icon: MessageSquare,
      color: "text-pink-600",
      category: "start",
    },
    {
      id: "function",
      name: "Function Execution",
      description: "Define and execute a custom function",
      icon: Zap,
      color: "text-purple-600",
      category: "process",
    },
    {
      id: "call-transfer",
      name: "Call Transfer ",
      description: "Trigger a call transfer",
      icon: PhoneCall,
      color: "text-orange-500",
      category: "process",
    },
    {
      id: "press-digit",
      name: "Press Digit ",
      description: "Configure digit press instructions",
      icon: Hash,
      color: "text-sky-500",
      category: "process",
    },
    {
      id: "end-call",
      name: "End Call ",
      description: "Marks the termination of the flow",
      icon: PhoneOff,
      color: "text-green-600",
      category: "end",
    },
  ];

  // Add triggerNodes array
  const triggerNodes: Node[] = [
    {
      id: "start",
      name: "Start",
      description: "Starting point of your flow",
      icon: BoxIcon,
      color: "text-blue-600",
      category: "trigger",
    },
  ];

  const filterNodes = (nodes: Node[]) => {
    if (!searchQuery) return nodes;
    return nodes.filter(
      (node) =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const groupNodesByCategory = (nodes: Node[]) => {
    const filteredNodes = filterNodes(nodes);
    const grouped = filteredNodes.reduce((acc, node) => {
      const category = node.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(node);
      return acc;
    }, {} as Record<string, Node[]>);

    return grouped;
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-80"
      } bg-white border-l border-gray-200 shadow-sm h-full flex flex-col transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <BoxIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Add node</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {isCollapsed ? (
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4 px-2">
            {[...triggerNodes, ...actionNodes].map((node) => (
              <div
                key={node.id}
                className="p-2 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing group border border-transparent hover:border-gray-200 transition-all"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("application/reactflow", node.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                title={`${node.name} - ${node.description}`}
              >
                <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <node.icon className={`w-4 h-4 ${node.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <Tabs defaultValue="actions" className="flex-1 flex flex-col mt-2">
            <TabsList className="mx-4 w-[290px]">
              <TabsTrigger value="triggers" className="w-full">
                Triggers
              </TabsTrigger>
              <TabsTrigger value="actions" className="w-full">
                Actions
              </TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <Separator />

            {/* Search */}
            <div className="p-4 pb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search"
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="triggers" className="mt-0 p-4">
                <div className="space-y-5">
                  {Object.entries(groupNodesByCategory(triggerNodes)).map(
                    ([category, nodes]) => (
                      <div key={category} className="space-y-1">
                        <h3 className="text-xs font-medium font-bold text-gray-400 uppercase tracking-wider px-1">
                          {category}
                        </h3>
                        {nodes.map((node) => (
                          <DraggableNode key={node.id} node={node} />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-0 p-4">
                <div className="space-y-5">
                  {Object.entries(groupNodesByCategory(actionNodes)).map(
                    ([category, nodes]) => (
                      <div key={category} className="space-y-1">
                        <h3 className="text-xs font-medium font-bold text-gray-400 uppercase tracking-wider px-1">
                          {category}
                        </h3>
                        {nodes.map((node) => (
                          <DraggableNode key={node.id} node={node} />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-0 p-4">
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <BoxIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Coming Soon
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Custom nodes will be available soon
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Fixed warning at bottom */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              💡 Double click on the node to open its settings
            </p>
          </div>
        </>
      )}
    </div>
  );
};
