import React, { useState, useEffect } from "react";
import { Hash, Trash2, Volume2, Clock, Pen, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface DigitMapping {
  digit: string;
  label: string;
  color: string;
}

interface PressDigitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    id: string;
    label?: string;
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
    lastTestResult?: "success" | "error" | "pending" | null;
    errorMessage?: string;
  };
  onSave: (data: PressDigitConfigModalProps["nodeData"]) => void;
}

const TEMPLATES = [
  {
    name: "Yes/No",
    mappings: [
      { digit: "1", label: "Yes", color: "bg-green-500" },
      { digit: "2", label: "No", color: "bg-red-500" },
    ],
  },
  {
    name: "1-4 Options",
    mappings: [
      { digit: "1", label: "Option 1", color: "bg-blue-500" },
      { digit: "2", label: "Option 2", color: "bg-green-500" },
      { digit: "3", label: "Option 3", color: "bg-orange-500" },
      { digit: "4", label: "Option 4", color: "bg-purple-500" },
    ],
  },
  {
    name: "Rating Scale",
    mappings: [
      { digit: "1", label: "Poor", color: "bg-red-500" },
      { digit: "2", label: "Fair", color: "bg-orange-500" },
      { digit: "3", label: "Good", color: "bg-yellow-500" },
      { digit: "4", label: "Very Good", color: "bg-green-400" },
      { digit: "5", label: "Excellent", color: "bg-green-500" },
    ],
  },
];

const AVAILABLE_DIGITS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "#",
];

