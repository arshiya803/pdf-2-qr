import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, QrCode, ExternalLink } from "lucide-react";

export default function ViewFile() {
  const { shareId } = useParams();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      const { data, error } = await supabase
        .from("pdf_files")
        .select("*")
        .eq("public_share_id", shareId)
        .maybeSingle();

      if (!data || error) {
        setNotFound(true);
      } else {
        setFile(data);
      }
      setLoading(false);
    };
    fetchFile();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="text-xl font-bold mb-2">File Not Found</h1>
          <p className="text-muted-foreground">This file may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const publicUrl = supabase.storage.from("pdfs").getPublicUrl(file.file_path).data.publicUrl;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg shadow-elevated">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl gradient-primary flex items-center justify-center">
            <QrCode className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">{file.file_name}</h1>
          <p className="text-sm text-muted-foreground">
            Shared on {new Date(file.created_at).toLocaleDateString()}
            {file.file_size && ` • ${(file.file_size / 1024 / 1024).toFixed(2)} MB`}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button className="gradient-primary text-primary-foreground" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
              </a>
            </Button>
            <Button variant="outline" onClick={async () => {
              try {
                const res = await fetch(publicUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.file_name;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                window.open(publicUrl, "_blank");
              }
            }}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
