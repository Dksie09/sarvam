import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Phone,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  Play,
  Pen,
  PhoneForwarded,
  RefreshCw,
  X,
  ArrowRight,
  Pause,
  Square,
  Lightbulb,
  Loader2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface CallTransferConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    id: string;
    label?: string;
    transferType?: "warm" | "cold" | "blind";
    destination?: string;
    destinationType?: "phone" | "extension" | "department" | "agent";
    transferMessage?: string;
    waitTime?: number;
    timeout?: number;
    fallbackAction?: "retry" | "end" | "continue";
    priority?: "high" | "medium" | "low";
    recordingAction?: "continue" | "stop" | "pause";
    lastTestResult?: "success" | "error" | "pending" | null;
    errorMessage?: string;
  };
  onSave: (data: CallTransferConfigModalProps["nodeData"]) => void;
}

const TRANSFER_TYPES = [
  {
    value: "warm",
    label: "Warm Transfer",
    description: "Agent stays on call during transfer",
    icon: PhoneCall,
  },
  {
    value: "cold",
    label: "Cold Transfer",
    description: "Agent introduces then leaves call",
    icon: PhoneForwarded,
  },
  {
    value: "blind",
    label: "Blind Transfer",
    description: "Immediate transfer without introduction",
    icon: Phone,
  },
];

const DESTINATION_TYPES = [
  {
    value: "phone",
    label: "Phone Number",
    icon: Phone,
    placeholder: "+1 (555) 123-4567",
  },
  {
    value: "extension",
    label: "Extension",
    icon: Building,
    placeholder: "1234",
  },
  {
    value: "department",
    label: "Department",
    icon: Building,
    placeholder: "Sales, Support, Billing",
  },
  {
    value: "agent",
    label: "Specific Agent",
    icon: User,
    placeholder: "Agent ID or Name",
  },
];

