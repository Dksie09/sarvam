import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  MessageSquare,
  User,
  Send,
  ChevronRight,
  Pen,
  ActivityIcon,
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
import { Slider } from "../ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    id: string;
    label?: string;
    prompt?: string;
    transitions?: string[];
    aiModel?: string;
    voice?: string;
    language?: string;
    interruptionSensitivity?: number;
    blacklistedWords?: string[];
    boostedKeywords?: string[];
    maxCallDuration?: number;
    startMode?: "auto" | "manual";
    agreeToTerms?: boolean;
    allowEmails?: boolean;
    strictlyNecessaryCookies?: boolean;
    functionalCookies?: boolean;
    welcomeMessage?: string;
    endingMessage?: string;
    timeoutMessage?: string;
    fallbackMessage?: string;
  };
  onSave: (data: NodeConfigModalProps["nodeData"]) => void;
}

const AI_MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3", label: "Claude 3" },
  { value: "gemini-pro", label: "Gemini Pro" },
];

const VOICES = [
  { value: "alloy", label: "Alloy", description: "Neutral, balanced tone" },
  { value: "echo", label: "Echo", description: "Clear and articulate" },
  { value: "fable", label: "Fable", description: "Warm and engaging" },
  { value: "onyx", label: "Onyx", description: "Deep and authoritative" },
  { value: "nova", label: "Nova", description: "Bright and energetic" },
  {
    value: "shimmer",
    label: "Shimmer",
    description: "Smooth and professional",
  },
];

const LANGUAGES = [
  "English",
  "Hindi",
  "Sanskrit",
  "Malayalam",
  "Punjabi",
  "Bengali",
  "Urdu",
];

const TRANSITION_EXAMPLES = [
  "User requests a demo",
  "Customer wants to cancel or refund",
  "Customer enquires about pricing",
  "User mentions technical issues",
];

