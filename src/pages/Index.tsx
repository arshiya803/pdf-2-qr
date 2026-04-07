import { Button } from "@/components/ui/button";
import { QrCode, FileText, Share2, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { icon: FileText, title: "Upload PDFs", desc: "Securely upload and store your PDF documents in the cloud." },
    { icon: QrCode, title: "Generate QR Codes", desc: "Instantly create QR codes linked to your PDF files." },
    { icon: Share2, title: "Share Anywhere", desc: "Share via WhatsApp, Telegram, Email or direct link." },
    { icon: Shield, title: "Secure Storage", desc: "Your files are protected with enterprise-grade security." },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 -left-32 w-96 h-96 rounded-full gradient-primary opacity-10 blur-3xl" />
          <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] rounded-full gradient-accent opacity-10 blur-3xl" />
        </div>
        <nav className="relative flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">PDF to QR</span>
          </div>
          <Button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="gradient-primary text-primary-foreground"
          >
            {user ? "Dashboard" : "Get Started"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </nav>

        <section className="relative text-center px-6 py-20 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Turn Your <span className="bg-clip-text text-transparent gradient-primary">PDFs</span> into{" "}
            <span className="bg-clip-text text-transparent gradient-accent">QR Codes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Upload, generate, and share — all in one place. The fastest way to make your documents scannable.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate(user ? "/generate" : "/auth")} className="gradient-primary text-primary-foreground">
              <QrCode className="mr-2 h-5 w-5" /> Start Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate(user ? "/files" : "/auth")}>
              View My Files
            </Button>
          </div>
        </section>
      </div>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Everything You Need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all group">
              <div className="w-11 h-11 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} PDF to QR Code Manager. All rights reserved.
      </footer>
    </div>
  );
}
