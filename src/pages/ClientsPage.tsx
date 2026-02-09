import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DollarSign, Building2 } from "lucide-react";

type Client = Tables<"clients">;

const statusLabel: Record<string, string> = {
  active: "Ativo",
  churned: "Churned",
  paused: "Pausado",
};

const statusColor: Record<string, string> = {
  active: "bg-neon/20 text-neon",
  churned: "bg-destructive/20 text-destructive",
  paused: "bg-muted text-muted-foreground",
};

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    supabase.from("clients").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setClients(data);
    });
  }, []);

  const mrr = clients
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + (c.monthly_value || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Clientes</h1>

      {/* MRR Card */}
      <div className="p-6 rounded-lg bg-card border border-neon-dim glow-neon mb-8 max-w-sm">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="text-neon" size={22} />
          <span className="text-sm text-muted-foreground">Receita Recorrente Mensal</span>
        </div>
        <p className="text-3xl font-bold text-neon">
          R$ {mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-neon-dim transition-colors"
          >
            <div className="flex items-center gap-4">
              {client.logo_url ? (
                <img src={client.logo_url} alt={client.name} className="w-10 h-10 rounded-md object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                  <Building2 className="text-muted-foreground" size={18} />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.company_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground font-medium">
                R$ {(client.monthly_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[client.status || "active"]}`}>
                {statusLabel[client.status || "active"]}
              </span>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-12">Nenhum cliente cadastrado.</p>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;
