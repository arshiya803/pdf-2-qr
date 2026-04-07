import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Link2, MessageCircle, Mail, Send, Copy, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function SharePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(location.state?.file || null);

  const shareUrl = selectedFile
    ? (location.state?.shareUrl || supabase.storage.from("pdfs").getPublicUrl(selectedFile.file_path).data.publicUrl)
    : "";
  const shareText = selectedFile ? `Check out this PDF: ${selectedFile.file_name}` : "Check out this PDF";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(
    selectedFile ? `Shared PDF: ${selectedFile.file_name}` : "Shared PDF"
  )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("pdf_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setFiles(data || []));
  }, [user]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Share Files</h1>
          <p className="text-muted-foreground">Share your PDFs via WhatsApp, Telegram, Email or link.</p>
        </div>

        {!selectedFile ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Select a file to share</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No files to share yet.</p>
                  <Button className="mt-3" variant="outline" onClick={() => navigate("/generate")}>Upload PDF</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((f) => (
                    <button
                      key={f.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      onClick={() => setSelectedFile(f)}
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{f.file_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-card">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <QRCodeSVG value={shareUrl} size={180} level="H" />
                <p className="text-sm font-medium">{selectedFile.file_name}</p>
                <p className="text-xs text-muted-foreground break-all">{shareUrl}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-14 text-base" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                </a>
              </Button>
              <Button variant="outline" className="h-14 text-base" asChild>
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                  <Send className="mr-2 h-5 w-5" /> Telegram
                </a>
              </Button>
              <Button variant="outline" className="h-14 text-base" asChild>
                <a href={emailUrl}>
                  <Mail className="mr-2 h-5 w-5" /> Email
                </a>
              </Button>
              <Button variant="outline" className="h-14 text-base" onClick={handleCopyLink}>
                <Copy className="mr-2 h-5 w-5" /> Copy Link
              </Button>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setSelectedFile(null)}>
              Share Another File
            </Button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
