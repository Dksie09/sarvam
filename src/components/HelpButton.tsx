import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import HelpModal from "./modals/HelpModal";

export default function HelpButton() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHoverCard, setShowHoverCard] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Hover Card */}
      {showHoverCard && (
        <div className="absolute bottom-16 left-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 mb-2">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">Quick Tips:</p>
            <ul className="space-y-1">
              <li>• Double click nodes to configure</li>
              <li>• Shift + drag to select multiple</li>
              <li>• Delete key to remove selected node</li>
            </ul>
            <button
              onClick={() => setShowHelpModal(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Click to view →
            </button>
          </div>
        </div>
      )}

      {/* Help Button */}
      <button
        onClick={() => setShowHelpModal(true)}
        onMouseEnter={() => setShowHoverCard(true)}
        onMouseLeave={() => setShowHoverCard(false)}
        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg rounded-full transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
