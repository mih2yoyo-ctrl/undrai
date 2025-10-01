
"use client";

import { useState } from "react";
import { QrCode, Download, Loader2, Wifi, User, Link as LinkIcon, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

export default function QRGeneratorClient() {
  const [qrData, setQrData] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState("png");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const { toast } = useToast();

  const generateQR = async (type: string, data: Record<string, string>) => {
    setGenerating(true);
    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          data,
          format,
          darkColor,
          lightColor,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const result = await response.json();
      setQrImage(result.image);
      setQrData(result.data);

      toast({
        title: "QR Code Generated!",
        description: "Your QR code is ready to download",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `qrcode.${format}`;
    link.click();
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Create customizable QR codes for any purpose
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Generator */}
        <div>
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="url">
                <LinkIcon className="mr-1 h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="text">
                <MessageSquare className="mr-1 h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="wifi">
                <Wifi className="mr-1 h-4 w-4" />
                WiFi
              </TabsTrigger>
              <TabsTrigger value="contact">
                <User className="mr-1 h-4 w-4" />
                Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url">
              <URLForm onGenerate={(data) => generateQR("url", data)} generating={generating} />
            </TabsContent>

            <TabsContent value="text">
              <TextForm onGenerate={(data) => generateQR("text", data)} generating={generating} />
            </TabsContent>

            <TabsContent value="wifi">
              <WiFiForm onGenerate={(data) => generateQR("wifi", data)} generating={generating} />
            </TabsContent>

            <TabsContent value="contact">
              <ContactForm onGenerate={(data) => generateQR("contact", data)} generating={generating} />
            </TabsContent>
          </Tabs>

          {/* Customization */}
          <Card className="mt-6 border-2">
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Personalize your QR code appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="format">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dark-color">Dark Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="dark-color"
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="h-10 w-full cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="light-color">Light Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="light-color"
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="h-10 w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Your generated QR code will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {qrImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 bg-white p-4">
                    <Image src={qrImage} alt="QR Code" fill className="object-contain" />
                  </div>
                  <Button onClick={handleDownload} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  {qrData && (
                    <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Encoded Data:</p>
                      <p className="mt-1 break-all text-sm text-slate-900 dark:text-slate-100">{qrData}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed">
                  <div className="text-center">
                    <QrCode className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Fill in the form and click generate
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function URLForm({ onGenerate, generating }: { onGenerate: (data: Record<string, string>) => void; generating: boolean }) {
  const [url, setUrl] = useState("");

  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label htmlFor="url">Website URL</Label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <Button
          onClick={() => onGenerate({ url })}
          disabled={generating || !url}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function TextForm({ onGenerate, generating }: { onGenerate: (data: Record<string, string>) => void; generating: boolean }) {
  const [text, setText] = useState("");

  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label htmlFor="text">Text Content</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter any text..."
            rows={4}
          />
        </div>
        <Button
          onClick={() => onGenerate({ text })}
          disabled={generating || !text}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function WiFiForm({ onGenerate, generating }: { onGenerate: (data: Record<string, string>) => void; generating: boolean }) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState("WPA");

  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label htmlFor="ssid">Network Name (SSID)</Label>
          <Input
            id="ssid"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder="My WiFi Network"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        <div>
          <Label htmlFor="security">Security Type</Label>
          <Select value={security} onValueChange={setSecurity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => onGenerate({ ssid, password, security })}
          disabled={generating || !ssid}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function ContactForm({ onGenerate, generating }: { onGenerate: (data: Record<string, string>) => void; generating: boolean }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");

  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Company Name"
          />
        </div>
        <Button
          onClick={() => onGenerate({ name, phone, email, organization })}
          disabled={generating || !name}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
