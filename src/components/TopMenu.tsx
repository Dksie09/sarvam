import { ArrowLeft, Play, Save, Settings } from "lucide-react";

export const TopMenu = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Flows</span>
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Flow Editor</h1>
          <p className="text-sm text-gray-500">Untitled Flow</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>

        <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all">
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">Save</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all">
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">Test Flow</span>
        </button>
      </div>
    </div>
  );
};
