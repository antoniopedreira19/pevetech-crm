import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, Target, TrendingUp, Activity } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
type Client = Tables<"clients">;
type Lead = Tables<"leads">;
type Task = Tables<"tasks">;

// Tipagem manual para o histórico enquanto o types.ts não atualiza
interface MrrHistory {
  id: string;
  client_id: string;
  previous_value: number;
  new_value: number;
  reason: string | null;
  effective_date: string;
  created_at: string;
}

// --- Helper Functions ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const getLast6MonthsPlus2 = () => {
  const months = [];
  for (let i = 5; i >= -2; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  return months;
};

const getInitials = (name: string | null) => {
  if (!name) return "CL";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// --- Sub-components ---

const KPICard = ({ title, value, icon: Icon, delay }: { title: string; value: string; icon: any; delay: number }) => (
  <Card
    className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-neon/10 blur-3xl group-hover:bg-neon/20 transition-all" />
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-background/50 border border-border/50 text-neon shadow-sm">
          <Icon size={20} />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      </div>
    </CardContent>
  </Card>
);

const RevenueChart = ({ data }: { data: any[] }) => {
  const lastRealIndex = (() => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (!data[i].isFuture) return i;
    }
    return -1;
  })();
  
  // Prepare split data for chart
  const chartItems = data.map((d: any, i: number) => ({
    ...d,
    realValue: !d.isFuture ? d.value : undefined,
    projValue: d.isFuture || i === lastRealIndex ? d.value : undefined,
  }));
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartItems}>
          <defs>
            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--neon))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--neon))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMrrFuture" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--neon))" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(var(--neon))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => `R$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number, name: string, props: any) => [
              formatCurrency(value),
              props.payload.isFuture ? "MRR (Projeção)" : "MRR",
            ]}
          />
          <Area
            type="monotone"
            dataKey="realValue"
            stroke="hsl(var(--neon))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMrr)"
            name="MRR"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="projValue"
            stroke="hsl(var(--neon))"
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeOpacity={0.5}
            fillOpacity={1}
            fill="url(#colorMrrFuture)"
            name="Projeção"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const FunnelChart = ({ data }: { data: any[] }) => (
  <div className="h-[200px] w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          width={100}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "hsl(var(--muted))" : "hsl(var(--neon))"}
              fillOpacity={0.6 + index * 0.2}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [mrrHistory, setMrrHistory] = useState<MrrHistory[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, l, h] = await Promise.all([
          supabase.from("clients").select("*"),
          supabase.from("leads").select("*"),
          // Usamos 'as any' para contornar a falta do tipo no SDK enquanto não há Sync
          (supabase as any).from("client_mrr_history").select("*").order("effective_date", { ascending: true }),
        ]);
        if (c.data) setClients(c.data);
        if (l.data) setLeads(l.data);
        if (h.data) setMrrHistory(h.data as MrrHistory[]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === "active");
    const mrr = activeClients.reduce((sum, c) => sum + (Number(c.monthly_value) || 0), 0);
    const avgTicket = activeClients.length > 0 ? mrr / activeClients.length : 0;
    const pipelineValue = leads.length * avgTicket * 0.2;

    return { mrr, activeClients: activeClients.length, avgTicket, pipelineValue, totalLeads: leads.length };
  }, [clients, leads]);

  const chartData = useMemo(() => {
    const months = getLast6MonthsPlus2();
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return months.map((monthDate) => {
      const isFuture = monthDate > currentMonth;
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      const referenceEnd = endOfMonth;

      const clientsStarted = clients.filter((c) => {
        if (!c.start_date) return false;
        const [year, month, day] = c.start_date.split("-").map(Number);
        const startDateAbsolute = new Date(year, month - 1, day, 0, 0, 0);
        return startDateAbsolute <= referenceEnd;
      });

      let totalMrrForMonth = 0;

      clientsStarted.forEach((client) => {
        const historyForClient = mrrHistory.filter(
          (h) => h.client_id === client.id && new Date(h.effective_date) <= referenceEnd,
        );

        if (historyForClient.length > 0) {
          totalMrrForMonth += Number(historyForClient[historyForClient.length - 1].new_value) || 0;
        } else {
          totalMrrForMonth += Number(client.monthly_value) || 0;
        }
      });

      return {
        name: monthDate.toLocaleDateString("pt-BR", { month: "short" }),
        value: totalMrrForMonth,
        isFuture,
      };
    });
  }, [clients, mrrHistory]);

  const funnelData = useMemo(() => {
    const statusCounts = leads.reduce(
      (acc, lead) => {
        acc[lead.status || "new"] = (acc[lead.status || "new"] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return [
      { name: "Novos Leads", value: statusCounts["new"] || 0 },
      { name: "Em Negociação", value: (statusCounts["contacted"] || 0) + (statusCounts["meeting"] || 0) },
      { name: "Fechados", value: statusCounts["won"] || 0 },
    ];
  }, [leads]);

  const topClients = useMemo(() => {
    return [...clients]
      .filter((c) => c.status === "active")
      .sort((a, b) => (Number(b.monthly_value) || 0) - (Number(a.monthly_value) || 0))
      .slice(0, 5);
  }, [clients]);

  if (loading)
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral da performance da Pevetech.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="MRR Total" value={formatCurrency(metrics.mrr)} icon={DollarSign} delay={0} />
        <KPICard title="Clientes Ativos" value={String(metrics.activeClients)} icon={Users} delay={100} />
        <KPICard title="Ticket Médio" value={formatCurrency(metrics.avgTicket)} icon={Target} delay={200} />
        <KPICard
          title="Pipeline Ativo (Est.)"
          value={formatCurrency(metrics.pipelineValue)}
          icon={Activity}
          delay={300}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Crescimento de Receita</CardTitle>
            <CardDescription>Evolução do MRR real + projeção dos próximos 2 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Funil de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelChart data={funnelData} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Clientes (MRR)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-4">
                  {topClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between border-b border-border/40 last:border-0 pb-3 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarImage src={client.logo_url || undefined} alt={client.company_name || ""} />
                          <AvatarFallback className="bg-secondary text-[10px] font-bold">
                            {getInitials(client.company_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{client.company_name}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{client.name}</p>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-neon font-mono text-right">
                        {formatCurrency(Number(client.monthly_value) || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
