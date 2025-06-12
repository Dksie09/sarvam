import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Code,
  Loader2,
  Pen,
  Play,
  RotateCcw,
  Settings,
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

interface FunctionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    id: string;
    label?: string;
    programmingLanguage?: "javascript" | "python" | "curl";
    code?: string;
    timeout?: number;
    retryCount?: number;
    onFailAction?: "stop" | "retry" | "continue";
    lastTestResult?: "success" | "error" | "pending" | null;
    errorMessage?: string;
  };
  onSave: (data: FunctionConfigModalProps["nodeData"]) => void;
}

const CODE_TEMPLATES = {
  javascript: `// JavaScript Function
function execute(input, context) {
  console.log('Input value:', {{input.message}});
  
  return {
    success: true,
    data: {{input.message}}
  };
}

module.exports = { execute };`,
  python: `# Python Function
def execute(input_data, context):
    print(f'Input value: {{input_data.message}}')
    
    return {
        'success': True,
        'data': {{input_data.message}}
    }`,
  curl: `# cURL Command
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"message": "{{input.message}}"}' \\
  https://api.example.com/endpoint`,
};

// Simple syntax highlighting function
const highlightCode = (code: string, language: string) => {
  if (!code) return code;

  let highlighted = code;

  // JavaScript highlighting
  if (language === "javascript") {
    // Keywords
    highlighted = highlighted.replace(
      /\b(function|const|let|var|if|else|for|while|return|true|false|null|undefined)\b/g,
      "$1"
    );

    // Strings
    highlighted = highlighted.replace(
      /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      "$1$2$1"
    );

    // Comments
    highlighted = highlighted.replace(
      /\/\/.*$/gm,
      '<span style="color: #A0A0A0;">$&</span>'
    );
  }

  // Python highlighting
  if (language === "python") {
    // Keywords
    highlighted = highlighted.replace(
      /\b(def|if|else|for|while|return|True|False|None|import|from|as|try|except|finally|with|class)\b/g,
      "$1"
    );

    // Strings
    highlighted = highlighted.replace(
      /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      "$1$2$1"
    );

    // Comments
    highlighted = highlighted.replace(
      /#.*$/gm,
      '<span style="color: #A0A0A0;">$&</span>'
    );
  }

  // Highlight variables in double curly braces for all languages
  highlighted = highlighted.replace(
    /\{\{([^}]+)\}\}/g,
    '<span style="background-color: #F5F3FF; color: #8B5CF6; padding: 2px 4px; border-radius: 4px; font-weight: 500;">$&</span>'
  );

  return highlighted;
};

interface FormData {
  label: string;
  programmingLanguage: "javascript" | "python" | "curl";
  code: string;
  timeout: number;
  retryCount: number;
  onFailAction: "stop" | "retry" | "continue";
  errorMessage?: string;
}

