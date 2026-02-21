
-- Add deal_value and loss_reason columns to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS deal_value numeric DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS loss_reason text;

-- Create lead_comments table
CREATE TABLE public.lead_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access lead_comments" ON public.lead_comments FOR ALL USING (true);
