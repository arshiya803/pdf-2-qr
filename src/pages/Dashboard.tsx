import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, QrCode, Share2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fileCount, setFileCount] = useState(0);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data, count } = await supabase
        .from("pdf_files")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setFileCount(count || 0);
      setRecentFiles(data || []);
    };
    fetchStats();
  }, [user]);

  const stats = [
    { title: "Total Files", value: fileCount, icon: FileText, color: "gradient-primary" },
    { title: "QR Codes", value: fileCount, icon: QrCode, color: "gradient-accent" },
    { title: "Shared", value: fileCount, icon: Share2, color: "gradient-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Manage your PDF files and QR codes.</p>
          </div>
          <Button onClick={() => navigate("/generate")} className="gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Upload PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Files</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-40" />
                <p>No files yet. Upload your first PDF!</p>
                <Button variant="outline" className="mt-3" onClick={() => navigate("/generate")}>
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/share", { state: { file } })}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
