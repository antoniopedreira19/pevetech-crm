import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Lead = Tables<"leads">;
type LeadStatus = Database["public"]["Enums"]["lead_status"];

const columns: { status: LeadStatus; label: string }[] = [
  { status: "new", label: "Novo" },
  { status: "contacted", label: "Contatado" },
  { status: "meeting", label: "Reunião" },
  { status: "proposal", label: "Proposta" },
  { status: "closed_won", label: "Fechado ✓" },
  { status: "closed_lost", label: "Perdido" },
];

const CRMKanban = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (data) setLeads(data);
    };
    load();
  }, []);

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = async (newStatus: LeadStatus) => {
    if (!draggedId) return;
    const lead = leads.find((l) => l.id === draggedId);
    if (!lead || lead.status === newStatus) {
      setDraggedId(null);
      return;
    }

    setLeads((prev) => prev.map((l) => (l.id === draggedId ? { ...l, status: newStatus } : l)));
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", draggedId);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      setLeads((prev) => prev.map((l) => (l.id === draggedId ? { ...l, status: lead.status } : l)));
    }
    setDraggedId(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">CRM — Pipeline</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.status);
          return (
            <div
              key={col.status}
              className="min-w-[240px] flex-shrink-0 bg-card rounded-lg border border-border"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-display font-semibold text-foreground">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{colLeads.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    className="p-3 rounded-md bg-background border border-border hover:border-neon-dim cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    {lead.company && <p className="text-xs text-muted-foreground mt-1">{lead.company}</p>}
                    {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CRMKanban;
