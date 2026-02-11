import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LabProjectViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!slug) return;
      try {
        const { data, error } = await (supabase as any)
          .from("lab_projects")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-[600px] w-full max-w-6xl rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
        <Button variant="outline" onClick={() => navigate("/labs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Labs
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center gap-4 p-4 border-b border-border/50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/labs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Labs
        </Button>
        <h1 className="text-lg font-semibold">{project.title}</h1>
      </header>
      <iframe
        src={project.external_url}
        className="flex-1 w-full border-none"
        title={project.title}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default LabProjectViewer;
