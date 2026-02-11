import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  Beaker, 
  ExternalLink, 
  MoreHorizontal,
  Terminal,
  Bot,
  Database,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

// Tipagem baseada na tabela que criamos
type LabProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  external_url: string;
  icon: string;
  stack: string[];
  is_active: boolean;
};

// Componente do Drawer de Criação
const NewProjectDrawer = ({ 
  open, 
  onOpenChange,
  onSuccess 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  onSuccess: () => void 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "SaaS Interno",
    status: "Em Desenvolvimento",
    external_url: "",
    stack: "" // Vamos receber como texto separado por vírgula e tratar no submit
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Converte a string de stack em um array limpo
    const stackArray = formData.stack
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");

    try {
      const { error } = await (supabase as any).from("lab_projects").insert([{
        title: formData.title,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'), // Garante que o slug seja válido
        description: formData.description,
        category: formData.category,
        status: formData.status,
        external_url: formData.external_url,
        stack: stackArray,
        is_active: true // Sempre cria como ativo
      }]);

      if (error) throw error;

      toast.success("Experimento criado com sucesso!");
      onSuccess();
      onOpenChange(false);
      setFormData({ title: "", slug: "", description: "", category: "SaaS Interno", status: "Em Desenvolvimento", external_url: "", stack: "" });
    } catch (error: any) {
      console.error("Erro ao salvar projeto:", error);
      toast.error(error.message || "Erro ao cadastrar. Verifique se o Slug já existe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] border-l border-border/50 bg-background/95 backdrop-blur-xl p-0 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-full">
          <SheetHeader className="p-6 pb-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <Beaker className="h-6 w-6 text-neon" />
              Novo Experimento
            </SheetTitle>
            <SheetDescription>
              Cadastre um novo MVP do Lovable ou fluxo do n8n para expor na vitrine do Labs.
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nome do Projeto *</Label>
                <Input id="title" name="title" required value={formData.title} onChange={handleChange} className="bg-card/50" placeholder="Ex: AI Pitch Generator" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground bg-muted px-3 py-2 border border-r-0 border-border/50 rounded-l-md text-sm">/labs/</span>
                  <Input id="slug" name="slug" required value={formData.slug} onChange={handleChange} className="bg-card/50 rounded-l-none" placeholder="ai-pitch-generator" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_url">URL Externa (Lovable/App) *</Label>
                <Input id="external_url" name="external_url" required type="url" value={formData.external_url} onChange={handleChange} className="bg-card/50 font-mono text-sm" placeholder="https://projeto-lovable.app" />
                <p className="text-[11px] text-muted-foreground">O link do sistema que será carregado dentro do Iframe.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-card/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                  placeholder="Explique o que o sistema faz..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleChange} className="bg-card/50" placeholder="Ex: Automação" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" name="status" value={formData.status} onChange={handleChange} className="bg-card/50" placeholder="Ex: Beta Privado" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stack">Stack Tecnológica (Separada por vírgula)</Label>
                <Input id="stack" name="stack" value={formData.stack} onChange={handleChange} className="bg-card/50" placeholder="Ex: Lovable, Supabase, React" />
              </div>
            </div>
          </div>

          <SheetFooter className="p-6 border-t border-border/50 bg-background/95 sticky bottom-0 z-10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-neon text-neon-foreground hover:bg-neon/90">
              {isSubmitting ? "Salvando..." : "Salvar Projeto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// Página Principal de Administração
const LabsAdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("lab_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      toast.error("Não foi possível carregar o laboratório.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("lab_projects")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(currentStatus ? "Projeto ocultado da vitrine." : "Projeto publicado na vitrine!");
      loadProjects(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar o status do projeto.");
    }
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja apagar este experimento?")) return;
    
    try {
      const { error } = await (supabase as any).from("lab_projects").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Projeto excluído com sucesso.");
      loadProjects();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir o projeto.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Beaker className="text-neon h-8 w-8" />
            Labs Admin
          </h1>
           <p className="text-muted-foreground mt-1">Gerencie os projetos e MVPs da vitrine do Pevetech Labs.</p>
        </div>
        <Button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-neon text-neon-foreground hover:bg-neon/90 shadow-lg shadow-neon/20 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Experimento
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border/50 bg-card/20 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Nenhum projeto no laboratório</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md">
            Você ainda não tem nenhum MVP cadastrado. Crie o seu primeiro experimento para exibi-lo no site público.
          </p>
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
            Adicionar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="relative flex flex-col p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm group hover:border-neon/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-background border ${project.is_active ? 'border-neon/30 text-neon' : 'border-border text-muted-foreground'}`}>
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-none">{project.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">/labs/{project.slug}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur border-border/50">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(project.external_url, '_blank')}>
                      <ExternalLink className="mr-2 h-4 w-4" /> Testar MVP
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer" onClick={() => deleteProject(project.id)}>
                      Excluir Projeto
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <Badge variant="secondary" className="text-[10px] bg-secondary/50">{project.category}</Badge>
                <Badge variant="outline" className="text-[10px] border-border/50">{project.status}</Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                {project.description || "Nenhuma descrição fornecida."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={project.is_active} 
                    onCheckedChange={() => toggleStatus(project.id, project.is_active)}
                  />
                  <span className={`text-xs font-medium ${project.is_active ? 'text-neon' : 'text-muted-foreground'}`}>
                    {project.is_active ? 'Público' : 'Rascunho'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => window.open(`/labs/${project.slug}`, '_blank')}>
                  Ver Página <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewProjectDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        onSuccess={loadProjects}
      />
    </div>
  );
};

export default LabsAdminPage;
