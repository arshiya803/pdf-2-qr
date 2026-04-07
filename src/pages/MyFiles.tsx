import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Share2, QrCode, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchFiles = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("pdf_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [user]);

  const handleDelete = async (file: any) => {
    try {
      await supabase.storage.from("pdfs").remove([file.file_path]);
      await supabase.from("pdf_files").delete().eq("id", file.id);
      toast.success("File deleted");
      fetchFiles();
    } catch (err: any) {
      toast.error("Delete failed");
    }
  };

  const handleDownload = (file: any) => {
    const { data } = supabase.storage.from("pdfs").getPublicUrl(file.file_path);
    window.open(data.publicUrl, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="text-muted-foreground">View, download, share and manage your uploaded PDFs.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : files.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No files uploaded yet.</p>
              <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => navigate("/generate")}>
                Upload PDF
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => {
              const shareUrl = `${window.location.origin}/view/${file.public_share_id}`;
              return (
                <Card key={file.id} className="shadow-card hover:shadow-elevated transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : "—"} • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handleDownload(file)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedQR(shareUrl)}>
                        <QrCode className="h-3.5 w-3.5 mr-1" /> QR
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate("/share", { state: { file, shareUrl } })}>
                        <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(file)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              {selectedQR && <QRCodeSVG value={selectedQR} size={220} level="H" />}
              <p className="text-xs text-muted-foreground text-center break-all">{selectedQR}</p>
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(selectedQR!); toast.success("Copied!"); }}>
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