export default function CallTransferConfigModal({
  isOpen,
  onClose,
  nodeData,
  onSave,
}: CallTransferConfigModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    transferType: "warm" as "warm" | "cold" | "blind",
    destination: "",
    destinationType: "phone" as "phone" | "extension" | "department" | "agent",
    transferMessage: "",
    waitTime: 5,
    timeout: 30,
    fallbackAction: "end" as "retry" | "end" | "continue",
    priority: "medium" as "high" | "medium" | "low",
    recordingAction: "continue" as "continue" | "stop" | "pause",
  });

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState("");

  const [testResult, setTestResult] = useState<{
    status: "idle" | "running" | "success" | "error";
    message?: string;
    executionTime?: number;
  }>({ status: "idle" });

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData({
        label: nodeData.label || "Call Transfer",
        transferType: nodeData.transferType || "warm",
        destination: nodeData.destination || "",
        destinationType: nodeData.destinationType || "phone",
        transferMessage: nodeData.transferMessage || "",
        waitTime: nodeData.waitTime || 5,
        timeout: nodeData.timeout || 30,
        fallbackAction: nodeData.fallbackAction || "end",
        priority: nodeData.priority || "medium",
        recordingAction: nodeData.recordingAction || "continue",
      });
      setTempLabel(nodeData.label || "Call Transfer");
    }
  }, [isOpen, nodeData]);

  const handleTestTransfer = async () => {
    setTestResult({ status: "running" });

    setTimeout(() => {
      if (!formData.destination.trim()) {
        setTestResult({
          status: "error",
          message: "Destination is required for transfer",
          executionTime: 100,
        });
        return;
      }

      // Validate destination format based on type
      if (formData.destinationType === "phone") {
        const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
        if (!phoneRegex.test(formData.destination.replace(/\s/g, ""))) {
          setTestResult({
            status: "error",
            message: "Invalid phone number format",
            executionTime: 200,
          });
          return;
        }
      }

      // Mock successful transfer
      setTestResult({
        status: "success",
        message: `Transfer to ${formData.destination} would be initiated successfully`,
        executionTime: Math.random() * 1000 + 500,
      });
    }, 1500 + Math.random() * 1000);
  };

  const handleLabelSave = () => {
    const updatedData = { ...formData, label: tempLabel };
    setFormData(updatedData);
    onSave({ ...nodeData, ...updatedData });
    setIsEditingLabel(false);
  };

  const handleSave = () => {
    const updatedData = {
      ...nodeData,
      ...formData,
      lastTestResult:
        testResult.status === "success"
          ? ("success" as const)
          : testResult.status === "error"
          ? ("error" as const)
          : null,
      errorMessage:
        testResult.status === "error" ? testResult.message : undefined,
      isConfigured: formData.destination.trim() !== "",
    };
    onSave(updatedData);
    onClose();
  };

  const getDestinationPlaceholder = () => {
    const destType = DESTINATION_TYPES.find(
      (t) => t.value === formData.destinationType
    );
    return destType?.placeholder || "Enter destination";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-none w-[90vw] max-h-[85vh] p-0 overflow-hidden"
        style={{ maxWidth: "1000px" }}
      >
        <div className="flex flex-col h-[85vh]">
          <div className="flex-1 min-h-0">
            <ResizablePanelGroup direction="horizontal">
              {/* Main Content */}
              <ResizablePanel defaultSize={65} minSize={50}>
                <div className="flex flex-col h-full">
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-3">
                      <PhoneCall className="w-5 h-5 text-orange-600" />
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
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        📞 Transfer
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Configure Call Transfer Node
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <Tabs
                      defaultValue="transfer"
                      className="h-full flex flex-col mx-6"
                    >
                      <TabsList className="w-full mt-4">
                        <TabsTrigger value="transfer">
                          Transfer Setup
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                          Advanced Settings
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto py-6">
                        <TabsContent value="transfer" className="space-y-6 m-0">
                          {/* Transfer Type Selection */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Transfer Type</CardTitle>
                              <CardDescription>
                                Choose how the call should be transferred
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-3 gap-4">
                                {TRANSFER_TYPES.map((type) => (
                                  <div
                                    key={type.value}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                      formData.transferType === type.value
                                        ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        transferType: type.value as
                                          | "warm"
                                          | "cold"
                                          | "blind",
                                      }))
                                    }
                                  >
                                    <div className="text-center">
                                      <div className="mb-2">
                                        <type.icon className="w-6 h-6 mx-auto" />
                                      </div>
                                      <h3 className="font-medium text-sm">
                                        {type.label}
                                      </h3>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {type.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Destination Configuration */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Transfer Destination</CardTitle>
                              <CardDescription>
                                Specify where the call should be transferred
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                  <Label>Destination Type</Label>
                                  <Select
                                    value={formData.destinationType}
                                    onValueChange={(
                                      value:
                                        | "phone"
                                        | "extension"
                                        | "department"
                                        | "agent"
                                    ) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        destinationType: value,
                                        destination: "",
                                      }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DESTINATION_TYPES.map((type) => (
                                        <SelectItem
                                          key={type.value}
                                          value={type.value}
                                        >
                                          <div className="flex items-center gap-2">
                                            <type.icon className="w-4 h-4" />
                                            {type.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2 flex-[2]">
                                  <Label>Destination Value</Label>
                                  <Input
                                    value={formData.destination}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        destination: e.target.value,
                                      }))
                                    }
                                    placeholder={getDestinationPlaceholder()}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Transfer Message (Optional)</Label>
                                <Textarea
                                  value={formData.transferMessage}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      transferMessage: e.target.value,
                                    }))
                                  }
                                  placeholder="I'm transferring you to our sales team who can better assist you..."
                                  className="min-h-[80px]"
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Timing Configuration */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Timing Settings</CardTitle>
                              <CardDescription>
                                Configure transfer timing and timeouts
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="space-y-2">
                                <Label>
                                  Wait Time Before Transfer: {formData.waitTime}
                                  s
                                </Label>
                                <Slider
                                  value={[formData.waitTime]}
                                  onValueChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      waitTime: value[0],
                                    }))
                                  }
                                  max={60}
                                  min={0}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Immediate</span>
                                  <span>60 seconds</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>
                                  Transfer Timeout: {formData.timeout}s
                                </Label>
                                <Slider
                                  value={[formData.timeout]}
                                  onValueChange={(value) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      timeout: value[0],
                                    }))
                                  }
                                  max={300}
                                  min={10}
                                  step={5}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>10 seconds</span>
                                  <span>5 minutes</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6 m-0">
                          {/* Advanced Transfer Settings */}

                          <CardTitle>Advanced Settings</CardTitle>

                          <Card>
                            <CardContent className="">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>On Transfer Failure</Label>
                                  <Select
                                    value={formData.fallbackAction}
                                    onValueChange={(
                                      value: "retry" | "end" | "continue"
                                    ) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        fallbackAction: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="retry">
                                        <div className="flex items-center gap-2">
                                          <RefreshCw className="w-4 h-4" />
                                          Retry Transfer
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="end">
                                        <div className="flex items-center gap-2">
                                          <X className="w-4 h-4" />
                                          End Call
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="continue">
                                        <div className="flex items-center gap-2">
                                          <ArrowRight className="w-4 h-4" />
                                          Continue Flow
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>
                                    Recording Action During Transfer
                                  </Label>
                                  <Select
                                    value={formData.recordingAction}
                                    onValueChange={(
                                      value: "continue" | "stop" | "pause"
                                    ) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        recordingAction: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="continue">
                                        <div className="flex items-center gap-2">
                                          <Play className="w-4 h-4" />
                                          Continue Recording
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="pause">
                                        <div className="flex items-center gap-2">
                                          <Pause className="w-4 h-4" />
                                          Pause Recording
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="stop">
                                        <div className="flex items-center gap-2">
                                          <Square className="w-4 h-4" />
                                          Stop Recording
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Call Quality Settings */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Call Quality & Experience</CardTitle>
                              <CardDescription>
                                Enhance the transfer experience for customers
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Transfer Best Practices
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                  <li>
                                    • Always inform the customer before
                                    transferring
                                  </li>
                                  <li>
                                    • Provide context to the receiving party
                                  </li>
                                  <li>
                                    • Use warm transfers for complex issues
                                  </li>
                                  <li>
                                    • Set appropriate wait times to avoid
                                    confusion
                                  </li>
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Test Panel */}
              <ResizablePanel defaultSize={35} minSize={25}>
                <div className="flex flex-col h-full">
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-2">
                      <PhoneForwarded className="w-5 h-5" />
                      Test Transfer
                    </DialogTitle>
                    <DialogDescription>
                      Test your transfer configuration
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 flex flex-col p-6">
                    {/* Transfer Summary */}
                    <div className="space-y-4 mb-6">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-medium text-orange-900 mb-3">
                          Transfer Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-orange-700">Type:</span>
                            <span className="font-medium">
                              {formData.transferType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700">To:</span>
                            <span className="font-medium font-mono">
                              {formData.destination || "Not set"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700">Wait:</span>
                            <span className="font-medium">
                              {formData.waitTime}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700">Timeout:</span>
                            <span className="font-medium">
                              {formData.timeout}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {formData.transferMessage && (
                        <div className="bg-gray-50 border rounded-lg p-3">
                          <h5 className="text-xs font-medium text-gray-600 mb-2">
                            TRANSFER MESSAGE
                          </h5>
                          <p className="text-sm text-gray-800 italic">
                            &ldquo;{formData.transferMessage}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Test Button */}
                    <div className="mb-4">
                      <Button
                        onClick={handleTestTransfer}
                        disabled={
                          testResult.status === "running" ||
                          !formData.destination.trim()
                        }
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        {testResult.status === "running" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Validate Transfer
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Test Results */}
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        Test Results
                      </Label>

                      <div className="mt-2 bg-gray-50 border text-gray-800 p-4 rounded-lg font-mono text-sm overflow-y-auto max-h-[200px]">
                        {testResult.status === "idle" && (
                          <div className="text-gray-500">
                            Click &quot;Validate Transfer&quot; to validate your
                            configuration...
                          </div>
                        )}

                        {testResult.status === "running" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-orange-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Validating transfer configuration...</span>
                            </div>
                            <div className="text-gray-600">
                              → Validating destination: {formData.destination}
                            </div>
                            <div className="text-gray-600">
                              → Checking availability...
                            </div>
                          </div>
                        )}

                        {testResult.status === "success" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>✓ Transfer configuration valid</span>
                            </div>
                            <div className="text-gray-600">
                              Response time:{" "}
                              {testResult.executionTime?.toFixed(0)}ms
                            </div>
                            <Separator className="bg-gray-300" />
                            <div className="text-gray-800">
                              <div className="text-gray-600 font-medium">
                                Result:
                              </div>
                              <div className="mt-1 text-green-700 bg-green-50 p-2 rounded border">
                                {testResult.message}
                              </div>
                            </div>
                          </div>
                        )}

                        {testResult.status === "error" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>✗ Transfer validation failed</span>
                            </div>
                            <Separator className="bg-gray-300" />
                            <div className="text-red-600">
                              <div className="text-gray-600 font-medium">
                                Error:
                              </div>
                              <div className="mt-1 text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                {testResult.message}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Save Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
