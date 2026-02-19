import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Search, Plus, CheckCircle2, Circle, Calendar, Clock, Briefcase,
  AlertCircle, LayoutList, MessageSquare, ChevronDown, ChevronRight,
  Flame, ArrowRight, Send, Loader2, PlayCircle, GripVertical, Pencil, AlertTriangle,
  Trash2, PanelLeftClose, PanelLeft
} from "lucide-react";
import {
  DndContext, closestCenter, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay, useDroppable, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// --- Types ---
type Client = Tables<"clients">;
type Task = Tables<"tasks"> & { status?: string };
type TaskComment = { id: string; task_id: string; content: string; created_at: string; user_id: string | null };

type TaskStatus = "todo" | "in_progress" | "completed";

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  todo: {
    label: "A Fazer",
    icon: <Circle className="h-4 w-4" />,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
  },
  in_progress: {
    label: "Em Andamento",
    icon: <PlayCircle className="h-4 w-4" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  completed: {
    label: "Concluídas",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
};

const PRIORITY_CONFIG = {
  high: { label: "Alta", color: "border-red-500/40 text-red-400 bg-red-500/10", icon: <Flame className="h-3 w-3" /> },
  medium: { label: "Média", color: "border-amber-500/40 text-amber-400 bg-amber-500/10", icon: <AlertCircle className="h-3 w-3" /> },
  low: { label: "Baixa", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", icon: <ArrowRight className="h-3 w-3" /> },
};

// --- Helpers ---
const getInitials = (name: string | null) => name ? name.substring(0, 2).toUpperCase() : "CL";

const isOverdue = (dueDate?: string | null, status?: string) => {
  if (!dueDate || status === "completed") return false;
  // Parse as local date to avoid timezone offset issues
  const parts = dueDate.split("T")[0].split("-");
  const dueDateLocal = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDateLocal < today;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  // Parse as local date to avoid timezone offset
  const parts = dateString.split("T")[0].split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
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
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
};

// Convert local date string (YYYY-MM-DD) to ISO with noon time to avoid timezone shift
const dateToTimestamp = (dateStr: string) => {
  if (!dateStr) return null;
  return `${dateStr}T12:00:00`;
};

// --- Droppable Column ---
const DroppableColumn = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] rounded-xl transition-all duration-200 ${
        isOver ? "bg-neon/5 ring-1 ring-neon/20" : ""
      }`}
    >
      {children}
    </div>
  );
};

// --- Draggable Task Card Wrapper ---
const DraggableTaskCard = ({
  task,
  comments,
  onStatusChange,
  onAddComment,
  onEdit,
  onDelete,
}: {
  task: Task;
  comments: TaskComment[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddComment: (taskId: string, content: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.status || "todo" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        comments={comments}
        onStatusChange={onStatusChange}
        onAddComment={onAddComment}
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
  comments,
  onStatusChange,
  onAddComment,
  dragListeners,
  onEdit,
  onDelete,
}: {
  task: Task;
  comments: TaskComment[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddComment: (taskId: string, content: string) => void;
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
      className={`group rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "border-border/30 bg-card/20 opacity-60"
          : "border-border/50 bg-card/40 hover:border-border/80 hover:bg-card/60"
      }`}
    >
      {/* Main Row */}
      <div className="flex items-start gap-2 p-4">
        {/* Drag Handle */}
        <button
          {...dragListeners}
          className="mt-1 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors opacity-0 group-hover:opacity-100"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {/* Status Toggle Button */}
        <button
          onClick={() => onStatusChange(task.id, nextStatus[status])}
          className={`mt-0.5 shrink-0 transition-colors ${STATUS_CONFIG[status].color} hover:opacity-80`}
          title={`Mudar para: ${STATUS_CONFIG[nextStatus[status]].label}`}
        >
          {status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : status === "in_progress" ? (
            <PlayCircle className="h-5 w-5 text-blue-400" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </span>
          </div>

          {task.description && !isCompleted && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {priorityInfo && !isCompleted && (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${priorityInfo.color}`}>
                {priorityInfo.icon}
                {priorityInfo.label}
              </Badge>
            )}
            {task.due_date && (
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${
                  isCompleted ? "border-border/30 text-muted-foreground" : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date)}
              </Badge>
            )}
            {overdue && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1 border-red-500/40 text-red-400 bg-red-500/10">
                <AlertTriangle className="h-3 w-3" />
                Atrasada
              </Badge>
            )}
            {comments.length > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1 border-border/30 text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {comments.length}
              </Badge>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50 opacity-0 group-hover:opacity-100"
            title="Editar tarefa"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={() => onDelete(task)}
            className="shrink-0 text-muted-foreground hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
            title="Excluir tarefa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded: Comments Section */}
      {expanded && (
        <div className="border-t border-border/30 px-4 pb-4 pt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Status Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            {(["todo", "in_progress", "completed"] as TaskStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(task.id, s)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  status === s
                    ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-current/30 font-medium`
                    : "border-border/30 text-muted-foreground hover:border-border/60"
                }`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          {/* Comments */}
          {comments.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/20">
                  <div className="h-6 w-6 rounded-full bg-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="h-3 w-3 text-neon" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{c.content}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">{formatCommentDate(c.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitComment()}
              className="text-xs h-8 bg-secondary/30 border-border/30"
            />
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className="h-8 px-3 bg-neon text-accent-foreground hover:bg-neon/90"
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- New Task Dialog ---
const NewTaskDialog = ({
  open,
  onOpenChange,
  clientId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId: string;
  onCreated: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("tasks").insert([{
      title: title.trim(),
      description: description.trim() || null,
      client_id: clientId,
      priority: priority as any,
      due_date: dateToTimestamp(dueDate),
      status: "todo",
      is_completed: false,
    }]);

    if (error) {
      toast.error("Erro ao criar tarefa");
    } else {
      toast.success("Tarefa criada!");
      setTitle(""); setDescription(""); setPriority("medium"); setDueDate("");
      onOpenChange(false);
      onCreated();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Tarefa</DialogTitle>
          <DialogDescription className="text-muted-foreground">Adicione uma nova tarefa para este cliente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Criar dashboard de vendas" className="mt-1 bg-secondary/30 border-border/40" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes da tarefa..." className="mt-1 bg-secondary/30 border-border/40 min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1 bg-secondary/30 border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="high">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prazo</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 bg-secondary/30 border-border/40" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!title.trim() || submitting} className="bg-neon text-accent-foreground hover:bg-neon/90">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Criar Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Edit Task Dialog ---
const EditTaskDialog = ({
  open,
  onOpenChange,
  task,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
  onUpdated: () => void;
}) => {
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
    const { error } = await supabase.from("tasks").update({
      title: title.trim(),
      description: description.trim() || null,
      priority: priority as any,
      due_date: dateToTimestamp(dueDate),
    } as any).eq("id", task.id);

    if (error) {
      toast.error("Erro ao atualizar tarefa");
    } else {
      toast.success("Tarefa atualizada!");
      onOpenChange(false);
      onUpdated();
    }
    setSubmitting(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Tarefa</DialogTitle>
          <DialogDescription className="text-muted-foreground">Atualize os detalhes da tarefa.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 bg-secondary/30 border-border/40" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 bg-secondary/30 border-border/40 min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1 bg-secondary/30 border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="high">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prazo</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 bg-secondary/30 border-border/40" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleUpdate} disabled={!title.trim() || submitting} className="bg-neon text-accent-foreground hover:bg-neon/90">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
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
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [clientPanelCollapsed, setClientPanelCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
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
      if (!selectedClientId && clientsRes.data?.length) {
        setSelectedClientId(clientsRes.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus, is_completed: newStatus === "completed" } : t));
    await supabase.from("tasks").update({ status: newStatus, is_completed: newStatus === "completed" } as any).eq("id", taskId);
  };

  const handleAddComment = async (taskId: string, content: string) => {
    const { data, error } = await supabase.from("task_comments").insert([{ task_id: taskId, content }]).select();
    if (!error && data) {
      setComments((prev) => [...prev, ...(data as TaskComment[])]);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    const taskId = deletingTask.id;
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeletingTask(null);

    // Delete comments first, then the task
    await supabase.from("task_comments").delete().eq("task_id", taskId);
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error("Erro ao excluir tarefa");
      fetchData(); // Revert
    } else {
      toast.success("Tarefa excluída!");
      setComments((prev) => prev.filter((c) => c.task_id !== taskId));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

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
      if (task && (task.status || "todo") !== targetStatus) {
        handleStatusChange(taskId, targetStatus);
      }
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        const newStatus = (overTask.status || "todo") as TaskStatus;
        const task = tasks.find((t) => t.id === taskId);
        if (task && (task.status || "todo") !== newStatus) {
          handleStatusChange(taskId, newStatus);
        }
      }
    }
  };

  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;

  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) => c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [clients, searchTerm]);

  const activeClient = clients.find((c) => c.id === selectedClientId);

  const groupedTasks = useMemo(() => {
    if (!selectedClientId) return { todo: [], in_progress: [], completed: [] };
    const clientTasks = tasks.filter((t) => t.client_id === selectedClientId);
    return {
      todo: clientTasks.filter((t) => (t.status || "todo") === "todo"),
      in_progress: clientTasks.filter((t) => t.status === "in_progress"),
      completed: clientTasks.filter((t) => t.status === "completed" || (t.status !== "in_progress" && t.is_completed)),
    };
  }, [tasks, selectedClientId]);

  const getClientCounts = useCallback((clientId: string) => {
    const ct = tasks.filter((t) => t.client_id === clientId);
    const inProgress = ct.filter((t) => t.status === "in_progress").length;
    const todo = ct.filter((t) => (t.status || "todo") === "todo" && !t.is_completed).length;
    const completed = ct.filter((t) => t.status === "completed" || (t.status !== "in_progress" && t.is_completed)).length;
    return { inProgress, todo, completed, total: ct.length };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex h-full gap-6 p-6">
        <div className="w-[350px] space-y-4">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-64" />
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-0 animate-in fade-in duration-500">
      {/* --- Left Panel: Client List --- */}
      <div className={`flex flex-col gap-3 shrink-0 border-r border-border/30 bg-card/10 transition-all duration-300 ${
        clientPanelCollapsed ? "w-0 md:w-14 overflow-hidden p-2" : "w-full md:w-[340px] p-4"
      }`}>
        {clientPanelCollapsed ? (
          <button
            onClick={() => setClientPanelCollapsed(false)}
            className="mx-auto mt-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Expandir painel de clientes"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <LayoutList className="text-neon h-5 w-5" />
                  Tarefas
                </h1>
                <p className="text-muted-foreground text-xs mt-0.5">Gerencie entregas por cliente.</p>
              </div>
              <button
                onClick={() => setClientPanelCollapsed(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                title="Minimizar painel"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm bg-secondary/30 border-border/30"
              />
            </div>

            <ScrollArea className="flex-1 -mr-2 pr-2">
              <div className="space-y-1.5 pb-4">
                {filteredClients.map((client) => {
                  const counts = getClientCounts(client.id);
                  const isSelected = selectedClientId === client.id;

                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-neon/5 border-neon/40 shadow-sm shadow-neon/5"
                          : "bg-transparent border-transparent hover:bg-card/50 hover:border-border/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-9 w-9 border ${isSelected ? "border-neon/40" : "border-border/30"}`}>
                          <AvatarImage src={client.logo_url || undefined} />
                          <AvatarFallback className="bg-secondary text-[10px] font-bold">{getInitials(client.company_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-neon" : "text-foreground"}`}>
                            {client.company_name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground truncate">{client.name}</p>
                        </div>
                      </div>

                      {/* Counts */}
                      <div className="flex items-center gap-3 mt-2.5 ml-12">
                        {counts.todo > 0 && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Circle className="h-2.5 w-2.5" /> {counts.todo}
                          </span>
                        )}
                        {counts.inProgress > 0 && (
                          <span className="text-[10px] text-blue-400 flex items-center gap-1">
                            <PlayCircle className="h-2.5 w-2.5" /> {counts.inProgress}
                          </span>
                        )}
                        {counts.completed > 0 && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> {counts.completed}
                          </span>
                        )}
                        {counts.total === 0 && (
                          <span className="text-[10px] text-muted-foreground/50">Sem tarefas</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredClients.length === 0 && (
                  <div className="text-center p-6 text-muted-foreground text-sm border border-dashed border-border/30 rounded-xl">
                    Nenhum cliente encontrado.
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      {/* --- Right Panel: Task Board --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeClient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-16 w-16 bg-card rounded-full flex items-center justify-center mb-4 border border-border/30">
              <Briefcase className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-lg font-semibold mb-1 text-foreground">Nenhum cliente selecionado</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Selecione um cliente para gerenciar tarefas.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/30 bg-card/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-neon/20">
                  <AvatarImage src={activeClient.logo_url || undefined} />
                  <AvatarFallback className="bg-neon/10 text-neon font-bold text-sm">
                    {getInitials(activeClient.company_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{activeClient.company_name}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Circle className="h-3 w-3" /> {groupedTasks.todo.length} a fazer</span>
                    <span className="flex items-center gap-1 text-blue-400"><PlayCircle className="h-3 w-3" /> {groupedTasks.in_progress.length} em andamento</span>
                    <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> {groupedTasks.completed.length} concluídas</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => setNewTaskOpen(true)} className="bg-neon text-accent-foreground hover:bg-neon/90 active:scale-95 transition-all h-9 text-sm">
                <Plus className="h-4 w-4 mr-1.5" /> Nova Tarefa
              </Button>
            </div>

            {/* Task Groups with Drag & Drop */}
            <ScrollArea className="flex-1 px-6 py-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="max-w-3xl mx-auto space-y-6 pb-10">
                  {(["todo", "in_progress", "completed"] as TaskStatus[]).map((statusKey) => {
                    const statusTasks = groupedTasks[statusKey];
                    const config = STATUS_CONFIG[statusKey];

                    return (
                      <div key={statusKey}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={config.color}>{config.icon}</span>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {config.label}
                          </h3>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-secondary/40">
                            {statusTasks.length}
                          </Badge>
                        </div>

                        <DroppableColumn id={statusKey}>
                          <SortableContext items={statusTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                            {statusTasks.length === 0 ? (
                              <div className="p-4 text-center border border-dashed border-border/20 rounded-xl">
                                <p className="text-muted-foreground/50 text-xs">Nenhuma tarefa.</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {statusTasks.map((task) => (
                                  <DraggableTaskCard
                                    key={task.id}
                                    task={task}
                                    comments={comments.filter((c) => c.task_id === task.id)}
                                    onStatusChange={handleStatusChange}
                                    onAddComment={handleAddComment}
                                    onEdit={(t) => setEditingTask(t)}
                                    onDelete={(t) => setDeletingTask(t)}
                                  />
                                ))}
                              </div>
                            )}
                          </SortableContext>
                        </DroppableColumn>
                      </div>
                    );
                  })}
                </div>

                <DragOverlay>
                  {activeTask ? (
                    <div className="opacity-90 rotate-1 scale-105">
                      <TaskCard
                        task={activeTask}
                        comments={comments.filter((c) => c.task_id === activeTask.id)}
                        onStatusChange={() => {}}
                        onAddComment={() => {}}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </ScrollArea>

            {/* New Task Dialog */}
            <NewTaskDialog
              open={newTaskOpen}
              onOpenChange={setNewTaskOpen}
              clientId={activeClient.id}
              onCreated={fetchData}
            />
            {/* Edit Task Dialog */}
            <EditTaskDialog
              open={!!editingTask}
              onOpenChange={(v) => !v && setEditingTask(null)}
              task={editingTask}
              onUpdated={fetchData}
            />
            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingTask} onOpenChange={(v) => !v && setDeletingTask(null)}>
              <AlertDialogContent className="bg-card border-border/50">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir "<strong>{deletingTask?.title}</strong>"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
