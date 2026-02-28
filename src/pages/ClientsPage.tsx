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
  DollarSign,
  Phone,
  Pencil,
  UserX,
  Mail,
  TrendingUp,
  FileText,
  ExternalLink,
  UploadCloud,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// --- Types ---
type Client = Tables<"clients"> & { contract_url?: string | null };

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
        "h-10 px-0 w-full hover:bg-transparent group font-semibold text-muted-foreground hover:text-foreground text-[11px] uppercase tracking-wider",
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
    <Badge variant="outline" className={`font-medium border px-3 py-1 text-xs ${badgeStyle}`}>
      {label}
    </Badge>
  );
};

// --- Modals and Drawers ---
const MrrUpdateModal = ({
  open,
  onOpenChange,
  client,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
}) => {
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && client) {
      setNewValue("");
      setReason("");
      setEffectiveDate(new Date().toISOString().split("T")[0]);
    }
  }, [open, client]);

  const currentValue = client?.monthly_value || 0;
  const parsedNew = parseFloat(newValue) || 0;
  const diff = parsedNew - currentValue;
  const diffPercent = currentValue > 0 ? ((diff / currentValue) * 100).toFixed(1) : "—";

  const handleSubmit = async () => {
    if (!client) return;
    if (!newValue || parsedNew === currentValue) {
      toast.error("Informe um novo valor.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Informe o motivo.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: histError } = await supabase
        .from("client_mrr_history" as any)
        .insert([
          {
            client_id: client.id,
            previous_value: currentValue,
            new_value: parsedNew,
            reason: reason.trim(),
            effective_date: new Date(effectiveDate).toISOString(),
          },
        ]);
      if (histError) throw histError;
      const { error } = await supabase.from("clients").update({ monthly_value: parsedNew }).eq("id", client.id);
      if (error) throw error;
      toast.success("MRR atualizado!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!client) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="text-neon" size={20} /> Alterar MRR
          </DialogTitle>
          <DialogDescription>{client.company_name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Valor Atual</p>
            <p className="text-2xl font-bold font-mono text-foreground">{formatCurrency(currentValue)}</p>
          </div>
          <div className="space-y-2">
            <Label>Novo Valor (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="bg-card/50 font-mono text-lg h-12"
              autoFocus
            />
            {newValue && parsedNew !== currentValue && (
              <div
                className={cn(
                  "flex items-center gap-2 text-sm font-medium animate-in fade-in duration-200",
                  diff > 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {diff > 0 ? <TrendingUp size={14} /> : <ArrowDown size={14} />}
                <span>
                  {diff > 0 ? "+" : ""}
                  {formatCurrency(diff)} ({diffPercent}%)
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Data de Vigência *</Label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="bg-card/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Motivo da Alteração *</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Novo módulo..."
              className="bg-card/50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newValue || parsedNew === currentValue || !reason.trim()}
            className="bg-neon text-neon-foreground hover:bg-neon/90 transition-all"
          >
            {isSubmitting ? "Salvando..." : "Confirmar Alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
  const [contractFile, setContractFile] = useState<File | null>(null);
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
    contract_url: "",
  });

  useEffect(() => {
    if (open) {
      setContractFile(null);
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
          contract_url: client.contract_url || "",
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
          contract_url: "",
        });
      }
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalContractUrl = formData.contract_url;
      if (contractFile) {
        const fileExt = contractFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("contrato_clientes").upload(fileName, contractFile);
        if (uploadError) throw new Error(`Erro ao subir contrato: ${uploadError.message}`);
        const { data: publicUrlData } = supabase.storage.from("contrato_clientes").getPublicUrl(fileName);
        finalContractUrl = publicUrlData.publicUrl;
      }
      const payload = { ...formData, status: formData.status as any, contract_url: finalContractUrl };
      if (client) {
        const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
        if (error) throw error;
        toast.success("Cliente atualizado!");
      } else {
        const { data: newClient, error } = await supabase.from("clients").insert([payload]).select().single();
        if (error) throw error;
        if (newClient)
          await supabase
            .from("client_mrr_history" as any)
            .insert([
              {
                client_id: newClient.id,
                previous_value: 0,
                new_value: formData.monthly_value,
                reason: "Cadastro inicial",
                effective_date: new Date().toISOString(),
              },
            ]);
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
                className="bg-card/50 focus-visible:ring-neon/30"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Setor</Label>
                  <Input
                    value={formData.setor}
                    onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    className="bg-card/50 focus-visible:ring-neon/30"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Logo URL</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="bg-card/50 focus-visible:ring-neon/30"
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
                className="bg-card/50 focus-visible:ring-neon/30"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>E-mail</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-card/50 focus-visible:ring-neon/30"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-card/50 focus-visible:ring-neon/30"
                    placeholder="(71) 99999-9999"
                  />
                </div>
              </div>
            </div>
            <Separator />

            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <FileText size={14} className="text-muted-foreground" /> Contrato
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={contractFile ? `Arquivo pronto: ${contractFile.name}` : formData.contract_url}
                  onChange={(e) => setFormData({ ...formData, contract_url: e.target.value })}
                  placeholder="Cole uma URL ou faça upload ->"
                  className={cn(
                    "bg-card/50 focus-visible:ring-neon/30 flex-1",
                    contractFile && "text-neon font-medium",
                  )}
                  disabled={!!contractFile}
                />
                <div className="relative shrink-0">
                  <Input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setContractFile(e.target.files[0]);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 hover:border-neon/30 hover:bg-neon/5 hover:text-neon bg-card/50 w-full"
                  >
                    <UploadCloud size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-muted-foreground">URL direta ou upload do arquivo (PDF/DOC).</p>
                {contractFile && (
                  <button
                    type="button"
                    onClick={() => setContractFile(null)}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remover arquivo
                  </button>
                )}
              </div>
            </div>

            <Separator />
            {client && (
              <div className="space-y-1">
                <Label>MRR Atual</Label>
                <div className="flex items-center justify-between rounded-md border border-border/50 bg-card/50 px-3 py-2">
                  <span className="font-mono text-neon font-bold">{formatCurrency(formData.monthly_value)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Use o menu de ações (⋯) na tabela para alterar o MRR.</p>
              </div>
            )}
            {!client && (
              <div className="space-y-1">
                <Label>Valor MRR Inicial (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthly_value}
                  onChange={(e) => setFormData({ ...formData, monthly_value: parseFloat(e.target.value) || 0 })}
                  className="bg-card/50 font-mono text-neon focus-visible:ring-neon/30"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="bg-card/50 focus-visible:ring-neon/30">
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
              <div className="space-y-1">
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-card/50 focus-visible:ring-neon/30"
                />
              </div>
            </div>
          </div>
          <SheetFooter className="p-6 border-t border-border/50 sticky bottom-0 bg-background/95">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neon text-neon-foreground hover:bg-neon/90 shadow-[0_0_15px_rgba(0,255,128,0.2)]"
            >
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
  const [sorting, setSorting] = useState<SortingState>([{ id: "monthly_value", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMrrModalOpen, setIsMrrModalOpen] = useState(false);
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
          <div className="flex items-center gap-4">
            <Avatar className="h-11 w-11 border-2 border-white/5 shadow-sm">
              <AvatarImage src={row.original.logo_url || undefined} />
              <AvatarFallback className="bg-card font-bold text-muted-foreground">
                {getInitials(row.original.company_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-base text-foreground">{row.original.company_name}</span>
              <span className="text-xs text-muted-foreground">{row.original.setor}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <div className="text-center w-full uppercase text-[11px] tracking-wider text-muted-foreground font-semibold">
            Status
          </div>
        ),
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
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">{row.original.name}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={12} className="text-neon/70" /> {formatPhoneNumber(row.original.phone)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail size={12} className="text-neon/70" /> {row.original.email || "Sem e-mail"}
            </div>
          </div>
        ),
      },
      {
        id: "contract",
        header: ({ column }) => (
          <div className="text-center w-full uppercase text-[11px] tracking-wider text-muted-foreground font-semibold">
            Contrato
          </div>
        ),
        cell: ({ row }) => {
          const url = row.original.contract_url;
          if (!url) {
            return (
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="bg-card/20 border-white/5 text-muted-foreground/50 font-normal text-[11px] px-3 py-1 shadow-none"
                >
                  Nenhum
                </Badge>
              </div>
            );
          }
          return (
            <div className="flex justify-center">
              <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                <Badge
                  variant="outline"
                  className="bg-neon/5 border-neon/30 text-neon font-medium text-[11px] px-3 py-1 hover:bg-neon/10 hover:border-neon/60 hover:shadow-[0_0_15px_rgba(0,255,128,0.2)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText size={12} /> Ver Contrato <ExternalLink size={10} className="ml-0.5 opacity-70" />
                </Badge>
              </a>
            </div>
          );
        },
      },
      {
        accessorKey: "monthly_value",
        header: ({ column }) => <SortableHeader label="MRR" column={column} align="right" />,
        cell: ({ row }) => (
          <div className="text-right font-mono text-neon font-bold text-lg tracking-tight">
            {formatCurrency(row.original.monthly_value)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-white/5">
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 shadow-2xl">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedClient(row.original);
                    setIsDrawerOpen(true);
                  }}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Editar Dados
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedClient(row.original);
                    setIsMrrModalOpen(true);
                  }}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <DollarSign className="mr-2 h-4 w-4" /> Alterar MRR
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  onClick={() => handleInactivate(row.original)}
                  className="text-red-400 focus:text-red-500 focus:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <UserX className="mr-2 h-4 w-4" /> Inativar Cliente
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
      <div className="p-8 h-full flex flex-col">
        <Skeleton className="h-[500px] w-full rounded-2xl bg-card/20" />
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 md:p-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* CSS Mágico para as Scrollbars Premium */}
      <style>{`
        .premium-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .premium-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 128, 0.4); }
      `}</style>

      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
            <Building2 className="text-neon drop-shadow-[0_0_12px_rgba(0,255,128,0.5)]" /> Carteira de Clientes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie contratos, receita e informações vitais da sua base.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por empresa..."
              value={(table.getColumn("company_info")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("company_info")?.setFilterValue(e.target.value)}
              className="pl-9 bg-[#0a0a0a]/50 border-white/10 focus-visible:ring-neon/40 h-10 shadow-inner"
            />
          </div>
          <Button
            onClick={() => {
              setSelectedClient(null);
              setIsDrawerOpen(true);
            }}
            className="bg-neon text-black font-bold shadow-[0_0_20px_rgba(0,255,128,0.25)] hover:scale-105 transition-all shrink-0 h-10 px-6"
          >
            <Plus size={18} className="mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* TABELA DATA GRID (FULL HEIGHT) */}
      <div className="flex-1 min-h-0 rounded-2xl border border-white/5 bg-[#050505]/60 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto premium-scrollbar relative">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-6 py-4 font-semibold text-muted-foreground">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-60">
                      <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold text-white">Nenhum cliente encontrado.</p>
                      <p className="text-muted-foreground text-sm mt-1">Ajuste os filtros ou crie um novo cliente.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <ClientFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={loadClients}
        client={selectedClient}
      />
      <MrrUpdateModal
        open={isMrrModalOpen}
        onOpenChange={setIsMrrModalOpen}
        client={selectedClient}
        onSuccess={loadClients}
      />
    </div>
  );
};

export default ClientsPage;
