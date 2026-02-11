import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Building2,
  User,
  Briefcase,
  DollarSign,
  Phone,
  Pencil,
  UserX,
  Mail,
} from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// --- Types ---
type Client = Tables<"clients">;

// --- Helper Functions ---
const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "Sem telefone";
  const cleaned = ("" + phone).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  return phone;
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

type Align = "left" | "center" | "right";

const alignTextClass: Record<Align, string> = { left: "text-left", center: "text-center", right: "text-right" };
const alignJustifyClass: Record<Align, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const SortableHeader = ({ label, column, align }: { label: string; column: any; align: Align }) => {
  const isSorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(isSorted === "asc")}
      className={cn(
        "h-8 px-0 w-full hover:bg-transparent group font-medium text-muted-foreground hover:text-foreground",
        "flex",
        alignJustifyClass[align],
      )}
    >
      <span>{label}</span>
      {isSorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4 text-neon" />
      ) : isSorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4 text-neon" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </Button>
  );
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paused: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    lead: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    churned: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const labelMap: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    paused: "Inativo",
    churned: "Cancelado",
    lead: "Lead",
  };

  const badgeStyle = styles[status || "lead"] || styles.lead;
  const label = labelMap[status || "lead"] || "Lead";
  return (
    <Badge variant="outline" className={`font-medium border ${badgeStyle}`}>
      {label}
    </Badge>
  );
};

// --- Form Drawer ---
const ClientFormDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  client?: Client | null;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mrrReason, setMrrReason] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    status: "active",
    start_date: new Date().toISOString().split("T")[0],
    monthly_value: 0,
    logo_url: "",
    setor: "",
  });

  const mrrChanged = client ? formData.monthly_value !== (client.monthly_value || 0) : false;

  useEffect(() => {
    if (open) {
      if (client) {
        setFormData({
          name: client.name || "",
          company_name: client.company_name || "",
          email: client.email || "",
          phone: client.phone || "",
          status: client.status || "active",
          start_date: client.start_date || new Date().toISOString().split("T")[0],
          monthly_value: client.monthly_value || 0,
          logo_url: client.logo_url || "",
          setor: client.setor || "",
        });
      } else {
        setFormData({
          name: "",
          company_name: "",
          email: "",
          phone: "",
          status: "active",
          start_date: new Date().toISOString().split("T")[0],
          monthly_value: 0,
          logo_url: "",
          setor: "",
        });
      }
      setMrrReason("");
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mrrChanged && !mrrReason.trim()) {
      toast.error("Informe o motivo da alteração do MRR.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...formData, status: formData.status as any };

      if (client) {
        // Se MRR mudou, registrar no histórico
        if (mrrChanged) {
          const { error: histError } = await supabase.from("client_mrr_history" as any).insert([{
            client_id: client.id,
            previous_value: client.monthly_value || 0,
            new_value: formData.monthly_value,
            reason: mrrReason.trim(),
            effective_date: new Date().toISOString(),
          }]);
          if (histError) throw histError;
        }
        const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
        if (error) throw error;
        toast.success("Cliente atualizado!");
      } else {
        const { data: newClient, error } = await supabase.from("clients").insert([payload]).select().single();
        if (error) throw error;
        // Registro inicial de MRR
        if (newClient) {
          await supabase.from("client_mrr_history" as any).insert([{
            client_id: newClient.id,
            previous_value: 0,
            new_value: formData.monthly_value,
            reason: "Cadastro inicial",
            effective_date: new Date().toISOString(),
          }]);
        }
        toast.success("Cliente cadastrado!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] border-l border-border/50 bg-background/95 backdrop-blur-xl p-0 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-full">
          <SheetHeader className="p-6 border-b border-border/50 sticky top-0 bg-background/95 z-10">
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="text-neon" /> {client ? "Editar Dados" : "Novo Cliente"}
            </SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <Label>Nome da Empresa *</Label>
              <Input
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="bg-card/50"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Setor</Label>
                  <Input
                    value={formData.setor}
                    onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    className="bg-card/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Logo URL</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="bg-card/50"
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Nome do Responsável *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-card/50"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>E-mail</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-card/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-card/50"
                    placeholder="(71) 99999-9999"
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Valor MRR (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthly_value}
                  onChange={(e) => setFormData({ ...formData, monthly_value: parseFloat(e.target.value) || 0 })}
                  className="bg-card/50 font-mono text-neon"
                />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="churned">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-card/50"
              />
            </div>
            {mrrChanged && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-amber-400">Motivo da alteração do MRR *</Label>
                <Input
                  value={mrrReason}
                  onChange={(e) => setMrrReason(e.target.value)}
                  placeholder="Ex: Novo módulo contratado, Reajuste anual..."
                  className="bg-card/50 border-amber-500/30 focus-visible:ring-amber-500/50"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  De {formatCurrency(client?.monthly_value || 0)} → {formatCurrency(formData.monthly_value)}
                </p>
              </div>
            )}
          </div>
          <SheetFooter className="p-6 border-t border-border/50 sticky bottom-0 bg-background/95">
            <Button type="submit" className="w-full bg-neon text-neon-foreground">
              {isSubmitting ? "Gravando..." : "Salvar Dados"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// --- Main Page ---
const ClientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Client[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "monthly_value", desc: true }]); // Ordenação default por MRR decrescente
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data: clients, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      setData(clients || []);
    } catch (error) {
      toast.error("Falha ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleInactivate = async (client: Client) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({ status: "inactive" as any, monthly_value: 0 })
        .eq("id", client.id);
      if (error) throw error;
      toast.success(`${client.company_name} inativado.`);
      loadClients();
    } catch (error) {
      toast.error("Erro ao inativar.");
    }
  };

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: "company_info",
        accessorFn: (row) => row.company_name,
        header: ({ column }) => <SortableHeader label="Empresa" column={column} align="left" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage src={row.original.logo_url || undefined} />
              <AvatarFallback>{getInitials(row.original.company_name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px]">{row.original.company_name}</span>
              <span className="text-xs text-muted-foreground">{row.original.setor}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <StatusBadge status={row.getValue("status")} />
          </div>
        ),
      },
      {
        id: "contact_info",
        header: "Contato Principal",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{row.original.name}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={11} className="text-neon/70" /> {formatPhoneNumber(row.original.phone)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Mail size={11} className="text-neon/70" /> {row.original.email || "Sem e-mail"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "monthly_value",
        header: ({ column }) => <SortableHeader label="MRR" column={column} align="right" />,
        cell: ({ row }) => (
          <div className="text-right font-mono text-neon font-bold">{formatCurrency(row.original.monthly_value)}</div>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedClient(row.original);
                    setIsDrawerOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleInactivate(row.original)} className="text-red-500">
                  <UserX className="mr-2 h-4 w-4" /> Inativar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading)
    return (
      <div className="p-8">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center border-b border-border/40 pb-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Building2 className="text-neon" /> Clientes
        </h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar..."
            value={(table.getColumn("company_info")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("company_info")?.setFilterValue(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={() => {
              setSelectedClient(null);
              setIsDrawerOpen(true);
            }}
            className="bg-neon text-neon-foreground"
          >
            <Plus size={16} className="mr-2" /> Novo
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/90 border-b border-border/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-[10px] tracking-widest"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/40">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-neon/5 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ClientFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={loadClients}
        client={selectedClient}
      />
    </div>
  );
};

export default ClientsPage;
