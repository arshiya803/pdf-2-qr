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
    ? (location.state?.shareUrl || `${window.location.origin}/view/${selectedFile.public_share_id}`)
    : "";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("pdf_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setFiles(data || []));
  }, [user]);

  const shareVia = (method: string) => {
    const text = `Check out this PDF: ${shareUrl}`;
    switch (method) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
        break;
      case "telegram":
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out this PDF")}`, "_blank");
        break;
      case "email":
        window.open(`mailto:?subject=Shared PDF&body=${encodeURIComponent(text)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  const shareOptions = [
    { name: "WhatsApp", icon: MessageCircle, method: "whatsapp", color: "bg-green-500 hover:bg-green-600" },
    { name: "Telegram", icon: Send, method: "telegram", color: "bg-blue-500 hover:bg-blue-600" },
    { name: "Email", icon: Mail, method: "email", color: "bg-orange-500 hover:bg-orange-600" },
    { name: "Copy Link", icon: Copy, method: "copy", color: "bg-secondary hover:bg-secondary/90" },
  ];

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
              {shareOptions.map((opt) => (
                <Button
                  key={opt.method}
                  className={`${opt.color} text-primary-foreground h-14 text-base`}
                  onClick={() => shareVia(opt.method)}
                >
                  <opt.icon className="mr-2 h-5 w-5" /> {opt.name}
                </Button>
              ))}
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
