import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Search,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
  LayoutList,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Flame,
  ArrowRight,
  Send,
  Loader2,
  PlayCircle,
  GripVertical,
  Pencil,
  AlertTriangle,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Globe,
  AlignLeft,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// --- Types ---
type Client = Tables<"clients">;
type Task = Tables<"tasks"> & { status?: string };
type TaskComment = { id: string; task_id: string; content: string; created_at: string; user_id: string | null };

type TaskStatus = "todo" | "in_progress" | "completed";
type DateFilter = "all" | "today" | "this_week" | "next_week";

// --- Visual Configs ---
const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  todo: {
    label: "A Fazer",
    icon: <Circle className="h-4 w-4" />,
    color: "text-muted-foreground",
    bg: "bg-card/40",
    border: "border-white/5",
  },
  in_progress: {
    label: "Em Andamento",
    icon: <PlayCircle className="h-4 w-4" />,
    color: "text-blue-400",
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
  },
  completed: {
    label: "Concluídas",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
  },
};

const PRIORITY_CONFIG = {
  high: { label: "Alta", color: "border-red-500/40 text-red-400 bg-red-500/10", icon: <Flame className="h-3 w-3" /> },
  medium: {
    label: "Média",
    color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  low: {
    label: "Baixa",
    color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    icon: <ArrowRight className="h-3 w-3" />,
  },
};

// --- Helpers de Ordenação e Data ---
const getInitials = (name: string | null) => (name ? name.substring(0, 2).toUpperCase() : "CL");

const parseLocalDate = (dateString?: string | null) => {
  if (!dateString) return null;
  const parts = dateString.split("T")[0].split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const isOverdue = (dueDate?: string | null, status?: string) => {
  if (!dueDate || status === "completed") return false;
  const dueDateLocal = parseLocalDate(dueDate);
  if (!dueDateLocal) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDateLocal < today;
};

const formatDate = (dateString?: string | null) => {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === today.getTime()) return "Hoje";
  if (date.getTime() === tomorrow.getTime()) return "Amanhã";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
};

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const dateToTimestamp = (dateStr: string) => {
  if (!dateStr) return null;
  return `${dateStr}T12:00:00`;
};

const getPriorityWeight = (priority?: string | null) => {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  if (priority === "low") return 1;
  return 0;
};

// --- Droppable Column Container ---
const DroppableColumn = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[150px] h-full rounded-2xl transition-all duration-300 p-2 ${
        isOver
          ? "bg-neon/5 ring-1 ring-neon/30 shadow-[inset_0_0_20px_rgba(0,255,128,0.05)]"
          : "bg-black/20 border border-white/5"
      }`}
    >
      {children}
    </div>
  );
};

// --- Draggable Task Card Wrapper ---
const DraggableTaskCard = ({
  task,
  client,
  comments,
  onStatusChange,
  onAddComment,
  onDeleteComment,
  onEdit,
  onDelete,
}: {
  task: Task;
  client?: Client;
  comments: TaskComment[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status || "todo" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        client={client}
        comments={comments}
        onStatusChange={onStatusChange}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        dragListeners={listeners}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

// --- Task Card Component ---
const TaskCard = ({
  task,
  client,
  comments,
  onStatusChange,
  onAddComment,
  onDeleteComment,
  dragListeners,
  onEdit,
  onDelete,
}: {
  task: Task;
  client?: Client;
  comments: TaskComment[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddComment: (taskId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  dragListeners?: any;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const overdue = isOverdue(task.due_date, task.status as string);

  const status = (task.status as TaskStatus) || "todo";
  const priority = task.priority as keyof typeof PRIORITY_CONFIG | null;
  const priorityInfo = priority ? PRIORITY_CONFIG[priority] : null;
  const isCompleted = status === "completed";

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    todo: "in_progress",
    in_progress: "completed",
    completed: "todo",
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onAddComment(task.id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div
      className={`group mb-3 rounded-xl border transition-all duration-300 shadow-sm backdrop-blur-sm ${
        isCompleted
          ? "border-emerald-500/10 bg-emerald-500/5 opacity-60 grayscale-[0.5]"
          : "border-white/10 bg-card/60 hover:border-neon/30 hover:shadow-[0_4px_20px_-10px_rgba(0,255,128,0.15)] hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <button
          {...dragListeners}
          className="mt-1 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-neon transition-colors opacity-0 group-hover:opacity-100"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Status Toggle Button */}
        <button
          onClick={() => onStatusChange(task.id, nextStatus[status])}
          className={`mt-0.5 shrink-0 transition-transform hover:scale-110 ${STATUS_CONFIG[status].color}`}
          title={`Mudar para: ${STATUS_CONFIG[nextStatus[status]].label}`}
        >
          {status === "completed" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : status === "in_progress" ? (
            <PlayCircle className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1.5">
            {client && (
              <div className="flex items-center gap-1.5 w-fit bg-black/40 pr-2 pl-1 py-0.5 rounded-full border border-white/5">
                <Avatar className="h-4 w-4 border border-white/10">
                  <AvatarImage src={client.logo_url || undefined} />
                  <AvatarFallback className="bg-secondary text-[8px] font-bold text-muted-foreground">
                    {getInitials(client.company_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{client.company_name}</span>
              </div>
            )}

            <span
              className={`block text-sm font-semibold leading-tight ${isCompleted ? "line-through text-muted-foreground" : "text-white"}`}
            >
              {task.title}
            </span>
          </div>

          {/* Premium Tooltip for Description */}
          {task.description && !isCompleted && (
            <div className="mt-2" onPointerDown={(e) => e.stopPropagation()}>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md cursor-help border border-white/10 text-muted-foreground bg-white/5 hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider">
                      <AlignLeft size={10} /> Ler Descrição
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start"
                    className="max-w-[300px] bg-[#0f0f0f] backdrop-blur-xl border border-white/10 text-white shadow-[0_10px_40px_-10px_rgba(0,255,128,0.2)] p-4 rounded-xl z-[9999]"
                  >
                    <p className="text-xs leading-relaxed text-white/90 whitespace-pre-wrap">{task.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {priorityInfo && !isCompleted && (
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0 h-5 gap-1 font-medium ${priorityInfo.color} border-transparent`}
              >
                {priorityInfo.icon} {priorityInfo.label}
              </Badge>
            )}
            {task.due_date && (
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0 h-5 gap-1 font-medium ${isCompleted ? "border-transparent text-muted-foreground bg-white/5" : overdue ? "border-transparent text-red-400 bg-red-500/10" : "border-white/10 text-muted-foreground bg-white/5"}`}
              >
                {overdue && !isCompleted ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                {formatDate(task.due_date)}
              </Badge>
            )}
            {comments.length > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0 h-5 gap-1 border-white/10 text-muted-foreground bg-white/5"
              >
                <MessageSquare className="h-3 w-3" /> {comments.length}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-muted-foreground hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-muted-foreground hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded: Comments Section */}
      {expanded && (
        <div className="border-t border-white/5 bg-black/40 p-4 space-y-4 rounded-b-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {comments.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 premium-scrollbar">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5 relative group/comment"
                >
                  <div className="h-6 w-6 rounded-full bg-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="h-3 w-3 text-neon" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs text-white/90 leading-relaxed">{c.content}</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                      {formatCommentDate(c.created_at)}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteComment(c.id)}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover/comment:opacity-100"
                    title="Excluir comentário"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Escreva uma atualização..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitComment()}
              className="text-xs h-9 bg-black/50 border-white/10 focus-visible:ring-neon/30"
            />
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className="h-9 px-4 bg-neon text-black hover:bg-neon/90 shadow-[0_0_10px_rgba(0,255,128,0.2)]"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Dialogs ---
const NewTaskDialog = ({ open, onOpenChange, clientId, clients, onCreated }: any) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    if (open) setSelectedClientId(clientId === "all" ? "" : clientId);
  }, [open, clientId]);

  const handleCreate = async () => {
    if (!title.trim() || !selectedClientId) return;
    setSubmitting(true);
    const { error } = await supabase.from("tasks").insert([
      {
        title: title.trim(),
        description: description.trim() || null,
        client_id: selectedClientId,
        priority: priority as any,
        due_date: dateToTimestamp(dueDate),
        status: "todo",
        is_completed: false,
      },
    ]);
    if (error) toast.error("Erro ao criar tarefa");
    else {
      toast.success("Tarefa criada!");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      onOpenChange(false);
      onCreated();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Tarefa</DialogTitle>
          <DialogDescription className="text-muted-foreground">Adicione uma nova tarefa de produção.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {clientId === "all" && (
            <div>
              <Label className="text-xs text-muted-foreground">Cliente *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="mt-1 bg-black/40 border-white/10">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 z-[10000]">
                  {clients.map((c: Client) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-xs text-muted-foreground">Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Desenhar automação n8n"
              className="mt-1 bg-black/40 border-white/10"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes técnicos..."
              className="mt-1 bg-black/40 border-white/10 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1 bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 z-[10000]">
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prazo (Deadline)</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 bg-black/40 border-white/10 text-white"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/5">
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || submitting || !selectedClientId}
            className="bg-neon text-black hover:bg-neon/90 font-bold"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Criar
            Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditTaskDialog = ({ open, onOpenChange, task, onUpdated }: any) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority((task.priority as string) || "medium");
      setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    }
  }, [task]);

  const handleUpdate = async () => {
    if (!title.trim() || !task) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("tasks")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        priority: priority as any,
        due_date: dateToTimestamp(dueDate),
      } as any)
      .eq("id", task.id);
    if (error) toast.error("Erro ao atualizar");
    else {
      toast.success("Atualizada!");
      onOpenChange(false);
      onUpdated();
    }
    setSubmitting(false);
  };

  if (!task) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Tarefa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 bg-black/40 border-white/10"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 bg-black/40 border-white/10 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1 bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 z-[10000]">
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prazo</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 bg-black/40 border-white/10 text-white"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!title.trim() || submitting}
            className="bg-neon text-black hover:bg-neon/90 font-bold"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}{" "}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page ---
const TasksPage = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [clientPanelCollapsed, setClientPanelCollapsed] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchData = useCallback(async () => {
    try {
      const [clientsRes, tasksRes, commentsRes] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("task_comments").select("*").order("created_at", { ascending: true }),
      ]);
      if (clientsRes.data) setClients(clientsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (commentsRes.data) setComments(commentsRes.data as TaskComment[]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, is_completed: newStatus === "completed" } : t)),
    );
    await supabase
      .from("tasks")
      .update({ status: newStatus, is_completed: newStatus === "completed" } as any)
      .eq("id", taskId);
  };

  const handleAddComment = async (taskId: string, content: string) => {
    const { data, error } = await supabase
      .from("task_comments")
      .insert([{ task_id: taskId, content }])
      .select();
    if (!error && data) setComments((prev) => [...prev, ...(data as TaskComment[])]);
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const { error } = await supabase.from("task_comments").delete().eq("id", commentId);
    if (error) {
      toast.error("Erro ao excluir comentário");
      fetchData(); // reverte
    } else {
      toast.success("Comentário removido!");
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    const taskId = deletingTask.id;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeletingTask(null);
    await supabase.from("task_comments").delete().eq("task_id", taskId);
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error("Erro ao excluir");
      fetchData();
    } else {
      toast.success("Excluída com sucesso");
      setComments((prev) => prev.filter((c) => c.task_id !== taskId));
    }
  };

  const handleDragStart = (event: DragStartEvent) => setActiveTaskId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const targetStatus = (["todo", "in_progress", "completed"] as TaskStatus[]).includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : null;

    if (targetStatus) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && (task.status || "todo") !== targetStatus) handleStatusChange(taskId, targetStatus);
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        const newStatus = (overTask.status || "todo") as TaskStatus;
        const task = tasks.find((t) => t.id === taskId);
        if (task && (task.status || "todo") !== newStatus) handleStatusChange(taskId, newStatus);
      }
    }
  };

  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const activeClient = selectedClientId === "all" ? null : clients.find((c) => c.id === selectedClientId);

  const filteredClients = useMemo(() => {
    let filtered = clients.filter(
      (c) =>
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    filtered.sort((a, b) => {
      const pendentesA = tasks.filter(
        (t) => t.client_id === a.id && (t.status === "todo" || t.status === "in_progress"),
      ).length;
      const pendentesB = tasks.filter(
        (t) => t.client_id === b.id && (t.status === "todo" || t.status === "in_progress"),
      ).length;
      return pendentesB - pendentesA;
    });
    return filtered;
  }, [clients, searchTerm, tasks]);

  // --- LÓGICA CORE DE ORDENAÇÃO E FILTROS ---
  const groupedTasks = useMemo(() => {
    let relevantTasks = selectedClientId === "all" ? [...tasks] : tasks.filter((t) => t.client_id === selectedClientId);

    // 1. Configuração de Datas Base
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeToday = today.getTime();

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const dayOfWeek = today.getDay(); // 0 (Dom) a 6 (Sáb)
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    const endOfThisWeek = new Date(today);
    endOfThisWeek.setDate(today.getDate() + daysToSunday);
    endOfThisWeek.setHours(23, 59, 59, 999);

    const endOfNextWeek = new Date(endOfThisWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);
    endOfNextWeek.setHours(23, 59, 59, 999);

    // 2. Aplicação do Filtro de Data
    if (dateFilter !== "all") {
      relevantTasks = relevantTasks.filter((t) => {
        const tDate = parseLocalDate(t.due_date);
        if (!tDate) return false;

        const tTime = tDate.getTime();
        if (dateFilter === "today") return tTime <= endOfToday.getTime(); // Hoje (Inclui Atrasadas)
        if (dateFilter === "this_week") return tTime <= endOfThisWeek.getTime(); // Essa semana (Inclui hoje e atrasadas)
        if (dateFilter === "next_week") return tTime > endOfThisWeek.getTime() && tTime <= endOfNextWeek.getTime(); // Próxima semana
        return true;
      });
    }

    // 3. Aplicação da Ordenação (Inteligência Absoluta)
    relevantTasks.sort((a, b) => {
      const dateA = parseLocalDate(a.due_date);
      const dateB = parseLocalDate(b.due_date);

      // Categorias de urgência
      const getCategory = (d: Date | null) => {
        if (!d) return 4; // Sem data
        const time = d.getTime();
        if (time < timeToday) return 1; // Atrasadas
        if (time === timeToday) return 2; // Hoje
        return 3; // Futuro
      };

      const catA = getCategory(dateA);
      const catB = getCategory(dateB);

      // Regra 1: Categoria dita a ordem principal
      if (catA !== catB) return catA - catB;

      // Regra 2: Mesma Categoria, desempate por Data
      if (dateA && dateB) {
        if (catA === 1) {
          // Atrasadas: Descending (Mais recente atraso primeiro) -> Ex: 27/fev vem antes de 02/fev
          if (dateA.getTime() !== dateB.getTime()) return dateB.getTime() - dateA.getTime();
        } else {
          // Hoje/Futuro: Ascending (Mais próximo de hoje primeiro) -> Ex: 01/mar vem antes de 05/mar
          if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
        }
      }

      // Regra 3: Mesma Data (ou sem data), desempate por Prioridade (Alta > Baixa)
      const pA = getPriorityWeight(a.priority);
      const pB = getPriorityWeight(b.priority);
      if (pA !== pB) return pB - pA;

      return 0; // Empate total
    });

    return {
      todo: relevantTasks.filter((t) => (t.status || "todo") === "todo" && !t.is_completed),
      in_progress: relevantTasks.filter((t) => t.status === "in_progress"),
      completed: relevantTasks.filter((t) => {
        const isDone = t.status === "completed" || t.is_completed;
        if (!isDone) return false;

        const referenceDateStr = t.created_at;
        if (!referenceDateStr) return true;

        const taskDate = new Date(referenceDateStr);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 2);

        return taskDate >= cutoffDate;
      }),
    };
  }, [tasks, selectedClientId, dateFilter]);

  const getClientCounts = useCallback(
    (clientId: string) => {
      const ct = tasks.filter((t) => t.client_id === clientId);
      return {
        inProgress: ct.filter((t) => t.status === "in_progress").length,
        todo: ct.filter((t) => (t.status || "todo") === "todo" && !t.is_completed).length,
        total: ct.length,
      };
    },
    [tasks],
  );

  const globalCounts = useMemo(() => {
    return {
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      todo: tasks.filter((t) => (t.status || "todo") === "todo" && !t.is_completed).length,
    };
  }, [tasks]);

  if (loading)
    return (
      <div className="p-8">
        <Skeleton className="h-[500px] w-full rounded-2xl bg-card/20" />
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-2xl animate-in fade-in duration-500 m-4">
      <style>{`
        .premium-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .premium-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 128, 0.4); }
      `}</style>

      {/* --- Left Panel: Client Sidebar --- */}
      <div
        className={`flex flex-col shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300 z-10 ${
          clientPanelCollapsed ? "w-0 md:w-16 overflow-hidden items-center py-4" : "w-full md:w-[320px]"
        }`}
      >
        {clientPanelCollapsed ? (
          <button
            onClick={() => setClientPanelCollapsed(false)}
            className="p-2 rounded-xl text-muted-foreground hover:text-neon hover:bg-neon/10 transition-all shadow-sm"
            title="Expandir painel"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-5 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Briefcase className="text-neon h-5 w-5 drop-shadow-[0_0_8px_rgba(0,255,128,0.5)]" />
                  Carteira
                </h1>
                <button
                  onClick={() => setClientPanelCollapsed(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-black/50 border-white/10 focus-visible:ring-neon/30 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto premium-scrollbar px-3">
              <div className="space-y-1.5 py-3">
                <div
                  onClick={() => setSelectedClientId("all")}
                  className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 group mb-4 ${
                    selectedClientId === "all"
                      ? "bg-neon/10 border-neon/30 shadow-[inset_0_0_15px_rgba(0,255,128,0.05)]"
                      : "bg-transparent border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors ${selectedClientId === "all" ? "border-neon/80 bg-neon/20 text-neon" : "border-white/10 bg-white/5 text-muted-foreground group-hover:border-white/30"}`}
                    >
                      <Globe size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm truncate ${selectedClientId === "all" ? "text-neon" : "text-white group-hover:text-white"}`}
                      >
                        Visão Geral
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                          <PlayCircle size={10} /> {globalCounts.inProgress} Andamento
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Circle size={10} /> {globalCounts.todo} A Fazer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                    Clientes Ativos
                  </p>
                </div>

                {filteredClients.map((client) => {
                  const counts = getClientCounts(client.id);
                  const isSelected = selectedClientId === client.id;
                  const hasPending = counts.todo > 0 || counts.inProgress > 0;

                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 group ${
                        isSelected
                          ? "bg-neon/10 border-neon/30 shadow-[inset_0_0_15px_rgba(0,255,128,0.05)]"
                          : "bg-transparent border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={`h-9 w-9 border-2 transition-colors ${isSelected ? "border-neon/80" : "border-white/10 group-hover:border-white/30"}`}
                        >
                          <AvatarImage src={client.logo_url || undefined} />
                          <AvatarFallback className="bg-black text-[10px] font-bold text-muted-foreground">
                            {getInitials(client.company_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3
                              className={`font-semibold text-sm truncate ${isSelected ? "text-neon" : "text-white group-hover:text-white"}`}
                            >
                              {client.company_name}
                            </h3>
                            {hasPending && (
                              <span className="text-[10px] font-mono text-muted-foreground bg-black/50 px-1.5 rounded-sm border border-white/5">
                                {counts.todo + counts.inProgress}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {hasPending ? (
                              <>
                                {counts.inProgress > 0 && (
                                  <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                                    <PlayCircle size={10} /> {counts.inProgress} Andamento
                                  </span>
                                )}
                                {counts.todo > 0 && (
                                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                    <Circle size={10} /> {counts.todo} A Fazer
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-emerald-500/70 font-mono flex items-center gap-1">
                                <CheckCircle2 size={10} /> Em Dia
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Right Panel: Horizontal Kanban --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] relative">
        {/* Header KANBAN COM FILTROS */}
        <div className="px-8 py-5 border-b border-white/5 bg-black/30 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 sticky top-0">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {selectedClientId === "all" ? "Visão Geral da Produção" : activeClient?.company_name}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 font-mono uppercase tracking-widest">
              {selectedClientId === "all" ? <Globe size={12} /> : <Clock size={12} />}
              Quadro de Operações
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-1 shadow-inner">
              {[
                { id: "all", label: "Todas" },
                { id: "today", label: "Hoje" },
                { id: "this_week", label: "Essa Semana" },
                { id: "next_week", label: "Próx. Semana" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id as DateFilter)}
                  className={`px-3 py-1.5 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${
                    dateFilter === f.id
                      ? "bg-white/10 text-white shadow-sm border border-white/10"
                      : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setNewTaskOpen(true)}
              className="bg-neon text-black font-bold hover:bg-neon/90 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,128,0.2)] rounded-xl h-9 px-4 shrink-0 hidden md:flex"
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Entrega
            </Button>
          </div>
        </div>

        {/* KANBAN HORIZONTAL SCROLL AREA */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden premium-scrollbar">
          <div className="h-full min-w-max p-8 flex items-start gap-6 pb-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {(["todo", "in_progress", "completed"] as TaskStatus[]).map((statusKey) => {
                const statusTasks = groupedTasks[statusKey];
                const config = STATUS_CONFIG[statusKey];

                return (
                  <div key={statusKey} className="flex flex-col w-[350px] h-full shrink-0">
                    {/* Column Header */}
                    <div
                      className={`flex items-center justify-between mb-4 p-3 rounded-xl border ${config.border} ${config.bg} backdrop-blur-md`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`${config.color}`}>{config.icon}</span>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">{config.label}</h3>
                      </div>
                      <Badge variant="outline" className={`border-current/30 ${config.color} bg-black/40 font-mono`}>
                        {statusTasks.length}
                      </Badge>
                    </div>

                    {/* Column Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto premium-scrollbar pr-3 -mr-3 pb-20">
                      <DroppableColumn id={statusKey}>
                        <SortableContext items={statusTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                          {statusTasks.length === 0 ? (
                            <div className="h-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-xl opacity-40">
                              <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-widest">
                                {dateFilter !== "all" ? "Nenhuma p/ este filtro" : "Vazio"}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {statusTasks.map((task) => {
                                const taskClient = clients.find((c) => c.id === task.client_id);
                                return (
                                  <DraggableTaskCard
                                    key={task.id}
                                    task={task}
                                    client={taskClient}
                                    comments={comments.filter((c) => c.task_id === task.id)}
                                    onStatusChange={handleStatusChange}
                                    onAddComment={handleAddComment}
                                    onDeleteComment={handleDeleteComment}
                                    onEdit={(t) => setEditingTask(t)}
                                    onDelete={(t) => setDeletingTask(t)}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </SortableContext>
                      </DroppableColumn>
                    </div>
                  </div>
                );
              })}

              <DragOverlay>
                {activeTask ? (
                  <div className="opacity-90 rotate-2 scale-105 cursor-grabbing shadow-2xl shadow-neon/10">
                    <TaskCard
                      task={activeTask}
                      client={clients.find((c) => c.id === activeTask.client_id)}
                      comments={comments.filter((c) => c.task_id === activeTask.id)}
                      onStatusChange={() => {}}
                      onAddComment={() => {}}
                      onDeleteComment={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Modals */}
        <NewTaskDialog
          open={newTaskOpen}
          onOpenChange={setNewTaskOpen}
          clientId={selectedClientId}
          clients={clients}
          onCreated={fetchData}
        />
        <EditTaskDialog
          open={!!editingTask}
          onOpenChange={(v: boolean) => !v && setEditingTask(null)}
          task={editingTask}
          onUpdated={fetchData}
        />
        <AlertDialog open={!!deletingTask} onOpenChange={(v: boolean) => !v && setDeletingTask(null)}>
          <AlertDialogContent className="bg-card border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Excluir entrega</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Tem certeza que deseja excluir "<strong>{deletingTask?.title}</strong>"? Esta ação não pode ser
                desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-white/5 border-white/10">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                className="bg-red-500 text-white hover:bg-red-600 font-bold"
              >
                Excluir Definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TasksPage;
