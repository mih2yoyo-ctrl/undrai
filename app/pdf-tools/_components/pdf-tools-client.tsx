
"use client";

import { useState } from "react";
import {
  FileText,
  Minimize2,
  Merge,
  Split,
  Type,
  Droplet,
  RotateCw,
  Image as ImageIcon,
  Upload,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PDFToolsClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const { toast } = useToast();

  const tools = [
    {
      id: "convert",
      title: "Convert to PDF",
      description: "Convert Word, Excel, PowerPoint, and images to PDF",
      icon: FileText,
      endpoint: "/api/pdf/convert",
      accept: ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png",
    },
    {
      id: "compress",
      title: "Compress PDF",
      description: "Reduce PDF file size while maintaining quality",
      icon: Minimize2,
      endpoint: "/api/pdf/compress",
      accept: ".pdf",
    },
    {
      id: "merge",
      title: "Merge PDFs",
      description: "Combine multiple PDF files into one",
      icon: Merge,
      endpoint: "/api/pdf/merge",
      accept: ".pdf",
      multiple: true,
    },
    {
      id: "split",
      title: "Split PDF",
      description: "Split PDF into separate pages or sections",
      icon: Split,
      endpoint: "/api/pdf/split",
      accept: ".pdf",
    },
    {
      id: "extract",
      title: "Extract Text",
      description: "Extract text content from PDF files",
      icon: Type,
      endpoint: "/api/pdf/extract-text",
      accept: ".pdf",
    },
    {
      id: "watermark",
      title: "Add Watermark",
      description: "Add text watermark to PDF pages",
      icon: Droplet,
      endpoint: "/api/pdf/watermark",
      accept: ".pdf",
    },
    {
      id: "rotate",
      title: "Rotate Pages",
      description: "Rotate PDF pages by 90, 180, or 270 degrees",
      icon: RotateCw,
      endpoint: "/api/pdf/rotate",
      accept: ".pdf",
    },
    {
      id: "to-image",
      title: "PDF to Image",
      description: "Convert PDF pages to image files",
      icon: ImageIcon,
      endpoint: "/api/pdf/pdf-to-image",
      accept: ".pdf",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, multiple?: boolean) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selectedFiles);
    setResult(null);
  };

  const handleProcess = async (tool: typeof tools[0], additionalData?: Record<string, string>) => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a file to process",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(tool.endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Processing failed");
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Success!",
        description: "File processed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result?.url) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">PDF Tools</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Professional PDF processing tools for all your needs
        </p>
      </div>

      <Tabs defaultValue="convert" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-4 lg:grid-cols-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <TabsTrigger key={tool.id} value={tool.id} className="flex items-center space-x-1">
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{tool.title.split(" ")[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <TabsContent key={tool.id} value={tool.id}>
              <Card className="border-2">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor={`file-${tool.id}`}>
                      {tool.multiple ? "Select Files" : "Select File"}
                    </Label>
                    <div className="mt-2">
                      <Input
                        id={`file-${tool.id}`}
                        type="file"
                        accept={tool.accept}
                        multiple={tool.multiple}
                        onChange={(e) => handleFileChange(e, tool.multiple)}
                        className="cursor-pointer"
                      />
                    </div>
                    {files.length > 0 && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {files.length} file(s) selected
                      </p>
                    )}
                  </div>

                  {tool.id === "watermark" && (
                    <WatermarkOptions onProcess={(data) => handleProcess(tool, data)} processing={processing} />
                  )}

                  {tool.id === "rotate" && (
                    <RotateOptions onProcess={(data) => handleProcess(tool, data)} processing={processing} />
                  )}

                  {tool.id === "split" && (
                    <SplitOptions onProcess={(data) => handleProcess(tool, data)} processing={processing} />
                  )}

                  {tool.id !== "watermark" && tool.id !== "rotate" && tool.id !== "split" && (
                    <Button
                      onClick={() => handleProcess(tool)}
                      disabled={processing || files.length === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Process File
                        </>
                      )}
                    </Button>
                  )}

                  {result && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-100">
                              File Ready!
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {result.filename}
                            </p>
                          </div>
                          <Button onClick={handleDownload} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function WatermarkOptions({
  onProcess,
  processing,
}: {
  onProcess: (data: Record<string, string>) => void;
  processing: boolean;
}) {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState("0.3");

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="watermark-text">Watermark Text</Label>
        <Input
          id="watermark-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter watermark text"
        />
      </div>
      <div>
        <Label htmlFor="watermark-opacity">Opacity</Label>
        <Select value={opacity} onValueChange={setOpacity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.1">10%</SelectItem>
            <SelectItem value="0.2">20%</SelectItem>
            <SelectItem value="0.3">30%</SelectItem>
            <SelectItem value="0.5">50%</SelectItem>
            <SelectItem value="0.7">70%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => onProcess({ text, opacity })}
        disabled={processing}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Add Watermark
          </>
        )}
      </Button>
    </div>
  );
}

function RotateOptions({
  onProcess,
  processing,
}: {
  onProcess: (data: Record<string, string>) => void;
  processing: boolean;
}) {
  const [degrees, setDegrees] = useState("90");

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="rotation">Rotation Angle</Label>
        <Select value={degrees} onValueChange={setDegrees}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90">90° Clockwise</SelectItem>
            <SelectItem value="180">180°</SelectItem>
            <SelectItem value="270">270° (90° Counter-clockwise)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => onProcess({ degrees })}
        disabled={processing}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <RotateCw className="mr-2 h-4 w-4" />
            Rotate Pages
          </>
        )}
      </Button>
    </div>
  );
}

function SplitOptions({
  onProcess,
  processing,
}: {
  onProcess: (data: Record<string, string>) => void;
  processing: boolean;
}) {
  const [mode, setMode] = useState("all");
  const [pageRange, setPageRange] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="split-mode">Split Mode</Label>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages (Separate Files)</SelectItem>
            <SelectItem value="range">Specific Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mode === "range" && (
        <div>
          <Label htmlFor="page-range">Page Range (e.g., 1-3, 5, 7-9)</Label>
          <Input
            id="page-range"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="1-3, 5, 7-9"
          />
        </div>
      )}
      <Button
        onClick={() => onProcess({ mode, pageRange })}
        disabled={processing}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Split className="mr-2 h-4 w-4" />
            Split PDF
          </>
        )}
      </Button>
    </div>
  );
}
