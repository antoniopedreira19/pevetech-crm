import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Search, Plus, CheckCircle2, Circle, Calendar, Clock, Briefcase, AlertCircle, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// --- Types ---
type Client = Tables<"clients">;
// Extendendo a tipagem base do Supabase caso esses campos não estejam perfeitamente mapeados ainda
type Task = Tables<"tasks"> & {
  due_date?: string | null;
  priority?: "low" | "medium" | "high" | null;
};

// --- Helper Functions ---
const getInitials = (name: string | null) => {
  if (!name) return "CL";
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";

  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
};

// --- Components ---

const TaskItem = ({ task, onToggle }: { task: Task; onToggle: (id: string, currentStatus: boolean) => void }) => {
  const isCompleted = task.status === "completed" || task.is_completed; // Lida com boolean ou string dependendo do seu schema

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-card/60 border border-transparent hover:border-border/50 ${isCompleted ? "opacity-60" : ""}`}
    >
      <button
        onClick={() => onToggle(task.id, isCompleted)}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-neon transition-colors"
      >
        {isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
      </button>

      <div className="flex flex-col flex-1 gap-1.5 min-w-0">
        <span
          className={`text-sm font-medium transition-all ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
        >
          {task.title}
        </span>

        {/* Metadados da Tarefa */}
        <div className="flex flex-wrap items-center gap-2">
          {task.due_date && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${isCompleted ? "border-border/50 text-muted-foreground" : "border-amber-500/30 text-amber-500 bg-amber-500/5"}`}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.due_date)}
            </Badge>
          )}

          {task.priority === "high" && !isCompleted && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 gap-1 border-red-500/30 text-red-500 bg-red-500/5"
            >
              <AlertCircle className="h-3 w-3" />
              Urgente
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

const TasksPage = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, tasksRes] = await Promise.all([
          supabase.from("clients").select("*").order("created_at", { ascending: false }),
          supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        ]);

        if (clientsRes.data) setClients(clientsRes.data);
        if (tasksRes.data) setTasks(tasksRes.data);

        // Seleciona o primeiro cliente por padrão se houver
        if (clientsRes.data && clientsRes.data.length > 0) {
          setSelectedClientId(clientsRes.data[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, is_completed: !currentStatus, status: !currentStatus ? "completed" : "pending" } : t,
      ),
    );

    // API Call (Descomente quando tiver certeza da coluna no Supabase: is_completed ou status)
    /*
    await supabase
      .from("tasks")
      .update({ is_completed: !currentStatus }) // ou status: 'completed'
      .eq("id", taskId);
    */
  };

  // --- Derived Data ---
  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [clients, searchTerm]);

  const activeClient = clients.find((c) => c.id === selectedClientId);

  const activeTasks = useMemo(() => {
    if (!selectedClientId) return { pending: [], completed: [] };
    const clientTasks = tasks.filter((t) => t.client_id === selectedClientId);

    return {
      pending: clientTasks.filter((t) => t.status !== "completed" && !t.is_completed),
      completed: clientTasks.filter((t) => t.status === "completed" || t.is_completed),
    };
  }, [tasks, selectedClientId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] gap-6 p-6">
        <div className="w-[350px] space-y-4">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-500">
      {/* --- Left Panel: Client List --- */}
      <div className="w-full md:w-[380px] flex flex-col gap-4 shrink-0 border-r border-border/40 pr-2 md:pr-6">
        {/* Header lateral */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <LayoutList className="text-neon h-6 w-6" />
              Tarefas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie entregas por cliente.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card/50 border-border/50"
            />
          </div>
        </div>

        {/* Client List */}
        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="space-y-2 pb-4">
            {filteredClients.map((client) => {
              // Calculando progresso para o card
              const cTasks = tasks.filter((t) => t.client_id === client.id);
              const completed = cTasks.filter((t) => t.status === "completed" || t.is_completed).length;
              const total = cTasks.length;
              const pending = total - completed;
              const progress = total === 0 ? 0 : (completed / total) * 100;

              const isSelected = selectedClientId === client.id;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-neon/5 border-neon/50 shadow-sm shadow-neon/10"
                      : "bg-card/30 border-border/40 hover:bg-card/80 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className={`h-10 w-10 border ${isSelected ? "border-neon/50" : "border-border/50"}`}>
                      <AvatarImage src={client.logo_url || undefined} />
                      <AvatarFallback className="bg-secondary text-xs font-bold">
                        {getInitials(client.company)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-neon" : "text-foreground"}`}>
                        {client.company}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{client.name}</p>
                    </div>
                    {pending > 0 && (
                      <Badge variant="secondary" className="h-6 px-2 text-xs bg-background/50">
                        {pending} pendentes
                      </Badge>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                      <span>Progresso</span>
                      <span>
                        {completed}/{total}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-1.5 bg-background/50"
                      indicatorClassName={isSelected ? "bg-neon" : "bg-primary"}
                    />
                  </div>
                </div>
              );
            })}

            {filteredClients.length === 0 && (
              <div className="text-center p-6 text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
                Nenhum cliente encontrado.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* --- Right Panel: Active Client Tasks --- */}
      <div className="flex-1 flex flex-col bg-card/20 border border-border/30 rounded-2xl overflow-hidden relative">
        {!activeClient ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-20 w-20 bg-card rounded-full flex items-center justify-center mb-4 shadow-inner border border-border/50">
              <Briefcase className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum cliente selecionado</h2>
            <p className="text-muted-foreground max-w-sm">
              Selecione um cliente no painel lateral para visualizar, gerenciar ou adicionar novas tarefas à lista.
            </p>
          </div>
        ) : (
          // Active Task List
          <>
            {/* Header da Todo List */}
            <div className="p-6 border-b border-border/40 bg-card/40 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-neon/20 shadow-lg shadow-neon/5">
                  <AvatarFallback className="bg-neon/10 text-neon font-bold text-lg">
                    {getInitials(activeClient.company)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{activeClient.company}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {activeTasks.pending.length} tarefas em aberto
                  </p>
                </div>
              </div>
              <Button className="bg-neon text-neon-foreground hover:bg-neon/90 shadow-md transition-all active:scale-95">
                <Plus className="h-4 w-4 mr-2" /> Nova Tarefa
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-8 pb-10">
                {/* Pending Tasks */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    A Fazer{" "}
                    <Badge variant="secondary" className="bg-background/50">
                      {activeTasks.pending.length}
                    </Badge>
                  </h3>

                  {activeTasks.pending.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-border/40 rounded-xl bg-card/10">
                      <p className="text-muted-foreground text-sm">
                        Tudo em dia! Nenhuma tarefa pendente para este cliente.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activeTasks.pending.map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Tasks */}
                {activeTasks.completed.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <Separator className="my-6 bg-border/40" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      Concluídas{" "}
                      <Badge variant="secondary" className="bg-background/50">
                        {activeTasks.completed.length}
                      </Badge>
                    </h3>
                    <div className="space-y-1">
                      {activeTasks.completed.map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
