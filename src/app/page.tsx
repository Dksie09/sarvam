"use client";

import React from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  BackgroundVariant,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus } from "lucide-react";
import { TopMenu } from "@/components/TopMenu";
import { RightSidebar } from "@/components/RightSidebar";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Main FlowAuthoringApp with updated layout
export default function FlowAuthoringApp() {
  return (
    <div className="h-screen w-full flex bg-gray-50">
      {/* Main Content Area (Left side) */}
      <div className="flex-1 flex flex-col">
        {/* Top Menu - now only spans the left area */}
        <TopMenu />

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              className="bg-white"
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.1}
              maxZoom={2}
              attributionPosition="bottom-left"
            >
              <Background
                color="#F5F5F5"
                gap={30}
                size={5}
                variant={BackgroundVariant.Dots}
              />
              <Controls
                position="bottom-right"
                className="bg-white shadow-lg border border-gray-200 rounded-lg"
              />
            </ReactFlow>

            {/* Placeholder message when no nodes */}
            {initialNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Building Your Flow
                  </h3>
                  <p className="text-gray-500">
                    Drag nodes from the sidebar to get started
                  </p>
                </div>
              </div>
            )}
          </ReactFlowProvider>
        </div>
      </div>

      {/* Right Sidebar - now takes full height */}
      <RightSidebar />
    </div>
  );
}
