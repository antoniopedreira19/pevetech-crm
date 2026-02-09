import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, Briefcase, CheckSquare } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type Lead = Tables<"leads">;
type Task = Tables<"tasks">;

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) => (
  <div className="p-6 rounded-lg bg-card border border-border">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-md ${accent ? "bg-neon/10" : "bg-secondary"}`}>
        <Icon className={accent ? "text-neon" : "text-muted-foreground"} size={20} />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${accent ? "text-neon" : "text-foreground"}`}>{value}</p>
  </div>
);

const DashboardOverview = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const load = async () => {
      const [c, l, t] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("leads").select("*"),
        supabase.from("tasks").select("*"),
      ]);
      if (c.data) setClients(c.data);
      if (l.data) setLeads(l.data);
      if (t.data) setTasks(t.data);
    };
    load();
  }, []);

  const mrr = clients
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + (c.monthly_value || 0), 0);

  const pendingTasks = tasks.filter((t) => !t.is_completed).length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Visão Geral</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="MRR" value={`R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} accent />
        <StatCard icon={Users} label="Clientes Ativos" value={String(clients.filter((c) => c.status === "active").length)} />
        <StatCard icon={Briefcase} label="Novos Leads" value={String(newLeads)} />
        <StatCard icon={CheckSquare} label="Tarefas Pendentes" value={String(pendingTasks)} />
      </div>
    </div>
  );
};

export default DashboardOverview;
