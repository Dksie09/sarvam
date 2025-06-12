import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HelpCircle,
  MousePointer,
  Keyboard,
  Trash2,
  Settings,
} from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELP_TIPS = [
  {
    icon: MousePointer,
    title: "Node Interaction",
    tips: [
      "Double click on a node to open its settings",
      "Click and drag nodes to move them",
      "Click and drag from node handles to create connections",
    ],
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    tips: [
      "Hold Shift and drag to select multiple nodes",
      "Press Delete to remove selected nodes or connections",
      "Use arrow keys to nudge selected nodes",
    ],
  },
  {
    icon: Trash2,
    title: "Deleting Elements",
    tips: [
      "Select nodes/connections and press Delete key",
      "Click the delete button on a node",
      "Click the X on a connection to remove it",
    ],
  },
  {
    icon: Settings,
    title: "Configuration",
    tips: [
      "Configure node behavior in the settings panel",
      "Test node functionality using the test panel",
      "Save your changes to apply them",
    ],
  },
];

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Flow Editor Help
          </DialogTitle>
          <DialogDescription>
            Learn how to use the flow editor effectively
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {HELP_TIPS.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <section.icon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium">{section.title}</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