export default function PressDigitConfigModal({
  isOpen,
  onClose,
  nodeData,
  onSave,
}: PressDigitConfigModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    instructions: "",
    digitMappings: [] as DigitMapping[],
    maxAttempts: 3,
    pauseDetectionDelay: 2,
    interDigitTimeout: 5,
    totalInputTimeout: 30,
    invalidInputMessage: "",
    timeoutMessage: "",
    repeatInstructions: true,
    dtmfSensitivity: 50,
  });

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState("");

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData({
        label: nodeData.label || "Press Digit Node",
        instructions: nodeData.instructions || "",
        digitMappings: nodeData.digitMappings || [],
        maxAttempts: nodeData.maxAttempts || 3,
        pauseDetectionDelay: nodeData.pauseDetectionDelay || 1000,
        interDigitTimeout: nodeData.interDigitTimeout || 5000,
        totalInputTimeout: nodeData.totalInputTimeout || 30000,
        invalidInputMessage:
          nodeData.invalidInputMessage || "Invalid input. Please try again.",
        timeoutMessage:
          nodeData.timeoutMessage || "No input received. Please try again.",
        repeatInstructions: nodeData.repeatInstructions || false,
        dtmfSensitivity: nodeData.dtmfSensitivity || 50,
      });
      setTempLabel(nodeData.label || "Press Digit Node");
    }
  }, [isOpen, nodeData]);

  // Auto-save when form data changes
  useEffect(() => {
    if (isOpen && nodeData) {
      onSave({ ...nodeData, ...formData });
    }
  }, [formData, isOpen, nodeData, onSave]);

  const handleLoadTemplate = (template: (typeof TEMPLATES)[0]) => {
    setFormData((prev) => ({
      ...prev,
      digitMappings: [...template.mappings],
      instructions: `Please press ${template.mappings
        .map((m) => `${m.digit} for ${m.label}`)
        .join(", ")}.`,
    }));
  };

  const handleToggleDigit = (digit: string) => {
    const existingIndex = formData.digitMappings.findIndex(
      (m) => m.digit === digit
    );

    if (existingIndex >= 0) {
      // Remove digit
      setFormData((prev) => ({
        ...prev,
        digitMappings: prev.digitMappings.filter((_, i) => i !== existingIndex),
        instructions: prev.digitMappings.length === 1 ? "" : prev.instructions,
      }));
    } else {
      // Add digit with default label
      setFormData((prev) => {
        const newMappings = [
          ...prev.digitMappings,
          {
            digit,
            label: "",
            color: "bg-blue-500",
          },
        ];
        return {
          ...prev,
          digitMappings: newMappings,
          instructions:
            prev.instructions ||
            `Please press ${newMappings
              .map((m) => `${m.digit} for ${m.label || "Option " + m.digit}`)
              .join(", ")}.`,
        };
      });
    }
  };

  const handleUpdateMapping = (
    index: number,
    field: "digit" | "label",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      digitMappings: prev.digitMappings.map((mapping, i) =>
        i === index ? { ...mapping, [field]: value } : mapping
      ),
    }));
  };

  const handleRemoveMapping = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      digitMappings: prev.digitMappings.filter((_, i) => i !== index),
    }));
  };

  const handleLabelSave = () => {
    const updatedData = { ...formData, label: tempLabel };
    setFormData(updatedData);
    setIsEditingLabel(false);
  };

  const handleSave = () => {
    const updatedData = {
      ...nodeData,
      ...formData,
      validDigits: formData.digitMappings.map((m) => m.digit),
      isConfigured:
        formData.instructions.trim() !== "" &&
        formData.digitMappings.length > 0,
    };
    onSave(updatedData);
    onClose();
  };

  const isDigitSelected = (digit: string) => {
    return formData.digitMappings.some((m) => m.digit === digit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-[700px] max-h-[85vh] p-0 overflow-hidden">
        <div className="flex flex-col h-[85vh]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-sky-600" />
              {isEditingLabel ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLabelSave();
                      }
                    }}
                    className="h-8"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleLabelSave}>
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {formData.label}
                  <button
                    onClick={() => setIsEditingLabel(true)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Pen className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>Configure Press Digit Node</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs
              defaultValue="configuration"
              className="h-full flex flex-col mx-6"
            >
              <TabsList className="w-full mt-4">
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto py-6">
                <TabsContent value="configuration" className="space-y-6 m-0">
                  {/* Templates */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Templates</CardTitle>
                      <CardDescription>
                        Start with a common pattern
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {TEMPLATES.map((template, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => handleLoadTemplate(template)}
                            className="p-4 h-auto text-left flex flex-col items-start hover:bg-sky-50 hover:border-sky-300"
                          >
                            <h4 className="font-medium text-sm">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {template.mappings.length} options
                            </p>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* OR Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500 font-medium">
                      OR
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Custom Digits */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Digits</CardTitle>
                      <CardDescription>
                        Select custom digits for your options
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-6 gap-2">
                        {AVAILABLE_DIGITS.map((digit) => (
                          <button
                            key={digit}
                            onClick={() => handleToggleDigit(digit)}
                            className={`aspect-square border-2 rounded-lg flex items-center justify-center text-lg font-mono font-bold transition-all ${
                              isDigitSelected(digit)
                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                : "border-gray-300 hover:border-sky-300 hover:bg-sky-50 text-gray-600"
                            }`}
                          >
                            {digit}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Digit Configuration */}
                  {formData.digitMappings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Keyboard className="w-4 h-4" />
                          Digit Configuration
                        </CardTitle>
                        <CardDescription>
                          Configure what each digit does
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                            <div>Digit</div>
                            <div>Description</div>
                          </div>
                          {formData.digitMappings.map((mapping, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-2 gap-4 items-center group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center font-mono font-bold text-sky-700">
                                  {mapping.digit}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={mapping.label}
                                  onChange={(e) =>
                                    handleUpdateMapping(
                                      index,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Sales Department"
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMapping(index)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Voice Instructions */}
                  {formData.digitMappings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Voice Instructions
                        </CardTitle>
                        <CardDescription>
                          What the system will say to prompt for digit input
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={formData.instructions}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              instructions: e.target.value,
                            }))
                          }
                          className="min-h-[80px]"
                        />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 m-0">
                  {/* Timing Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timing Configuration
                      </CardTitle>
                      <CardDescription>
                        Fine-tune detection and timeout settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pause Detection Delay</Label>
                          <Input
                            type="number"
                            value={formData.pauseDetectionDelay}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                pauseDetectionDelay: Math.min(
                                  5,
                                  Math.max(0.5, parseFloat(e.target.value) || 2)
                                ),
                              }))
                            }
                            min={0.5}
                            max={5}
                            step={0.1}
                          />
                          <p className="text-sm text-muted-foreground">
                            seconds
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Inter-Digit Timeout</Label>
                          <Input
                            type="number"
                            value={formData.interDigitTimeout}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                interDigitTimeout: Math.min(
                                  10,
                                  Math.max(3, parseInt(e.target.value) || 5)
                                ),
                              }))
                            }
                            min={3}
                            max={10}
                            step={1}
                          />
                          <p className="text-sm text-muted-foreground">
                            seconds
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Total Input Timeout</Label>
                          <Input
                            type="number"
                            value={formData.totalInputTimeout}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                totalInputTimeout: Math.min(
                                  60,
                                  Math.max(10, parseInt(e.target.value) || 30)
                                ),
                              }))
                            }
                            min={10}
                            max={60}
                            step={5}
                          />
                          <p className="text-sm text-muted-foreground">
                            seconds
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>DTMF Sensitivity</Label>
                          <Input
                            type="number"
                            value={formData.dtmfSensitivity}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dtmfSensitivity: Math.min(
                                  100,
                                  Math.max(10, parseInt(e.target.value) || 50)
                                ),
                              }))
                            }
                            min={10}
                            max={100}
                            step={5}
                          />
                          <p className="text-sm text-muted-foreground">
                            percentage
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Behavior Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Behavior Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Repeat Instructions on Timeout</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically replay instructions when no input is
                            received
                          </p>
                        </div>
                        <Switch
                          className="mb-6 ml-2"
                          checked={formData.repeatInstructions}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              repeatInstructions: checked,
                            }))
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Messages */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Messages (optional)</CardTitle>
                      <CardDescription>
                        Customize error and timeout messages
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Invalid Input Message</Label>
                        <Textarea
                          value={formData.invalidInputMessage}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              invalidInputMessage: e.target.value,
                            }))
                          }
                          placeholder="Sorry, that's not a valid option. Please try again."
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Timeout Message</Label>
                        <Textarea
                          value={formData.timeoutMessage}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              timeoutMessage: e.target.value,
                            }))
                          }
                          placeholder="I didn't receive any input. Let me repeat the options..."
                          className="min-h-[60px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
