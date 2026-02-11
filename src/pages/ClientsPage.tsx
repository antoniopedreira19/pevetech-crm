import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Search, MoreHorizontal, ArrowUpDown, Plus, Filter, Building2, User, Mail, Phone } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    active: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20",
    lead: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20",
    churned: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
  };

  // Default to 'lead' style if status is unknown or null
  const badgeStyle = styles[status as keyof typeof styles] || styles.lead;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Desconhecido";

  return (
    <Badge variant="outline" className={`font-medium border ${badgeStyle} transition-colors`}>
      {label}
    </Badge>
  );
};

// --- Client Details Drawer (Side Panel) ---
const ClientDetailsDrawer = ({
  client,
  open,
  onOpenChange,
}: {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] border-l border-border/50 bg-background/80 backdrop-blur-xl p-0">
        <SheetHeader className="p-6 pb-2 text-left">
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="h-16 w-16 border-2 border-neon/20">
              <AvatarImage src={client.logo_url || undefined} />
              <AvatarFallback className="bg-neon/10 text-neon text-xl">
                {getInitials(client.company_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl font-bold">{client.company_name}</SheetTitle>
              <StatusBadge status={client.status} />
            </div>
          </div>
          <SheetDescription>Cliente desde {new Date(client.created_at).toLocaleDateString("pt-BR")}</SheetDescription>
        </SheetHeader>

        <Separator className="bg-border/50" />

        <div className="p-6 space-y-8">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-card/30 rounded-xl border border-border/30">
            <div>
              <p className="text-sm text-muted-foreground">MRR Atual</p>
              <p className="text-xl font-bold text-neon">{formatCurrency(client.monthly_value)}</p>
            </div>
            {/* Placeholder para métrica futura, ex: Health Score */}
            <div>
              <p className="text-sm text-muted-foreground">Health Score (IA)</p>
              <p className="text-xl font-bold text-emerald-400">92/100</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Informações de Contato
            </h3>

            <div className="flex items-center gap-3">
              <User className="text-neon h-5 w-5" />
              <div>
                <p className="text-sm font-medium leading-none">{client.name}</p>
                <p className="text-sm text-muted-foreground">Ponto Focal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-neon h-5 w-5" />
              <div>
                <p className="text-sm font-medium leading-none">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-neon h-5 w-5" />
              <div>
                <p className="text-sm font-medium leading-none">{client.phone || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Placeholder para próxima feature: Últimas Atividades */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
              Últimas Atividades
              <Badge variant="secondary" className="text-xs">
                Em breve
              </Badge>
            </h3>
            <div className="text-sm text-muted-foreground italic pl-2 border-l-2 border-border">
              O histórico de tarefas e interações aparecerá aqui.
            </div>
          </div>
        </div>
        <SheetFooter className="absolute bottom-0 w-full p-6 border-t border-border/50 bg-background/95 backdrop-blur">
          <Button className="w-full bg-neon text-neon-foreground hover:bg-neon/90">Editar Cliente</Button>
        </SheetFooter>
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

  // State for Drawer
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch Data
  useEffect(() => {
    const loadClients = async () => {
      try {
        const { data: clients, error } = await supabase
          .from("clients")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setData(clients || []);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  // --- Table Column Definitions ---
  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: "company_info",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Empresa
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        ),
        accessorFn: (row) => row.company_name, // For sorting
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarImage src={client.logo_url || undefined} />
                <AvatarFallback className="bg-secondary text-xs font-medium text-muted-foreground">
                  {getInitials(client.company_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-[15px]">{client.company_name}</span>
                {client.website && (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {client.website.replace("https://", "")}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: "contact_info",
        header: "Contato Principal",
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground truncate">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "monthly_value",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              className="p-0 hover:bg-transparent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              MRR / Valor
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const value = parseFloat(row.getValue("monthly_value"));
          return <div className="text-right font-medium font-mono text-neon">{formatCurrency(value)}</div>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="text-right" onClick={(e) => e.stopPropagation()}>
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
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedClient(client);
                      setIsDrawerOpen(true);
                    }}
                  >
                    Ver Detalhes
                  </DropdownMenuItem>
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

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return <ClientsLoadingSkeleton />;
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
          <Button variant="outline" size="icon" className="border-border/50 hover:bg-card/80">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="bg-neon text-neon-foreground hover:bg-neon/90 shadow-lg shadow-neon/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden flex-1 relative">
        {/* Gradient Overlay for tech feel */}
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
                    data-state={row.getIsSelected() && "selected"}
                    // Row click interactivity
                    onClick={() => handleRowClick(row.original)}
                    className="border-b border-border/40 transition-all duration-200 hover:bg-neon/5 cursor-pointer group relative"
                  >
                    {/* Subtle neon left border on hover */}
                    <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-neon opacity-0 group-hover:opacity-100 transition-opacity"></td>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Component */}
      <ClientDetailsDrawer client={selectedClient} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </div>
  );
};

// Skeleton loader for better perceived performance
const ClientsLoadingSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-[300px]" />
    </div>
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="h-12 bg-card/50 border-b border-border/50" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 border-b border-border/40 flex items-center px-4 gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export default ClientsPage;
