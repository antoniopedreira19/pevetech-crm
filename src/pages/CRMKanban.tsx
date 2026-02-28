import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Search,
  Plus,
  MoreHorizontal,
  DollarSign,
  GripVertical,
  Pencil,
  Trash2,
  MessageSquare,
  X,
  Send,
  Tag,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// --- Types ---
type Lead = Tables<"leads"> & { deal_value?: number | null; loss_reason?: string | null; setor?: string | null };

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
  lead,
  open,
  onClose,
  onUpdate,
  onDelete,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
  onDelete: (id: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    setor: "",
    message: "",
    status: "new",
    deal_value: 0,
  });
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
        setor: lead.setor || "",
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
    const { data } = await (supabase as any)
      .from("lead_comments")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });
    setComments((data as LeadComment[]) || []);
    setLoadingComments(false);
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          company: form.company || null,
          message: form.message || null,
          status: form.status as any,
        } as any)
        .eq("id", lead.id);

      await (supabase as any)
        .from("leads")
        .update({ deal_value: form.deal_value, setor: form.setor || null })
        .eq("id", lead.id);

      if (error) throw error;
      toast.success("Lead atualizado!");
      onUpdate({ ...lead, ...form, deal_value: form.deal_value, setor: form.setor } as any);
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
      const { error } = await (supabase as any)
        .from("lead_comments")
        .insert([{ lead_id: lead.id, content: newComment.trim() }]);
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
        <DialogContent className="sm:max-w-lg bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 shadow-2xl text-white max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 pb-4 border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-2">
                <span className="text-lg font-bold tracking-tight">{lead.company || lead.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-white/10 transition-colors rounded-full"
                    onClick={() => setEditing(!editing)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-500/20 transition-colors rounded-full"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                Detalhes do lead e histórico de interações.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full mt-6">
              <TabsList className="w-full bg-black/40 border border-white/5 p-1 rounded-xl">
                <TabsTrigger
                  value="info"
                  className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none text-muted-foreground"
                >
                  Informações
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none text-muted-foreground"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-2" /> Anotações ({comments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="outline-none">
                <div className="mt-4 max-h-[50vh] overflow-y-auto premium-scrollbar pr-3 space-y-4">
                  {editing ? (
                    <div className="space-y-4 pb-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Nome do Contato *</Label>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Empresa</Label>
                          <Input
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Setor</Label>
                          <Input
                            value={form.setor}
                            onChange={(e) => setForm({ ...form, setor: e.target.value })}
                            placeholder="Tecnologia, Saúde..."
                            className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">E-mail</Label>
                          <Input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Telefone</Label>
                          <Input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Valor Estimado do Deal (R$)</Label>
                        <Input
                          type="number"
                          value={form.deal_value}
                          onChange={(e) => setForm({ ...form, deal_value: Number(e.target.value) })}
                          className="bg-black/40 border-white/10 focus-visible:ring-neon/30 font-mono text-neon"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Etapa do Funil</Label>
                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                          <SelectTrigger className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-white/10 z-[10000]">
                            {KANBAN_COLUMNS.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Contexto / Observações</Label>
                        <Textarea
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white min-h-[80px]"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => setEditing(false)}
                          className="hover:bg-white/5 border-white/10"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-neon text-black font-bold hover:bg-neon/90 shadow-[0_0_15px_rgba(0,255,128,0.2)]"
                        >
                          {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 text-sm pb-2">
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                        <div>
                          <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-1">
                            Nome do Contato
                          </span>{" "}
                          <span className="font-medium text-white">{lead.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-1">
                            Empresa
                          </span>{" "}
                          <span className="font-medium text-white">{lead.company || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-1">
                            Setor
                          </span>{" "}
                          {lead.setor ? (
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-xs font-normal">
                              {lead.setor}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-1">
                            Telefone
                          </span>{" "}
                          <span className="font-medium text-white">{lead.phone || "—"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-1">
                            E-mail
                          </span>{" "}
                          <span className="font-medium text-white">{lead.email || "—"}</span>
                        </div>
                      </div>

                      <div className="bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-1">
                          Valor Estimado do Deal
                        </span>
                        <span className="font-bold text-neon text-xl tracking-tight">
                          {formatCurrency(Number(lead.deal_value) || 0)}
                        </span>
                      </div>

                      {lead.loss_reason && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                          <span className="text-red-400 block text-[11px] uppercase tracking-wider mb-1 font-bold">
                            Motivo da Perda
                          </span>
                          <span className="text-red-300/90 leading-relaxed">{lead.loss_reason}</span>
                        </div>
                      )}
                      {lead.message && (
                        <div>
                          <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-1.5">
                            Observações Iniciais
                          </span>
                          <p className="text-white/80 whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed text-[13px]">
                            {lead.message}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="outline-none flex flex-col h-[50vh]">
                <div className="flex-1 overflow-y-auto premium-scrollbar pr-3">
                  {loadingComments ? (
                    <Skeleton className="h-20 w-full rounded-xl bg-white/5" />
                  ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                      <MessageSquare className="h-10 w-10 mb-3" />
                      <p className="text-sm text-muted-foreground text-center">Nenhuma anotação registrada.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-2">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="group flex justify-between items-start bg-white/5 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors"
                        >
                          <div>
                            <p className="text-[13px] text-white/90 leading-relaxed">{c.content}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              {new Date(c.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            onClick={() => handleDeleteComment(c.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5 shrink-0">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar nova anotação..."
                    className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-neon text-black hover:bg-neon/90 shrink-0 shadow-[0_0_10px_rgba(0,255,128,0.2)]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Lead</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza? Esta ação não pode ser desfeita. Todas as anotações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5 text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600 font-bold">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ---- Proposal Value Dialog ----
const ProposalValueDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
}) => {
  const [value, setValue] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Valor da Proposta</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informe o valor estimado do deal para esta proposta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label className="text-muted-foreground">Valor (R$)</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="bg-black/40 border-white/10 text-neon font-mono text-lg focus-visible:ring-neon/30"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/5 border-white/10">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm(Number(value) || 0);
              setValue("");
            }}
            className="bg-neon text-black font-bold hover:bg-neon/90 shadow-[0_0_15px_rgba(0,255,128,0.2)]"
          >
            Confirmar Valor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---- Won Confirmation Dialog ----
const WonConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  initialValue,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (mrrValue: number) => void;
  initialValue: number;
}) => {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (open) setValue(String(initialValue || ""));
  }, [open, initialValue]);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-emerald-400 text-xl flex items-center gap-2">🎉 Negócio Fechado!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirme o valor de MRR que será adicionado ao seu forecast.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label className="text-muted-foreground">Valor Final MRR (R$)</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="bg-black/40 border-white/10 text-emerald-400 font-mono text-lg focus-visible:ring-emerald-500/30"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/5 border-white/10">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(Number(value) || 0)}
            className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Confirmar Ganho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---- Lost Reason Dialog ----
const LostReasonDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-red-400">Motivo da Perda</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registre o motivo para melhorar suas análises futuras.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label className="text-muted-foreground">Motivo detalhado</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Escolheu o concorrente, Sem orçamento..."
            className="bg-black/40 border-white/10 focus-visible:ring-red-500/30 min-h-[80px] text-white"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/5 border-white/10">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason.trim());
                setReason("");
              } else {
                toast.error("Informe o motivo.");
              }
            }}
            className="bg-red-500 text-white hover:bg-red-600 font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            Registrar Perda
          </Button>
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
    className="group relative flex flex-col gap-3 rounded-xl border border-white/5 bg-[#0a0a0a]/80 p-4 text-sm shadow-sm backdrop-blur-md transition-all hover:border-neon/40 hover:shadow-[0_4px_20px_-10px_rgba(0,255,128,0.2)] hover:-translate-y-0.5 cursor-grab active:cursor-grabbing"
  >
    <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>

    <div className="flex flex-col gap-1.5 pl-3">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8 rounded-lg border border-white/10">
          <AvatarFallback className="rounded-lg bg-white/5 text-[10px] font-bold text-muted-foreground">
            {getInitials(lead.company || lead.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-white text-[13px] truncate">{lead.company || lead.name}</span>
          <span className="text-[11px] text-muted-foreground truncate">
            {lead.email || lead.phone || "Sem contato"}
          </span>
        </div>
      </div>

      {lead.setor && (
        <div className="flex mt-1">
          <Badge
            variant="outline"
            className="bg-white/5 border-white/10 text-muted-foreground font-normal text-[9px] px-1.5 py-0 uppercase tracking-wider flex items-center gap-1"
          >
            <Building2 size={8} /> {lead.setor}
          </Badge>
        </div>
      )}
    </div>

    <div className="pl-3 pt-2 flex items-center justify-between border-t border-white/5 mt-1">
      <div className="flex items-center gap-1.5 text-xs font-bold text-neon tracking-tight">
        {formatCurrency(Number(lead.deal_value) || 0)}
      </div>
      {lead.loss_reason && (
        <Badge
          variant="outline"
          className="border-red-500/20 text-red-400 bg-red-500/10 text-[9px] px-1.5 py-0 uppercase tracking-wider"
        >
          Perdido
        </Badge>
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
  const [newDeal, setNewDeal] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    setor: "",
    message: "",
    status: "new" as string,
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateDeal = async () => {
    if (!newDeal.name.trim()) {
      toast.error("Informe o nome do contato.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any).from("leads").insert([
        {
          name: newDeal.name,
          email: newDeal.email || null,
          phone: newDeal.phone || null,
          company: newDeal.company || null,
          setor: newDeal.setor || null,
          message: newDeal.message || null,
          status: newDeal.status,
        },
      ]);
      if (error) throw error;
      toast.success("Deal criado com sucesso!");
      setNewDeal({ name: "", email: "", phone: "", company: "", setor: "", message: "", status: "new" });
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
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any, ...extra } : l)));
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
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  const handleLeadDelete = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.setor?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6 h-full">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48 bg-card/20" />
          <Skeleton className="h-10 w-64 bg-card/20" />
        </div>
        <div className="flex gap-4 h-[70vh] overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="min-w-[310px] h-full rounded-2xl bg-card/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 md:p-6 animate-in fade-in duration-500 overflow-hidden max-w-[1800px] mx-auto">
      {/* CSS das Scrollbars Premium */}
      <style>{`
        .premium-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .premium-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 128, 0.4); }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <DollarSign className="text-neon drop-shadow-[0_0_12px_rgba(0,255,128,0.5)]" /> Pipeline de Vendas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie o fluxo de negociações da sua empresa.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa, nome ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/40 border-white/10 focus-visible:ring-neon/40 h-10 shadow-inner"
            />
          </div>
          <Button
            onClick={() => setIsNewDealOpen(true)}
            className="bg-neon text-black font-bold shadow-[0_0_20px_rgba(0,255,128,0.25)] hover:scale-105 transition-all shrink-0 h-10 px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="flex-1 w-full bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] border border-white/5 rounded-2xl p-2 bg-[#050505]/60 backdrop-blur-sm">
        <div className="flex gap-4 p-4 h-full min-w-max pb-8">
          {KANBAN_COLUMNS.map((column) => {
            const columnLeads = filteredLeads.filter((lead) => (lead.status || "new") === column.id);
            const columnTotal = columnLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);

            return (
              <div
                key={column.id}
                className="flex flex-col w-[320px] shrink-0 h-full max-h-full"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop(column.id)}
              >
                <div className="flex items-center justify-between mb-4 bg-black/40 border border-white/5 p-3 rounded-xl backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`border bg-transparent shadow-none uppercase tracking-wider text-[10px] ${column.color}`}
                    >
                      {column.title}
                    </Badge>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      {columnLeads.length}
                    </span>
                  </div>
                  {columnTotal > 0 && (
                    <span className="text-[11px] font-mono font-bold text-muted-foreground">
                      {formatCurrency(columnTotal)}
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-black/20 border border-white/5 rounded-2xl p-2 flex flex-col gap-2 min-h-[150px] overflow-y-auto premium-scrollbar pb-10">
                  {columnLeads.map((lead) => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => {
                        setSelectedLead(lead);
                        setDetailOpen(true);
                      }}
                    />
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="h-24 flex flex-col items-center justify-center text-center p-4 opacity-40 border-2 border-dashed border-white/5 rounded-xl mt-1">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="premium-scrollbar" />
      </ScrollArea>

      {/* Lead Detail Dialog */}
      <LeadDetailDialog
        lead={selectedLead}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={handleLeadUpdate}
        onDelete={handleLeadDelete}
      />

      {/* Drag modals */}
      <ProposalValueDialog
        open={!!proposalDrag}
        onClose={() => setProposalDrag(null)}
        onConfirm={handleProposalConfirm}
      />
      <WonConfirmDialog
        open={!!wonDrag}
        onClose={() => setWonDrag(null)}
        onConfirm={handleWonConfirm}
        initialValue={wonDrag?.dealValue || 0}
      />
      <LostReasonDialog open={!!lostDrag} onClose={() => setLostDrag(null)} onConfirm={handleLostConfirm} />

      {/* New Deal Dialog Premium */}
      <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 shadow-2xl text-white p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white text-xl">
                <Plus className="text-neon" size={24} /> Novo Deal
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Cadastre uma nova oportunidade no pipeline.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto premium-scrollbar pr-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome do Contato *</Label>
              <Input
                value={newDeal.name}
                onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                placeholder="Ex: João Silva"
                className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Empresa</Label>
                <Input
                  value={newDeal.company}
                  onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                  placeholder="Nome da empresa"
                  className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Setor</Label>
                <Input
                  value={newDeal.setor}
                  onChange={(e) => setNewDeal({ ...newDeal, setor: e.target.value })}
                  placeholder="Tecnologia, Varejo..."
                  className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <Input
                  type="email"
                  value={newDeal.email}
                  onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })}
                  placeholder="email@empresa.com"
                  className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <Input
                  value={newDeal.phone}
                  onChange={(e) => setNewDeal({ ...newDeal, phone: e.target.value })}
                  placeholder="(71) 99999-9999"
                  className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Etapa Inicial</Label>
              <Select value={newDeal.status} onValueChange={(val) => setNewDeal({ ...newDeal, status: val })}>
                <SelectTrigger className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 z-[10000]">
                  {KANBAN_COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Observações</Label>
              <Textarea
                value={newDeal.message}
                onChange={(e) => setNewDeal({ ...newDeal, message: e.target.value })}
                placeholder="Contexto inicial da negociação..."
                className="bg-black/40 border-white/10 focus-visible:ring-neon/30 text-white min-h-[80px]"
              />
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsNewDealOpen(false)}
              className="hover:bg-white/5 border-white/10 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDeal}
              disabled={isSubmitting || !newDeal.name.trim()}
              className="bg-neon text-black font-bold hover:bg-neon/90 shadow-[0_0_15px_rgba(0,255,128,0.2)]"
            >
              {isSubmitting ? "Salvando..." : "Criar Deal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMKanban;
