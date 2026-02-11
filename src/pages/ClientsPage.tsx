import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
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

const getInitials = (name: string | null) => {
  if (!name) return "CL";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// --- Status Badge Component ---
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
    <Badge variant="outline" className={`font-medium border ${badgeStyle} transition-colors`}>
      {label}
    </Badge>
  );
};

// --- Formulário de Novo Cliente (Drawer) ---
const NewClientDrawer = ({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("clients").insert([
        {
          name: formData.name,
          company_name: formData.company_name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status as any,
          start_date: formData.start_date,
          monthly_value: formData.monthly_value,
          logo_url: formData.logo_url,
          setor: formData.setor,
        },
      ]);

      if (error) throw error;

      toast.success("Cliente cadastrado com sucesso!");
      onSuccess();
      onOpenChange(false);

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
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(error.message || "Erro ao cadastrar o cliente. Verifique os dados.");
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
              Novo Cliente
            </SheetTitle>
            <SheetDescription>
              Preencha os dados abaixo para adicionar uma nova empresa ao seu portfólio.
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-8 flex-1">
            {/* Seção 1: Dados da Empresa */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Informações da Empresa
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="company_name">Nome da Empresa *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    className="bg-card/50"
                    placeholder="Ex: Pevetech S.A."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="setor">Setor / Nicho</Label>
                    <Input
                      id="setor"
                      name="setor"
                      value={formData.setor}
                      onChange={handleChange}
                      className="bg-card/50"
                      placeholder="Ex: Tecnologia"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="logo_url">URL da Logo</Label>
                    <Input
                      id="logo_url"
                      name="logo_url"
                      value={formData.logo_url}
                      onChange={handleChange}
                      className="bg-card/50"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Seção 2: Contato Principal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> Contato Principal
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Nome do Responsável *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-card/50"
                    placeholder="Ex: Antonio Pedreira"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-card/50"
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-card/50"
                      placeholder="(71) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Seção 3: Dados do Contrato */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Contrato & Status
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="monthly_value">Valor Mensal (MRR)</Label>
                  <Input
                    id="monthly_value"
                    name="monthly_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthly_value}
                    onChange={(e) => setFormData({ ...formData, monthly_value: parseFloat(e.target.value) || 0 })}
                    className="bg-card/50 font-mono text-neon [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="bg-card/50 text-muted-foreground"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="status">Status do Cliente</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger className="bg-card/50">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo (Gerando Receita)</SelectItem>
                      <SelectItem value="lead">Lead (Em Negociação)</SelectItem>
                      <SelectItem value="inactive">Inativo (Pausado)</SelectItem>
                      <SelectItem value="churned">Cancelado (Churn)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="p-6 border-t border-border/50 bg-background/95 sticky bottom-0 z-10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-neon text-neon-foreground hover:bg-neon/90 shadow-lg shadow-neon/20"
            >
              {isSubmitting ? "Salvando..." : "Salvar Cliente"}
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
      console.error("Erro ao carregar clientes:", error);
      toast.error("Não foi possível carregar a lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // --- Table Column Definitions ---
  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: "company_info",
        accessorFn: (row) => row.company_name,
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            // -ml-4 compensa o padding do botão para alinhar perfeitamente à esquerda com a Avatar
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="-ml-4 h-8 px-4 hover:bg-transparent group font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Empresa
              {isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4 text-neon" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4 text-neon" />
              ) : (
                // Invisível por padrão, aparece sutilmente ao passar o mouse
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarImage src={client.logo_url || undefined} />
                <AvatarFallback className="bg-secondary text-xs font-medium text-muted-foreground">
                  {getInitials(client.company_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-[15px]">{client.company_name}</span>
                {client.setor && (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">{client.setor}</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center w-full">Status</div>,
        cell: ({ row }) => (
          <div className="flex justify-center w-full">
            <StatusBadge status={row.getValue("status")} />
          </div>
        ),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: "contact_info",
        accessorFn: (row) => row.name,
        header: "Contato Principal",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground truncate">{row.original.email || "Sem e-mail"}</span>
          </div>
        ),
      },
      {
        accessorKey: "monthly_value",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            // Wrapper para alinhar o botão inteiro à direita
            <div className="flex justify-end w-full">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                // -mr-4 compensa o padding do botão para alinhar perfeitamente à direita
                className="-mr-4 h-8 px-4 hover:bg-transparent group font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                MRR / Valor
                {isSorted === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4 text-neon" />
                ) : isSorted === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4 text-neon" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const value = parseFloat(row.getValue("monthly_value"));
          return <div className="text-right font-medium font-mono text-neon">{formatCurrency(value)}</div>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right w-full">Ações</div>,
        cell: ({ row }) => {
          return (
            <div className="flex justify-end w-full" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-neon/10 hover:text-neon data-[state=open]:bg-neon/10 data-[state=open]:text-neon"
                  >
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur border-border/50">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                    Arquivar Cliente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-[300px]" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="text-neon h-8 w-8" />
            Carteira de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seu pipeline e relacionamentos.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas ou contatos..."
              value={(table.getColumn("company_info")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("company_info")?.setFilterValue(event.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus-visible:ring-neon"
            />
          </div>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-neon text-neon-foreground hover:bg-neon/90 shadow-lg shadow-neon/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-purple-500/5 pointer-events-none" />

        <div className="relative overflow-auto h-full">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 bg-card/90 backdrop-blur z-10 border-b border-border/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-11 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[11px]"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 transition-all duration-200 hover:bg-neon/5 group relative"
                  >
                    <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-neon opacity-0 group-hover:opacity-100 transition-opacity"></td>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle text-left">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado. Adicione seu primeiro cliente!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer de Cadastro de Cliente */}
      <NewClientDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onSuccess={loadClients} />
    </div>
  );
};

export default ClientsPage;
