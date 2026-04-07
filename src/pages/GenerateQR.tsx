import { useState, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, QrCode, Check, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function GenerateQR() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setQrUrl(null);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("pdfs").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { data: insertData, error: insertError } = await supabase
        .from("pdf_files")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          qr_code_url: publicUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const shareUrl = `${window.location.origin}/view/${insertData.public_share_id}`;
      setQrUrl(shareUrl);
      setShareId(insertData.public_share_id);
      toast.success("PDF uploaded & QR code generated!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Generate QR Code</h1>
          <p className="text-muted-foreground">Upload a PDF and get a shareable QR code instantly.</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-12 w-12 text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="font-medium">Click to select PDF</p>
                  <p className="text-sm text-muted-foreground">PDF files only, max 20MB</p>
                </div>
              )}
            </div>

            {file && !qrUrl && (
              <Button
                className="w-full mt-4 gradient-primary text-primary-foreground"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" /> Generate QR Code
                  </span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {qrUrl && (
          <Card className="shadow-elevated animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Check className="h-5 w-5" /> QR Code Ready!
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div id="qr-canvas" className="p-4 bg-card rounded-xl border">
                <QRCodeSVG value={qrUrl} size={200} level="H" />
              </div>
              <p className="text-sm text-muted-foreground text-center break-all">{qrUrl}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(qrUrl); toast.success("Link copied!"); }}>
                  Copy Link
                </Button>
                <Button variant="outline" onClick={() => {
                  const svg = document.querySelector("#qr-canvas svg") as SVGElement;
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement("canvas");
                  canvas.width = 250; canvas.height = 250;
                  const ctx = canvas.getContext("2d")!;
                  const img = new Image();
                  img.onload = () => {
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(0, 0, 250, 250);
                    ctx.drawImage(img, 25, 25, 200, 200);
                    const a = document.createElement("a");
                    a.download = "qr-code.png";
                    a.href = canvas.toDataURL("image/png");
                    a.click();
                  };
                  img.src = "data:image/svg+xml;base64," + btoa(svgData);
                }}>
                  <Download className="mr-1 h-4 w-4" /> Download QR
                </Button>
                <Button onClick={() => navigate("/share", { state: { shareUrl: qrUrl, shareId } })} className="gradient-primary text-primary-foreground">
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
