import React, { useState, useEffect } from "react";
import {
  Play,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
  Settings,
  Code,
  Terminal,
  Pen,
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
    language?: "javascript" | "python" | "curl";
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

export default function FunctionConfigModal({
  isOpen,
  onClose,
  nodeData,
  onSave,
}: FunctionConfigModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    language: "javascript" as "javascript" | "python" | "curl",
    code: "",
    timeout: 30,
    retryCount: 0,
    onFailAction: "stop" as "stop" | "retry" | "continue",
  });

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState("");

  const [testResult, setTestResult] = useState<{
    status: "idle" | "running" | "success" | "error";
    output?: string;
    error?: string;
    executionTime?: number;
  }>({ status: "idle" });

  const [testInput, setTestInput] = useState('{"message": "test"}');

  useEffect(() => {
    if (isOpen && nodeData) {
      setFormData({
        label: nodeData.label || "Function Node",
        language: nodeData.language || "javascript",
        code: nodeData.code || CODE_TEMPLATES.javascript,
        timeout: nodeData.timeout || 30,
        retryCount: nodeData.retryCount || 0,
        onFailAction: nodeData.onFailAction || "stop",
      });
      setTempLabel(nodeData.label || "Function Node");
    }
  }, [isOpen, nodeData]);

  const handleLanguageChange = (language: "javascript" | "python" | "curl") => {
    setFormData((prev) => ({
      ...prev,
      language,
      code: CODE_TEMPLATES[language],
    }));
  };

  const handleTestRun = async () => {
    setTestResult({ status: "running" });

    try {
      // Parse test input
      const testInputData = JSON.parse(testInput);

      // Simple validation
      if (!formData.code.trim()) {
        throw new Error("Code cannot be empty");
      }

      // Mock execution with actual code
      const startTime = Date.now();

      // Simulate code execution
      setTimeout(() => {
        try {
          // Replace {{variable}} with actual values
          let processedCode = formData.code;
          if (formData.language === "javascript") {
            processedCode = processedCode.replace(
              /{{input\.([^}]+)}}/g,
              (_, key) => {
                return JSON.stringify(testInputData[key]);
              }
            );
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            processedCode = processedCode.replace(
              /{{input_data\.([^}]+)}}/g,
              (_, key) => {
                return JSON.stringify(testInputData[key]);
              }
            );
          }

          const executionTime = Date.now() - startTime;

          // Mock console output
          const consoleOutput =
            formData.language === "javascript"
              ? `Input value: ${testInputData.message}\n`
              : `Input value: ${testInputData.message}\n`;

          setTestResult({
            status: "success",
            output: JSON.stringify(
              {
                success: true,
                data: testInputData.message,
                consoleOutput,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
            executionTime,
          });
        } catch (error) {
          setTestResult({
            status: "error",
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
            executionTime: Date.now() - startTime,
          });
        }
      }, 1000);
    } catch (error) {
      setTestResult({
        status: "error",
        error: error instanceof Error ? error.message : "Invalid JSON input",
        executionTime: 0,
      });
    }
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
      errorMessage: testResult.error,
      isConfigured: formData.code.trim() !== "",
    };
    onSave(updatedData);
    onClose();
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case "javascript":
        return "javascript";
      case "python":
        return "python";
      case "curl":
        return "cURL";
      default:
        return "💻";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-none w-[90vw] max-h-[85vh] p-0 overflow-hidden"
        style={{ maxWidth: "1200px" }}
      >
        <div className="flex flex-col h-[85vh]">
          <div className="flex-1 min-h-0">
            <ResizablePanelGroup direction="horizontal">
              {/* Main Content */}
              <ResizablePanel defaultSize={65} minSize={50}>
                <div className="flex flex-col h-full">
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-purple-600" />
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
                      <Badge variant="outline" className="">
                        {getLanguageIcon(formData.language)}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Configure Function Execution Node
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-hidden">
                    <Tabs
                      defaultValue="code"
                      className="h-full flex flex-col mx-6"
                    >
                      <TabsList className="w-full mt-4">
                        <TabsTrigger value="code">Code Editor</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto py-6">
                        <TabsContent
                          value="code"
                          className="space-y-6 m-0 h-full"
                        >
                          {/* Language Selection */}

                          <div className="space-y-2">
                            <Label>Programming Language</Label>
                            <Select
                              value={formData.language}
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
                                Write your {formData.language} function here.
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
                                    placeholder={`Enter your ${formData.language} code here...`}
                                    className=" font-mono text-sm bg-gray-50 absolute inset-0 z-10 resize-none opacity-0"
                                  />
                                  <div
                                    className=" font-mono text-sm pb-5 p-3 border rounded-md bg-gray-50 overflow-auto whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{
                                      __html: highlightCode(
                                        formData.code,
                                        formData.language
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
                                        code: CODE_TEMPLATES[prev.language],
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
                      <Terminal className="w-5 h-5" />
                      Test Console
                    </DialogTitle>
                    <DialogDescription>
                      Test your function with sample input
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 flex flex-col p-6">
                    {/* Test Input */}
                    <div className="space-y-2 mb-4">
                      <Label>Test Input (JSON)</Label>
                      <Textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="min-h-[80px] font-mono text-sm"
                      />
                    </div>

                    {/* Test Run Button */}
                    <div className="mb-4">
                      <Button
                        onClick={handleTestRun}
                        disabled={testResult.status === "running"}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {testResult.status === "running" ? (
                          <>
                            <Clock className="w-4 h-4 mr-1 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Test Run
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Test Results */}
                    <div className="flex-1 space-y-4">
                      <Label>Console Output</Label>

                      <div className="flex-1 bg-gray-50 border text-gray-800 p-4 rounded-lg font-mono text-sm overflow-y-auto max-h-[300px]">
                        {testResult.status === "idle" && (
                          <div className="text-gray-500">
                            Press &quot;Test Run&quot; to execute your
                            function...
                          </div>
                        )}

                        {testResult.status === "running" && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-spin text-blue-500" />
                            <span>Executing function...</span>
                          </div>
                        )}

                        {testResult.status === "success" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>✓ Execution completed successfully</span>
                            </div>
                            <div className="text-gray-600">
                              Execution time:{" "}
                              {testResult.executionTime?.toFixed(2)}ms
                            </div>
                            <Separator className="bg-gray-300" />
                            <div className="text-gray-800">
                              <div className="text-gray-600 font-medium">
                                Output:
                              </div>
                              <pre className="mt-2 whitespace-pre-wrap bg-white p-2 rounded border overflow-x-auto">
                                {testResult.output}
                              </pre>
                            </div>
                          </div>
                        )}

                        {testResult.status === "error" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>✗ Execution failed</span>
                            </div>
                            <Separator className="bg-gray-300" />
                            <div className="text-red-600">
                              <div className="text-gray-600 font-medium">
                                Error:
                              </div>
                              <pre className="mt-2 whitespace-pre-wrap bg-red-50 p-2 rounded border border-red-200 overflow-x-auto">
                                {testResult.error}
                              </pre>
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
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