export default function NodeConfigModal({
  isOpen,
  onClose,
  nodeData,
  onSave,
}: NodeConfigModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    prompt: "",
    transitions: [] as string[],
    aiModel: "gpt-4",
    voice: "alloy",
    language: "English",
    interruptionSensitivity: 50,
    blacklistedWords: [] as string[],
    boostedKeywords: [] as string[],
    maxCallDuration: 300,
    startMode: "auto" as "auto" | "manual",
    agreeToTerms: false,
    allowEmails: true,
    strictlyNecessaryCookies: true,
    functionalCookies: false,
    welcomeMessage: "",
    endingMessage: "",
    timeoutMessage: "",
    fallbackMessage: "",
  });

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState("");
  const [newTransition, setNewTransition] = useState("");
  const [newBlacklistedWord, setNewBlacklistedWord] = useState("");
  const [newBoostedKeyword, setNewBoostedKeyword] = useState("");
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState([
    { type: "ai", content: "Hello! How can I help you today?" },
    { type: "user", content: "Hi, I need help with my order" },
    {
      type: "ai",
      content:
        "I'd be happy to help you with your order. Could you please provide me with your order number?",
    },
  ]);

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData({
        label: nodeData.label || "Conversation Node",
        prompt: nodeData.prompt || "",
        transitions: nodeData.transitions || [],
        aiModel: nodeData.aiModel || "gpt-4",
        voice: nodeData.voice || "alloy",
        language: nodeData.language || "English",
        interruptionSensitivity: nodeData.interruptionSensitivity || 50,
        blacklistedWords: nodeData.blacklistedWords || [],
        boostedKeywords: nodeData.boostedKeywords || [],
        maxCallDuration: nodeData.maxCallDuration || 300,
        startMode: nodeData.startMode || "auto",
        agreeToTerms: nodeData.agreeToTerms || false,
        allowEmails: nodeData.allowEmails || true,
        strictlyNecessaryCookies: nodeData.strictlyNecessaryCookies || true,
        functionalCookies: nodeData.functionalCookies || false,
        welcomeMessage: nodeData.welcomeMessage || "",
        endingMessage: nodeData.endingMessage || "",
        timeoutMessage: nodeData.timeoutMessage || "",
        fallbackMessage: nodeData.fallbackMessage || "",
      });
      setTempLabel(nodeData.label || "Conversation Node");
    }
  }, [isOpen, nodeData]);

  // Auto-save when form data changes
  useEffect(() => {
    if (isOpen && nodeData) {
      onSave({ ...nodeData, ...formData });
    }
  }, [formData, isOpen, nodeData, onSave]);

  const handleLabelSave = () => {
    const updatedData = { ...formData, label: tempLabel };
    setFormData(updatedData);
    setIsEditingLabel(false);
  };

  const handleAddTransition = (transition?: string) => {
    const transitionToAdd = transition || newTransition.trim();
    if (transitionToAdd) {
      setFormData((prev) => ({
        ...prev,
        transitions: [...prev.transitions, transitionToAdd],
      }));
      setNewTransition("");
    }
  };

  const handleRemoveTransition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      transitions: prev.transitions.filter((_, i) => i !== index),
    }));
  };

  const handleAddWord = (type: "blacklisted" | "boosted") => {
    const word =
      type === "blacklisted"
        ? newBlacklistedWord.trim()
        : newBoostedKeyword.trim();
    if (word) {
      setFormData((prev) => ({
        ...prev,
        [type === "blacklisted" ? "blacklistedWords" : "boostedKeywords"]: [
          ...prev[
            type === "blacklisted" ? "blacklistedWords" : "boostedKeywords"
          ],
          word,
        ],
      }));
      if (type === "blacklisted") setNewBlacklistedWord("");
      else setNewBoostedKeyword("");
    }
  };

  const handleRemoveWord = (type: "blacklisted" | "boosted", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type === "blacklisted" ? "blacklistedWords" : "boostedKeywords"]: prev[
        type === "blacklisted" ? "blacklistedWords" : "boostedKeywords"
      ].filter((_, i) => i !== index),
    }));
  };

  const handleSendTestMessage = () => {
    if (testInput.trim()) {
      setTestMessages((prev) => [
        ...prev,
        { type: "user", content: testInput },
        {
          type: "ai",
          content: "This is a simulated response based on your configuration.",
        },
      ]);
      setTestInput("");
    }
  };

  const handleSave = () => {
    onSave({ ...nodeData, ...formData });
    onClose();
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
              <ResizablePanel defaultSize={60} minSize={40}>
                <div className="flex flex-col h-full">
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-pink-600" />
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
                    <DialogDescription>
                      Configure Conversation Node
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <Tabs
                      defaultValue="configuration"
                      className="h-full flex flex-col mx-6"
                    >
                      <TabsList className="w-full mt-4">
                        <TabsTrigger value="configuration">
                          Configuration
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                          Advanced Settings
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto py-6  no-scrollbar">
                        <TabsContent
                          value="configuration"
                          className="space-y-6 m-0"
                        >
                          {/* Core Settings */}
                          <Card className="transition-all duration-300 hover:shadow-lg">
                            <CardHeader className="space-y-1">
                              <CardTitle className="text-xl">
                                Core Settings
                              </CardTitle>
                              <CardDescription className="text-sm text-muted-foreground">
                                Basic configuration for your AI assistant
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              {/* AI Model Selection */}
                              <div className="flex gap-4">
                                <div className="space-y-2 group">
                                  <Label className="text-sm font-medium group-hover:text-primary transition-colors">
                                    AI Model
                                  </Label>
                                  <Select
                                    value={formData.aiModel}
                                    onValueChange={(value) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        aiModel: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="transition-all duration-200 hover:border-primary">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {AI_MODELS.map((model) => (
                                        <SelectItem
                                          key={model.value}
                                          value={model.value}
                                          className="transition-colors hover:bg-primary/10"
                                        >
                                          {model.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2 group">
                                  <Label className="text-sm font-medium group-hover:text-primary transition-colors">
                                    Voice
                                  </Label>
                                  <Select
                                    value={formData.voice}
                                    onValueChange={(value) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        voice: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="transition-all duration-200 hover:border-primary">
                                      <SelectValue>
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={`https://api.dicebear.com/9.x/glass/svg?seed=${formData.voice}`}
                                            alt={
                                              VOICES.find(
                                                (v) =>
                                                  v.value === formData.voice
                                              )?.label
                                            }
                                            className="w-5 h-5 rounded-full transition-transform duration-200 hover:scale-110"
                                          />
                                          <span>
                                            {
                                              VOICES.find(
                                                (v) =>
                                                  v.value === formData.voice
                                              )?.label
                                            }
                                          </span>
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {VOICES.map((voice) => (
                                        <SelectItem
                                          key={voice.value}
                                          value={voice.value}
                                          className="transition-colors hover:bg-primary/10"
                                        >
                                          <div className="flex items-center gap-3">
                                            <img
                                              src={`https://api.dicebear.com/9.x/glass/svg?seed=${voice.value}`}
                                              alt={voice.label}
                                              className="w-6 h-6 rounded-full transition-transform duration-200 hover:scale-110"
                                            />
                                            <div className="flex flex-col">
                                              <span>{voice.label}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {voice.description}
                                              </span>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2 group">
                                  <Label className="text-sm font-medium group-hover:text-primary transition-colors">
                                    Language
                                  </Label>
                                  <Select
                                    value={formData.language}
                                    onValueChange={(value) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        language: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="transition-all duration-200 hover:border-primary">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {LANGUAGES.map((language) => (
                                        <SelectItem
                                          key={language}
                                          value={language}
                                          className="transition-colors hover:bg-primary/10"
                                        >
                                          {language}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* System Prompt */}
                              <div className="space-y-2 group">
                                <Label className="text-sm font-medium group-hover:text-primary transition-colors">
                                  System Prompt
                                </Label>
                                <Textarea
                                  value={formData.prompt}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      prompt: e.target.value,
                                    }))
                                  }
                                  placeholder="You are a helpful customer service assistant. Be friendly, professional, and always try to resolve the customer's issue."
                                  className="min-h-[120px] transition-all duration-200 hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Conversation Flow */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Conversation Flow</CardTitle>
                              <CardDescription>
                                Customize how your AI interacts with users
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              {/* Welcome & Ending Messages */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label>Welcome Message</Label>
                                    <span className="text-sm text-muted-foreground">
                                      (Optional)
                                    </span>
                                  </div>
                                  <Textarea
                                    value={formData.welcomeMessage}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        welcomeMessage: e.target.value,
                                      }))
                                    }
                                    placeholder="Hello! Matt from Clubhouse at your service."
                                    className="min-h-[80px]"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label>Ending Message</Label>
                                    <span className="text-sm text-muted-foreground">
                                      (Optional)
                                    </span>
                                  </div>
                                  <Textarea
                                    value={formData.endingMessage}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        endingMessage: e.target.value,
                                      }))
                                    }
                                    placeholder="Thank you for chatting with me. Have a great day!"
                                    className="min-h-[80px]"
                                  />
                                </div>
                              </div>

                              {/* Transitions */}
                              <Card>
                                <CardHeader>
                                  <CardTitle>
                                    Conversation Transitions
                                  </CardTitle>
                                  <CardDescription>
                                    Define conditions that trigger transitions
                                    to other nodes
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label>Active Transitions</Label>
                                    <Badge variant="secondary">
                                      {formData.transitions.length} transitions
                                    </Badge>
                                  </div>

                                  <div className="flex gap-2">
                                    <Input
                                      value={newTransition}
                                      onChange={(e) =>
                                        setNewTransition(e.target.value)
                                      }
                                      placeholder="Describe the transition condition"
                                      onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        handleAddTransition()
                                      }
                                    />
                                    <Button
                                      onClick={() => handleAddTransition()}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* Example Transitions */}
                                  <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">
                                      Quick add examples:
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                      {TRANSITION_EXAMPLES.map(
                                        (example, index) => (
                                          <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleAddTransition(example)
                                            }
                                            className="text-xs"
                                          >
                                            <Plus className="w-3 h-3 mr-1" />
                                            {example}
                                          </Button>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Current Transitions */}
                                  <div className="space-y-2">
                                    {formData.transitions.map(
                                      (transition, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                                        >
                                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                          <span className="flex-1 text-sm">
                                            {transition}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveTransition(index)
                                            }
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                    {formData.transitions.length === 0 && (
                                      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                                        <p>No transitions added yet</p>
                                        <p className="text-xs mt-1">
                                          Add transitions to control
                                          conversation flow
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6 m-0">
                          {/* Call Settings */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Call Settings</CardTitle>
                              <CardDescription>
                                Configure global settings for active calls.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Max Call Duration (seconds)</Label>
                                <Input
                                  type="number"
                                  value={formData.maxCallDuration}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      maxCallDuration:
                                        parseInt(e.target.value) || 300,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Start Mode</Label>
                                <Select
                                  value={formData.startMode}
                                  onValueChange={(value: "auto" | "manual") =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      startMode: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">
                                      Auto Start
                                    </SelectItem>
                                    <SelectItem value="manual">
                                      Wait for User
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Interruption Settings */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Interruption Settings</CardTitle>
                              <CardDescription>
                                Adjust how the AI responds to user
                                interruptions.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <Label>
                                Interruption Sensitivity:{" "}
                                {formData.interruptionSensitivity}%
                              </Label>
                              <Slider
                                value={[formData.interruptionSensitivity]}
                                onValueChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    interruptionSensitivity: value[0],
                                  }))
                                }
                                max={100}
                                step={1}
                                className="w-full"
                              />
                            </CardContent>
                          </Card>

                          {/* Data Usage Consent */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Data Usage Consent</CardTitle>
                              <CardDescription>
                                Configure user consent for data processing and
                                communication.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="data-processing"
                                  checked={formData.agreeToTerms}
                                  onCheckedChange={(checked: boolean) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      agreeToTerms: checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="data-processing">
                                  Consent to data processing
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="notifications"
                                  checked={formData.allowEmails}
                                  onCheckedChange={(checked: boolean) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      allowEmails: checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="notifications">
                                  Enable performance notifications
                                </Label>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Telemetry & Logging */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Telemetry & Logging</CardTitle>
                              <CardDescription>
                                Manage how diagnostic and operational data is
                                collected.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <Label htmlFor="essential-logging">
                                    Essential Logging
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    Collects operational data necessary for node
                                    function.
                                  </p>
                                </div>
                                <Switch
                                  id="essential-logging"
                                  checked={formData.strictlyNecessaryCookies}
                                  onCheckedChange={(checked: boolean) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      strictlyNecessaryCookies: checked,
                                    }))
                                  }
                                />
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <Label htmlFor="diagnostic-data">
                                    Diagnostic Data
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    Collects anonymous data to improve
                                    performance and features.
                                  </p>
                                </div>
                                <Switch
                                  id="diagnostic-data"
                                  checked={formData.functionalCookies}
                                  onCheckedChange={(checked: boolean) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      functionalCookies: checked,
                                    }))
                                  }
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Word Management */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Word Management</CardTitle>
                              <CardDescription>
                                Manage blacklisted and boosted keywords for
                                conversation control.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              {/* Blacklisted Words */}
                              <div className="space-y-4">
                                <Label>Blacklisted Words</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={newBlacklistedWord}
                                    onChange={(e) =>
                                      setNewBlacklistedWord(e.target.value)
                                    }
                                    placeholder="Add blacklisted word"
                                    onKeyPress={(e) =>
                                      e.key === "Enter" &&
                                      handleAddWord("blacklisted")
                                    }
                                  />
                                  <Button
                                    variant="outline"
                                    className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                                    onClick={() => handleAddWord("blacklisted")}
                                  >
                                    Add
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {formData.blacklistedWords.map(
                                    (word, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="gap-1 border-destructive text-destructive"
                                      >
                                        {word}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-auto p-0 text-destructive hover:bg-transparent"
                                          onClick={() =>
                                            handleRemoveWord(
                                              "blacklisted",
                                              index
                                            )
                                          }
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Boosted Keywords */}
                              <div className="space-y-4">
                                <Label>Boosted Keywords</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={newBoostedKeyword}
                                    onChange={(e) =>
                                      setNewBoostedKeyword(e.target.value)
                                    }
                                    placeholder="Add boosted keyword"
                                    onKeyPress={(e) =>
                                      e.key === "Enter" &&
                                      handleAddWord("boosted")
                                    }
                                  />
                                  <Button
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    onClick={() => handleAddWord("boosted")}
                                  >
                                    Add
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {formData.boostedKeywords.map(
                                    (word, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="gap-1 border-green-600 text-green-600"
                                      >
                                        {word}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-auto p-0 text-green-600 hover:bg-transparent"
                                          onClick={() =>
                                            handleRemoveWord("boosted", index)
                                          }
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </Badge>
                                    )
                                  )}
                                </div>
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

              {/* Testing Area */}
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="flex flex-col h-full">
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-2">
                      <ActivityIcon className="w-5 h-5 " />
                      Test Conversation
                    </DialogTitle>
                    <DialogDescription>
                      Try out your conversation flow with the AI
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 flex flex-col p-6 ">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 ">
                      {testMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-2 ${
                            message.type === "user" ? "justify-end" : ""
                          }`}
                        >
                          {message.type === "ai" && (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                              <img
                                src={`https://api.dicebear.com/9.x/glass/svg?seed=${formData.voice}`}
                                alt={
                                  VOICES.find((v) => v.value === formData.voice)
                                    ?.label
                                }
                                className="w-full h-full rounded-full"
                              />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              message.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-background border"
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.type === "user" && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Type a message to test..."
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendTestMessage()
                        }
                      />
                      <Button size="sm" onClick={handleSendTestMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
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
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
