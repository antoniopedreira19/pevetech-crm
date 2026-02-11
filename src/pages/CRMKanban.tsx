import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Search, Plus, MoreHorizontal, Calendar, DollarSign, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// --- Types ---
type Lead = Tables<"leads">;

// Status/Colunas padrão de um CRM de Serviços/SaaS
const KANBAN_COLUMNS = [
  { id: "new", title: "Novos Leads", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { id: "contacted", title: "Em Contato", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "meeting", title: "Reunião Agendada", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "proposal", title: "Proposta Enviada", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "won", title: "Fechado (Ganho)", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
];

// --- Helper Functions ---
const formatCurrency = (value: number | null) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

const getInitials = (name: string | null) => {
  if (!name) return "LD";
  return name.substring(0, 2).toUpperCase();
};

// --- Components ---

const KanbanCard = ({ lead }: { lead: Lead }) => {
  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border/40 bg-card/60 p-4 text-sm shadow-sm backdrop-blur-md transition-all hover:border-neon/50 hover:shadow-neon/10 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing">
      {/* Drag handle sutil que aparece no hover */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex items-start justify-between gap-2 pl-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg border border-border/50">
            <AvatarFallback className="rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
              {getInitials(lead.company || lead.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground truncate max-w-[140px]">
              {lead.company || lead.name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">{lead.email}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="pl-4 pt-2 flex items-center justify-between border-t border-border/40 mt-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-neon bg-neon/5 px-2 py-1 rounded-md">
          <DollarSign className="h-3 w-3" />
          {formatCurrency(null)}
        </div>

        {/* Placeholder para Avatar de quem está cuidando do lead (Assigned to) */}
        <Avatar className="h-6 w-6 border-2 border-background">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className="text-[10px]">AP</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

// --- Main Page ---

const CRMKanban = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error("Erro ao carregar leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6 h-full">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="flex gap-4 h-[70vh]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="min-w-[320px] h-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-6 animate-in fade-in duration-500 overflow-hidden">
      {/* Header Fixo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-2 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Pipeline de Vendas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie o fluxo de negociações da Pevetech.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar oportunidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card/30 border-border/50 focus-visible:ring-neon rounded-full"
            />
          </div>
          <Button className="bg-neon text-neon-foreground hover:bg-neon/90 shadow-lg shadow-neon/20 rounded-full px-6">
            <Plus className="mr-2 h-4 w-4" /> Novo Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board Area */}
      <ScrollArea className="flex-1 w-full pb-4">
        <div className="flex gap-6 px-2 h-full min-w-max pb-8">
          {KANBAN_COLUMNS.map((column) => {
            const columnLeads = filteredLeads.filter(
              // Fallback para 'new' se o status for nulo
              (lead) => (lead.status || "new") === column.id,
            );

            // Calcula o total financeiro da coluna
            const columnTotal = 0;

            return (
              <div key={column.id} className="flex flex-col w-[340px] shrink-0 h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`border font-medium ${column.color}`}>
                      {column.title}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {columnLeads.length}
                    </span>
                  </div>
                  {columnTotal > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">{formatCurrency(columnTotal)}</span>
                  )}
                </div>

                {/* Column Body (Drop Zone) */}
                <div className="flex-1 bg-card/20 border border-border/30 rounded-2xl p-3 flex flex-col gap-3 min-h-[150px]">
                  {columnLeads.map((lead) => (
                    <KanbanCard key={lead.id} lead={lead} />
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50 border-2 border-dashed border-border/50 rounded-xl">
                      <p className="text-xs text-muted-foreground mt-2">Nenhum lead nesta etapa.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CRMKanban;
