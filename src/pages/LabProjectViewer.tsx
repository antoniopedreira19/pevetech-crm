import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Beaker, ExternalLink, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LabProjectViewer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Busca o projeto pelo slug (tipagem dinâmica para evitar erro de build)
        const { data, error } = await (supabase as any)
          .from("lab_projects")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (error || !data) {
          console.error("Projeto não encontrado:", error);
          setProject(null);
        } else {
          setProject(data);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 text-neon animate-spin mb-4" />
        <p className="text-muted-foreground font-display tracking-widest animate-pulse">INICIALIZANDO EXPERIMENTO...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Experimento não encontrado</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Este projeto pode ter sido movido, desativado ou ainda está em fase de compilação privada.
        </p>
        <Button onClick={() => navigate("/labs")} variant="outline" className="border-neon/30 text-neon">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Laboratório
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* App Shell Header - Focado em Conversão */}
      <header className="h-16 w-full glass border-b border-border/50 flex items-center justify-between px-4 md:px-6 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/labs" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
            <ArrowLeft size={20} className="text-muted-foreground group-hover:text-foreground" />
          </Link>
          <div className="h-8 w-[1px] bg-border/50 mx-1 hidden sm:block" />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm md:text-base whitespace-nowrap">{project.title}</h2>
              <Badge variant="outline" className="text-[10px] h-4 border-neon/30 text-neon bg-neon/5 hidden md:flex">
                LABS BETA
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground hidden md:block">Ambiente de Testes Pevetech</p>
          </div>
        </div>

        {/* Branding Central (Logo pequena) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
          <img src={pevetechLogo} alt="Pevetech" className="h-10 opacity-80" />
        </div>

        {/* CTA de Conversão */}
        <div className="flex items-center gap-3">
          <a href="https://wa.me/SEUNUMERO" target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="bg-neon text-neon-foreground hover:bg-neon/90 font-semibold shadow-lg shadow-neon/20"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Quero um assim</span>
              <span className="sm:hidden">Consultar</span>
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-9 w-9 p-0"
            onClick={() => window.open(project.external_url, "_blank")}
            title="Abrir em nova aba"
          >
            <ExternalLink size={18} />
          </Button>
        </div>
      </header>

      {/* Iframe Viewport */}
      <main className="flex-1 w-full bg-[#0a0a0a] relative">
        <iframe
          src={project.external_url}
          title={project.title}
          className="w-full h-full border-none shadow-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* Sombra interna para dar profundidade ao Iframe */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]" />
      </main>
    </div>
  );
};

export default LabProjectViewer;
