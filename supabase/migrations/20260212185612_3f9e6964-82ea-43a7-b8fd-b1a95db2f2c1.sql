
-- Add status column to tasks (todo, in_progress, completed) to replace boolean is_completed
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'todo';

-- Migrate existing data
UPDATE public.tasks SET status = CASE WHEN is_completed = true THEN 'completed' ELSE 'todo' END;

-- Create task_comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NULL
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS policy for task_comments
CREATE POLICY "Admin full access task_comments" ON public.task_comments FOR ALL USING (true);

-- Index for fast lookups
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
