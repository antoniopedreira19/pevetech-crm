import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type Task = Tables<"tasks">;

const priorityColor: Record<string, string> = {
  low: "bg-secondary text-muted-foreground",
  medium: "bg-neon/10 text-neon",
  high: "bg-destructive/20 text-destructive",
};

const TasksPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    supabase.from("tasks").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setTasks(data);
    });
  }, []);

  const toggleTask = async (task: Task) => {
    const newVal = !task.is_completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_completed: newVal } : t)));
    const { error } = await supabase.from("tasks").update({ is_completed: newVal }).eq("id", task.id);
    if (error) {
      toast({ title: "Erro ao atualizar tarefa", variant: "destructive" });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_completed: task.is_completed } : t)));
    }
  };

  const pending = tasks.filter((t) => !t.is_completed);
  const completed = tasks.filter((t) => t.is_completed);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Tarefas</h1>

      <div className="space-y-2 mb-8">
        {pending.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-neon-dim transition-colors"
          >
            <Checkbox
              checked={false}
              onCheckedChange={() => toggleTask(task)}
              className="mt-0.5 border-neon-dim data-[state=checked]:bg-neon data-[state=checked]:border-neon"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{task.title}</p>
              {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
            </div>
            {task.priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}>
                {task.priority}
              </span>
            )}
          </div>
        ))}
        {pending.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhuma tarefa pendente 🎉</p>
        )}
      </div>

      {completed.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Concluídas</h2>
          <div className="space-y-2 opacity-60">
            {completed.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
              >
                <Checkbox
                  checked={true}
                  onCheckedChange={() => toggleTask(task)}
                  className="mt-0.5 border-neon-dim data-[state=checked]:bg-neon data-[state=checked]:border-neon"
                />
                <p className="text-sm text-muted-foreground line-through">{task.title}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TasksPage;
