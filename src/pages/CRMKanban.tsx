import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Search, Plus, MoreHorizontal, DollarSign, GripVertical,
  Pencil, Trash2, MessageSquare, X, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// --- Types ---
type Lead = Tables<"leads"> & { deal_value?: number | null; loss_reason?: string | null };

interface LeadComment {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
}

const KANBAN_COLUMNS = [
  { id: "new", title: "Novos Leads", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { id: "contacted", title: "Em Contato", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "meeting", title: "Reunião Agendada", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "proposal", title: "Proposta Enviada", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "closed_won", title: "Fechado (Ganho)", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "closed_lost", title: "Perdido", color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

const formatCurrency = (value: number | null) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

const getInitials = (name: string | null) => {
  if (!name) return "LD";
  return name.substring(0, 2).toUpperCase();
};

// ---- Lead Detail Dialog ----
const LeadDetailDialog = ({
  lead, open, onClose, onUpdate, onDelete,
}: {
  lead: Lead | null; open: boolean; onClose: () => void;
  onUpdate: (lead: Lead) => void; onDelete: (id: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "", status: "new", deal_value: 0 });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        message: lead.message || "",
        status: lead.status || "new",
        deal_value: Number(lead.deal_value) || 0,
      });
      setEditing(false);
      loadComments(lead.id);
    }
  }, [lead]);

  const loadComments = async (leadId: string) => {
    setLoadingComments(true);
    const { data } = await (supabase as any).from("lead_comments").select("*").eq("lead_id", leadId).order("created_at", { ascending: true });
    setComments((data as LeadComment[]) || []);
    setLoadingComments(false);
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("leads").update({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        company: form.company || null,
        message: form.message || null,
        status: form.status as any,
      } as any).eq("id", lead.id);
      // update deal_value separately since types may not include it yet
      await (supabase as any).from("leads").update({ deal_value: form.deal_value }).eq("id", lead.id);
      if (error) throw error;
      toast.success("Lead atualizado!");
      onUpdate({ ...lead, ...form, deal_value: form.deal_value } as any);
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await (supabase as any).from("lead_comments").delete().eq("lead_id", lead.id);
      const { error } = await supabase.from("leads").delete().eq("id", lead.id);
      if (error) throw error;
      toast.success("Lead excluído!");
      onDelete(lead.id);
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
    setConfirmDelete(false);
  };

  const handleAddComment = async () => {
    if (!lead || !newComment.trim()) return;
    try {
      const { error } = await (supabase as any).from("lead_comments").insert([{ lead_id: lead.id, content: newComment.trim() }]);
      if (error) throw error;
      setNewComment("");
      loadComments(lead.id);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteComment = async (id: string) => {
    await (supabase as any).from("lead_comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  if (!lead) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-lg bg-background border-border/50 max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>{lead.company || lead.name}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(!editing)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>Detalhes do lead e histórico de comentários.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Comentários ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-auto space-y-3 mt-4">
              {editing ? (
                <div className="space-y-3">
                  <div className="space-y-1"><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-card/50" /></div>
                  <div className="space-y-1"><Label>Empresa</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-card/50" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>E-mail</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-card/50" /></div>
                    <div className="space-y-1"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-card/50" /></div>
                  </div>
                  <div className="space-y-1"><Label>Valor do Deal (R$)</Label><Input type="number" value={form.deal_value} onChange={(e) => setForm({ ...form, deal_value: Number(e.target.value) })} className="bg-card/50" /></div>
                  <div className="space-y-1">
                    <Label>Etapa</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="bg-card/50"><SelectValue /></SelectTrigger>
                      <SelectContent>{KANBAN_COLUMNS.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Observações</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-card/50 min-h-[60px]" /></div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-neon text-neon-foreground">{saving ? "Salvando..." : "Salvar"}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-muted-foreground">Nome:</span> <span className="font-medium">{lead.name}</span></div>
                    <div><span className="text-muted-foreground">Empresa:</span> <span className="font-medium">{lead.company || "—"}</span></div>
                    <div><span className="text-muted-foreground">E-mail:</span> <span className="font-medium">{lead.email || "—"}</span></div>
                    <div><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{lead.phone || "—"}</span></div>
                  </div>
                  <div><span className="text-muted-foreground">Valor do Deal:</span> <span className="font-bold text-neon">{formatCurrency(Number(lead.deal_value) || 0)}</span></div>
                  {lead.loss_reason && <div><span className="text-muted-foreground">Motivo da Perda:</span> <span className="font-medium text-red-400">{lead.loss_reason}</span></div>}
                  {lead.message && <div><span className="text-muted-foreground">Observações:</span><p className="mt-1 text-muted-foreground/80">{lead.message}</p></div>}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="flex-1 overflow-hidden flex flex-col mt-4">
              <ScrollArea className="flex-1 pr-2">
                {loadingComments ? <Skeleton className="h-20 w-full" /> : comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhum comentário ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="group flex justify-between items-start bg-card/40 border border-border/30 rounded-lg p-3">
                        <div>
                          <p className="text-sm">{c.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString("pt-BR")}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => handleDeleteComment(c.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Adicionar comentário..." className="bg-card/50" onKeyDown={(e) => e.key === "Enter" && handleAddComment()} />
                <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()} className="bg-neon text-neon-foreground shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita. Todos os comentários serão removidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ---- Proposal Value Dialog (when dragging to proposal) ----
const ProposalValueDialog = ({
  open, onClose, onConfirm,
}: { open: boolean; onClose: () => void; onConfirm: (value: number) => void }) => {
  const [value, setValue] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-background border-border/50">
        <DialogHeader>
          <DialogTitle>Valor da Proposta</DialogTitle>
          <DialogDescription>Informe o valor estimado do deal para esta proposta.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Valor (R$)</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" className="bg-card/50" autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onConfirm(Number(value) || 0); setValue(""); }} className="bg-neon text-neon-foreground">Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---- Won Confirmation Dialog ----
const WonConfirmDialog = ({
  open, onClose, onConfirm, initialValue,
}: { open: boolean; onClose: () => void; onConfirm: (mrrValue: number) => void; initialValue: number }) => {
  const [value, setValue] = useState("");
  useEffect(() => { if (open) setValue(String(initialValue || "")); }, [open, initialValue]);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="text-emerald-400">🎉 Negócio Fechado!</DialogTitle>
          <DialogDescription>Confirme o valor de MRR que será adicionado.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Valor MRR (R$)</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" className="bg-card/50" autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(Number(value) || 0)} className="bg-emerald-600 text-white hover:bg-emerald-700">Confirmar MRR</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---- Lost Reason Dialog ----
const LostReasonDialog = ({
  open, onClose, onConfirm,
}: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) => {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="text-red-400">Motivo da Perda</DialogTitle>
          <DialogDescription>Informe o motivo pelo qual este deal foi perdido.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Motivo</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: Preço alto, escolheu concorrente..." className="bg-card/50 min-h-[80px]" autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { if (reason.trim()) { onConfirm(reason.trim()); setReason(""); } else { toast.error("Informe o motivo."); } }} className="bg-red-600 text-white hover:bg-red-700">Confirmar Perda</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---- Kanban Card ----
const KanbanCard = ({ lead, onClick }: { lead: Lead; onClick: () => void }) => (
  <div
    draggable
    onDragStart={(e) => e.dataTransfer.setData("lead_id", lead.id)}
    onClick={onClick}
    className="group relative flex flex-col gap-3 rounded-xl border border-border/40 bg-card/60 p-4 text-sm shadow-sm backdrop-blur-md transition-all hover:border-neon/50 hover:shadow-neon/10 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing"
  >
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
          <span className="font-semibold text-foreground truncate max-w-[140px]">{lead.company || lead.name}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">{lead.email}</span>
        </div>
      </div>
    </div>
    <div className="pl-4 pt-2 flex items-center justify-between border-t border-border/40 mt-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-neon bg-neon/5 px-2 py-1 rounded-md">
        <DollarSign className="h-3 w-3" />
        {formatCurrency(Number(lead.deal_value) || 0)}
      </div>
      {lead.loss_reason && (
        <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-500/10 text-[10px]">Perdido</Badge>
      )}
    </div>
  </div>
);

// ---- Main Page ----
const CRMKanban = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: "", email: "", phone: "", company: "", message: "", status: "new" as string });

  // Detail dialog
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Drag modals
  const [proposalDrag, setProposalDrag] = useState<{ leadId: string } | null>(null);
  const [wonDrag, setWonDrag] = useState<{ leadId: string; dealValue: number } | null>(null);
  const [lostDrag, setLostDrag] = useState<{ leadId: string } | null>(null);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setLeads((data as Lead[]) || []);
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleCreateDeal = async () => {
    if (!newDeal.name.trim()) { toast.error("Informe o nome do contato."); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert([{
        name: newDeal.name, email: newDeal.email || null, phone: newDeal.phone || null,
        company: newDeal.company || null, message: newDeal.message || null, status: newDeal.status as any,
      }]);
      if (error) throw error;
      toast.success("Deal criado com sucesso!");
      setNewDeal({ name: "", email: "", phone: "", company: "", message: "", status: "new" });
      setIsNewDealOpen(false);
      fetchLeads();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveLeadToStatus = async (leadId: string, newStatus: string, extra?: Record<string, any>) => {
    try {
      const updatePayload: any = { status: newStatus, ...extra };
      const { error } = await (supabase as any).from("leads").update(updatePayload).eq("id", leadId);
      if (error) throw error;
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus as any, ...extra } : l));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDrop = (columnId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("lead_id");
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || (lead.status || "new") === columnId) return;

    if (columnId === "proposal") {
      setProposalDrag({ leadId });
    } else if (columnId === "closed_won") {
      setWonDrag({ leadId, dealValue: Number(lead.deal_value) || 0 });
    } else if (columnId === "closed_lost") {
      setLostDrag({ leadId });
    } else {
      moveLeadToStatus(leadId, columnId);
    }
  };

  const handleProposalConfirm = (value: number) => {
    if (proposalDrag) {
      moveLeadToStatus(proposalDrag.leadId, "proposal", { deal_value: value });
      setProposalDrag(null);
    }
  };

  const handleWonConfirm = (mrrValue: number) => {
    if (wonDrag) {
      moveLeadToStatus(wonDrag.leadId, "closed_won", { deal_value: mrrValue });
      setWonDrag(null);
      toast.success("Negócio fechado! MRR registrado.");
    }
  };

  const handleLostConfirm = (reason: string) => {
    if (lostDrag) {
      moveLeadToStatus(lostDrag.leadId, "closed_lost", { loss_reason: reason });
      setLostDrag(null);
    }
  };

  const handleLeadUpdate = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    setSelectedLead(updated);
  };

  const handleLeadDelete = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6 h-full">
        <div className="flex justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-64" /></div>
        <div className="flex gap-4 h-[70vh]">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="min-w-[300px] h-full rounded-2xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-6 animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-2 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline de Vendas</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie o fluxo de negociações da Pevetech.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar oportunidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-card/30 border-border/50 focus-visible:ring-neon rounded-full" />
          </div>
          <Button onClick={() => setIsNewDealOpen(true)} className="bg-neon text-neon-foreground hover:bg-neon/90 shadow-lg shadow-neon/20 rounded-full px-6">
            <Plus className="mr-2 h-4 w-4" /> Novo Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="flex-1 w-full pb-4">
        <div className="flex gap-5 px-2 h-full min-w-max pb-8">
          {KANBAN_COLUMNS.map((column) => {
            const columnLeads = filteredLeads.filter((lead) => (lead.status || "new") === column.id);
            const columnTotal = columnLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);

            return (
              <div
                key={column.id}
                className="flex flex-col w-[310px] shrink-0 h-full"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop(column.id)}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`border font-medium ${column.color}`}>{column.title}</Badge>
                    <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{columnLeads.length}</span>
                  </div>
                  {columnTotal > 0 && <span className="text-xs font-medium text-muted-foreground">{formatCurrency(columnTotal)}</span>}
                </div>
                <div className="flex-1 bg-card/20 border border-border/30 rounded-2xl p-3 flex flex-col gap-3 min-h-[150px]">
                  {columnLeads.map((lead) => (
                    <KanbanCard key={lead.id} lead={lead} onClick={() => { setSelectedLead(lead); setDetailOpen(true); }} />
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

      {/* Lead Detail Dialog */}
      <LeadDetailDialog lead={selectedLead} open={detailOpen} onClose={() => setDetailOpen(false)} onUpdate={handleLeadUpdate} onDelete={handleLeadDelete} />

      {/* Drag modals */}
      <ProposalValueDialog open={!!proposalDrag} onClose={() => setProposalDrag(null)} onConfirm={handleProposalConfirm} />
      <WonConfirmDialog open={!!wonDrag} onClose={() => setWonDrag(null)} onConfirm={handleWonConfirm} initialValue={wonDrag?.dealValue || 0} />
      <LostReasonDialog open={!!lostDrag} onClose={() => setLostDrag(null)} onConfirm={handleLostConfirm} />

      {/* New Deal Dialog */}
      <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="text-neon" size={20} /> Novo Deal</DialogTitle>
            <DialogDescription>Cadastre uma nova oportunidade no pipeline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nome do Contato *</Label><Input value={newDeal.name} onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })} placeholder="João Silva" className="bg-card/50" autoFocus /></div>
            <div className="space-y-2"><Label>Empresa</Label><Input value={newDeal.company} onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })} placeholder="Empresa XYZ" className="bg-card/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={newDeal.email} onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })} placeholder="email@empresa.com" className="bg-card/50" /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={newDeal.phone} onChange={(e) => setNewDeal({ ...newDeal, phone: e.target.value })} placeholder="(71) 99999-9999" className="bg-card/50" /></div>
            </div>
            <div className="space-y-2">
              <Label>Etapa Inicial</Label>
              <Select value={newDeal.status} onValueChange={(val) => setNewDeal({ ...newDeal, status: val })}>
                <SelectTrigger className="bg-card/50"><SelectValue /></SelectTrigger>
                <SelectContent>{KANBAN_COLUMNS.map((col) => <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={newDeal.message} onChange={(e) => setNewDeal({ ...newDeal, message: e.target.value })} placeholder="Contexto da oportunidade..." className="bg-card/50 min-h-[80px]" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDealOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateDeal} disabled={isSubmitting || !newDeal.name.trim()} className="bg-neon text-neon-foreground">{isSubmitting ? "Salvando..." : "Criar Deal"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMKanban;