export default function FunctionConfigModal({
  isOpen,
  onClose,
  nodeData,
  onSave,
}: FunctionConfigModalProps) {
  const [formData, setFormData] = useState<FormData>({
    label: "",
    programmingLanguage: "javascript" as "javascript" | "python" | "curl",
    code: "",
    timeout: 30,
    retryCount: 0,
    onFailAction: "stop" as "stop" | "retry" | "continue",
  });

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState("");

  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  const [testResult, setTestResult] = useState<{
    status: "idle" | "running" | "success" | "error";
    output?: string;
    error?: string;
    executionTime?: number;
  }>({ status: "idle" });

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData({
        label: nodeData.label || "Function Node",
        programmingLanguage: nodeData.programmingLanguage || "javascript",
        code: nodeData.code || CODE_TEMPLATES.javascript,
        timeout: nodeData.timeout || 30,
        retryCount: nodeData.retryCount || 0,
        onFailAction: nodeData.onFailAction || "stop",
      });
      setTempLabel(nodeData.label || "Function Node");
    }
  }, [isOpen, nodeData]);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-save when form data changes
  useEffect(() => {
    if (isOpen && nodeData) {
      onSave({ ...nodeData, ...formData });
    }
  }, [formData, isOpen, nodeData, onSave]);

  const handleLanguageChange = (language: "javascript" | "python" | "curl") => {
    setFormData((prev) => ({
      ...prev,
      programmingLanguage: language,
      code: CODE_TEMPLATES[language],
    }));
  };

  const handleTestRun = async () => {
    setTestResult({ status: "running" });
    try {
      const startTime = Date.now();
      // Simulate function execution
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const executionTime = Date.now() - startTime;

      setTestResult({
        status: "success",
        output: "Function executed successfully",
        executionTime,
      });
    } catch (error) {
      setTestResult({
        status: "error",
        error: error instanceof Error ? error.message : "An error occurred",
      });
    }
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
      lastTestResult:
        testResult.status === "success"
          ? ("success" as const)
          : testResult.status === "error"
          ? ("error" as const)
          : null,
      errorMessage: testResult.error,
      isConfigured: formData.code.trim() !== "",
    };
    onSave(updatedData);
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
            {screenSize === "desktop" ? (
              <ResizablePanelGroup direction="horizontal">
                {/* Main Content */}
                <ResizablePanel defaultSize={65} minSize={50}>
                  <div className="flex flex-col h-full">
                    <DialogHeader className="p-6 border-b">
                      <DialogTitle className="flex items-center gap-3">
                        <Play className="w-5 h-5 text-purple-600" />
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
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {formData.programmingLanguage === "javascript"
                            ? "JS"
                            : formData.programmingLanguage === "python"
                            ? "Python"
                            : formData.programmingLanguage === "curl"
                            ? "cURL"
                            : "Function"}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        Configure Function Node
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                      <Tabs
                        defaultValue="function"
                        className="h-full flex flex-col mx-6"
                      >
                        <TabsList className="w-full mt-4">
                          <TabsTrigger value="function">
                            Function Setup
                          </TabsTrigger>
                          <TabsTrigger value="settings">
                            Advanced Settings
                          </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto py-6">
                          <TabsContent
                            value="function"
                            className="space-y-6 m-0"
                          >
                            {/* Language Selection */}
                            <div className="space-y-2">
                              <Label>Programming Language</Label>
                              <Select
                                value={formData.programmingLanguage}
                                onValueChange={handleLanguageChange}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="javascript">
                                    JavaScript
                                  </SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="curl">cURL</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Code Editor */}
                            <Card className="flex-1">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Code className="w-4 h-4" />
                                  Code Editor
                                </CardTitle>
                                <CardDescription>
                                  Write your {formData.programmingLanguage}{" "}
                                  function here.
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="relative">
                                    <Textarea
                                      value={formData.code}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          code: e.target.value,
                                        }))
                                      }
                                      placeholder={`Enter your ${formData.programmingLanguage} code here...`}
                                      className=" font-mono text-sm bg-gray-50 absolute inset-0 z-10 resize-none opacity-0"
                                    />
                                    <div
                                      className=" font-mono text-sm pb-5 p-3 border rounded-md bg-gray-50 overflow-auto whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{
                                        __html: highlightCode(
                                          formData.code,
                                          formData.programmingLanguage
                                        ),
                                      }}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          code: CODE_TEMPLATES[
                                            prev.programmingLanguage
                                          ],
                                        }))
                                      }
                                    >
                                      <RotateCcw className="w-4 h-4 mr-1" />
                                      Reset Template
                                    </Button>

                                    <div className="text-sm text-gray-500">
                                      💡 Tip: Use{" "}
                                      <code className="bg-purple-50 text-purple-600 px-1 rounded">
                                        {"{{variable}}"}
                                      </code>{" "}
                                      to access previous node data
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent
                            value="settings"
                            className="space-y-6 m-0"
                          >
                            {/* Execution Settings */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Execution Settings
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label>Timeout (seconds)</Label>
                                    <Input
                                      type="number"
                                      value={formData.timeout}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          timeout: Math.min(
                                            900,
                                            Math.max(
                                              5,
                                              parseInt(e.target.value) || 30
                                            )
                                          ),
                                        }))
                                      }
                                      min={5}
                                      max={900}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      Max: 15 minutes (900s)
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>On Failure Action</Label>
                                    <div className="flex gap-2">
                                      <Select
                                        value={formData.onFailAction}
                                        onValueChange={(
                                          value: "stop" | "retry" | "continue"
                                        ) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            onFailAction: value,
                                          }))
                                        }
                                      >
                                        <SelectTrigger className="flex-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="stop">
                                            Stop Execution
                                          </SelectItem>
                                          <SelectItem value="retry">
                                            Retry Function
                                          </SelectItem>
                                          <SelectItem value="continue">
                                            Continue Flow
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>

                                      {formData.onFailAction === "retry" && (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            value={formData.retryCount}
                                            onChange={(e) =>
                                              setFormData((prev) => ({
                                                ...prev,
                                                retryCount: Math.min(
                                                  5,
                                                  Math.max(
                                                    0,
                                                    parseInt(e.target.value) ||
                                                      0
                                                  )
                                                ),
                                              }))
                                            }
                                            min={0}
                                            max={5}
                                            className="w-20"
                                            placeholder="0"
                                          />
                                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                                            retries
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {formData.onFailAction === "retry" && (
                                      <p className="text-sm text-muted-foreground">
                                        Max retries: 5
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Environment Variables */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Environment Variables</CardTitle>
                                <CardDescription>
                                  Configure environment variables for your
                                  function
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Variable name"
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="Variable value"
                                      className="flex-1"
                                    />
                                    <Button variant="outline" size="sm">
                                      Add
                                    </Button>
                                  </div>
                                  <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                                    No environment variables configured yet
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

                {/* Test Panel */}
                <ResizablePanel defaultSize={35} minSize={25}>
                  <div className="flex flex-col h-full">
                    <DialogHeader className="p-6 border-b">
                      <DialogTitle className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-purple-600" />
                        Test Function
                      </DialogTitle>
                      <DialogDescription>
                        Test your function configuration
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col p-6">
                      {/* Function Summary */}
                      <div className="space-y-4 mb-6">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-medium text-purple-900 mb-3">
                            Function Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-purple-700">Type:</span>
                              <span className="font-medium">
                                {formData.programmingLanguage}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-700">Name:</span>
                              <span className="font-medium font-mono">
                                {formData.label}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-700">Timeout:</span>
                              <span className="font-medium">
                                {formData.timeout}s
                              </span>
                            </div>
                          </div>
                        </div>

                        {formData.errorMessage && (
                          <div className="bg-gray-50 border rounded-lg p-3">
                            <h5 className="text-xs font-medium text-gray-600 mb-2">
                              ERROR
                            </h5>
                            <p className="text-sm text-gray-800 italic">
                              &ldquo;{formData.errorMessage}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Test Button */}
                      <div className="mb-4">
                        <Button
                          onClick={handleTestRun}
                          disabled={
                            testResult.status === "running" ||
                            !formData.label.trim()
                          }
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {testResult.status === "running" ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Test Function
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
                              Click &quot;Test Function&quot; to test your
                              configuration...
                            </div>
                          )}

                          {testResult.status === "running" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-purple-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Testing function configuration...</span>
                              </div>
                              <div className="text-gray-600">
                                → Executing function: {formData.label}
                              </div>
                              <div className="text-gray-600">
                                → Processing response...
                              </div>
                            </div>
                          )}

                          {testResult.status === "success" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>✓ Function test successful</span>
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
                                  {testResult.output}
                                </div>
                              </div>
                            </div>
                          )}

                          {testResult.status === "error" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span>✗ Function test failed</span>
                              </div>
                              <Separator className="bg-gray-300" />
                              <div className="text-red-600">
                                <div className="text-gray-600 font-medium">
                                  Error:
                                </div>
                                <div className="mt-1 text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                  {testResult.error}
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
            ) : (
              <div className="flex flex-col h-full">
                <DialogHeader className="p-6 border-b">
                  <DialogTitle className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-purple-600" />
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
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {formData.programmingLanguage === "javascript"
                        ? "JS"
                        : formData.programmingLanguage === "python"
                        ? "Python"
                        : formData.programmingLanguage === "curl"
                        ? "cURL"
                        : "Function"}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>Configure Function Node</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                  <Tabs
                    defaultValue="function"
                    className="h-full flex flex-col mx-4 sm:mx-6"
                  >
                    <TabsList className="w-full mt-4">
                      <TabsTrigger value="function">Function Setup</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                      <TabsTrigger value="testing">Testing</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto py-6">
                      <TabsContent value="function" className="space-y-6 m-0">
                        {/* Language Selection */}
                        <div className="space-y-2">
                          <Label>Programming Language</Label>
                          <Select
                            value={formData.programmingLanguage}
                            onValueChange={handleLanguageChange}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="javascript">
                                JavaScript
                              </SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="curl">cURL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Code Editor */}
                        <Card className="flex-1">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Code className="w-4 h-4" />
                              Code Editor
                            </CardTitle>
                            <CardDescription>
                              Write your {formData.programmingLanguage} function
                              here.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="relative">
                                <Textarea
                                  value={formData.code}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      code: e.target.value,
                                    }))
                                  }
                                  placeholder={`Enter your ${formData.programmingLanguage} code here...`}
                                  className=" font-mono text-sm bg-gray-50 absolute inset-0 z-10 resize-none opacity-0"
                                />
                                <div
                                  className=" font-mono text-sm pb-5 p-3 border rounded-md bg-gray-50 overflow-auto whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{
                                    __html: highlightCode(
                                      formData.code,
                                      formData.programmingLanguage
                                    ),
                                  }}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      code: CODE_TEMPLATES[
                                        prev.programmingLanguage
                                      ],
                                    }))
                                  }
                                >
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Reset Template
                                </Button>

                                <div className="text-sm text-gray-500">
                                  💡 Tip: Use{" "}
                                  <code className="bg-purple-50 text-purple-600 px-1 rounded">
                                    {"{{variable}}"}
                                  </code>{" "}
                                  to access previous node data
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="settings" className="space-y-6 m-0">
                        {/* Execution Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Execution Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label>Timeout (seconds)</Label>
                                <Input
                                  type="number"
                                  value={formData.timeout}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      timeout: Math.min(
                                        900,
                                        Math.max(
                                          5,
                                          parseInt(e.target.value) || 30
                                        )
                                      ),
                                    }))
                                  }
                                  min={5}
                                  max={900}
                                />
                                <p className="text-sm text-muted-foreground">
                                  Max: 15 minutes (900s)
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label>On Failure Action</Label>
                                <div className="flex gap-2">
                                  <Select
                                    value={formData.onFailAction}
                                    onValueChange={(
                                      value: "stop" | "retry" | "continue"
                                    ) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        onFailAction: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="stop">
                                        Stop Execution
                                      </SelectItem>
                                      <SelectItem value="retry">
                                        Retry Function
                                      </SelectItem>
                                      <SelectItem value="continue">
                                        Continue Flow
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {formData.onFailAction === "retry" && (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        value={formData.retryCount}
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            retryCount: Math.min(
                                              5,
                                              Math.max(
                                                0,
                                                parseInt(e.target.value) || 0
                                              )
                                            ),
                                          }))
                                        }
                                        min={0}
                                        max={5}
                                        className="w-20"
                                        placeholder="0"
                                      />
                                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        retries
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {formData.onFailAction === "retry" && (
                                  <p className="text-sm text-muted-foreground">
                                    Max retries: 5
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Environment Variables */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Environment Variables</CardTitle>
                            <CardDescription>
                              Configure environment variables for your function
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Variable name"
                                  className="flex-1"
                                />
                                <Input
                                  placeholder="Variable value"
                                  className="flex-1"
                                />
                                <Button variant="outline" size="sm">
                                  Add
                                </Button>
                              </div>
                              <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                                No environment variables configured yet
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="testing" className="space-y-6 m-0">
                        <Card>
                          <CardHeader>
                            <CardTitle>Test Function</CardTitle>
                            <CardDescription>
                              Test your function configuration
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {/* Function Summary */}
                            <div className="space-y-4 mb-6">
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h4 className="font-medium text-purple-900 mb-3">
                                  Function Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-purple-700">
                                      Type:
                                    </span>
                                    <span className="font-medium">
                                      {formData.programmingLanguage}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-700">
                                      Name:
                                    </span>
                                    <span className="font-medium font-mono">
                                      {formData.label}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-700">
                                      Timeout:
                                    </span>
                                    <span className="font-medium">
                                      {formData.timeout}s
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {formData.errorMessage && (
                                <div className="bg-gray-50 border rounded-lg p-3">
                                  <h5 className="text-xs font-medium text-gray-600 mb-2">
                                    ERROR
                                  </h5>
                                  <p className="text-sm text-gray-800 italic">
                                    &ldquo;{formData.errorMessage}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Test Button */}
                            <div className="mb-4">
                              <Button
                                onClick={handleTestRun}
                                disabled={
                                  testResult.status === "running" ||
                                  !formData.label.trim()
                                }
                                className="w-full bg-purple-600 hover:bg-purple-700"
                              >
                                {testResult.status === "running" ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Testing...
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-1" />
                                    Test Function
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
                                    Click &quot;Test Function&quot; to test your
                                    configuration...
                                  </div>
                                )}

                                {testResult.status === "running" && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-purple-600">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>
                                        Testing function configuration...
                                      </span>
                                    </div>
                                    <div className="text-gray-600">
                                      → Executing function: {formData.label}
                                    </div>
                                    <div className="text-gray-600">
                                      → Processing response...
                                    </div>
                                  </div>
                                )}

                                {testResult.status === "success" && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-green-600">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>✓ Function test successful</span>
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
                                        {testResult.output}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {testResult.status === "error" && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-red-600">
                                      <AlertTriangle className="w-4 h-4" />
                                      <span>✗ Function test failed</span>
                                    </div>
                                    <Separator className="bg-gray-300" />
                                    <div className="text-red-600">
                                      <div className="text-gray-600 font-medium">
                                        Error:
                                      </div>
                                      <div className="mt-1 text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                        {testResult.error}
                                      </div>
                                    </div>
                                  </div>
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
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Function
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
