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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
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
  const styles = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    lead: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    churned: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  const badgeStyle = styles[status as keyof typeof styles] || styles.lead;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Desconhecido";
  return (
    <Badge variant="outline" className={`font-medium border ${badgeStyle}`}>
      {label}
    </Badge>
  );
};

// --- Formulário de Cliente (Drawer Reutilizável) ---
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

  useEffect(() => {
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
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (client) {
        const { error } = await supabase.from("clients").update(formData).eq("id", client.id);
        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("clients").insert([formData]);
        if (error) throw error;
        toast.success("Cliente cadastrado com sucesso!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar dados.");
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
              <Building2 className="h-6 w-6 text-neon" />
              {client ? "Editar Cliente" : "Novo Cliente"}
            </SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6 flex-1">
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
            <Separator className="bg-border/40" />
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
                    type="email"
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
            <Separator className="bg-border/40" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>MRR (R$)</Label>
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
          </div>
          <SheetFooter className="p-6 border-t border-border/50 bg-background/95 sticky bottom-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-neon text-neon-foreground hover:bg-neon/90">
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// --- Main Page Component ---
const ClientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Client[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data: clients, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setData(clients || []);
    } catch (error) {
      toast.error("Erro ao carregar clientes.");
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
        .update({ status: "inactive", monthly_value: 0 })
        .eq("id", client.id);
      if (error) throw error;
      toast.success(`${client.company_name} inativado (MRR zerado).`);
      loadClients();
    } catch (error) {
      toast.error("Erro ao inativar cliente.");
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
              <AvatarFallback className="bg-secondary text-xs font-medium">
                {getInitials(row.original.company_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-[15px] truncate">{row.original.company_name}</span>
              <span className="text-xs text-muted-foreground truncate">{row.original.setor || "Sem setor"}</span>
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
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{row.original.name}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> {formatPhoneNumber(row.original.phone)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "monthly_value",
        header: ({ column }) => <SortableHeader label="MRR / Valor" column={column} align="right" />,
        cell: ({ row }) => (
          <div className="font-medium font-mono text-neon text-right">{formatCurrency(row.original.monthly_value)}</div>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neon/10 hover:text-neon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur border-border/50">
                <DropdownMenuLabel>Gestão</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedClient(row.original);
                    setIsDrawerOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Editar Informações
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={() => handleInactivate(row.original)}
                  className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <UserX className="mr-2 h-4 w-4" /> Inativar (Zerar MRR)
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="text-neon h-8 w-8" />
            Carteira de Clientes
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={(table.getColumn("company_info")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("company_info")?.setFilterValue(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => {
              setSelectedClient(null);
              setIsDrawerOpen(true);
            }}
            className="bg-neon text-neon-foreground"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden flex-1 relative">
        <div className="relative overflow-auto h-full">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/90 border-b border-border/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-[11px]"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-neon/5 transition-colors group">
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
