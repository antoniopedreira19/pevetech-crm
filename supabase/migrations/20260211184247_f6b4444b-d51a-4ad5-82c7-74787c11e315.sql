CREATE TABLE client_mrr_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  previous_value numeric NOT NULL DEFAULT 0,
  new_value numeric NOT NULL DEFAULT 0,
  reason text,
  effective_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE client_mrr_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access mrr_history"
  ON client_mrr_history FOR ALL USING (true);

INSERT INTO client_mrr_history (client_id, previous_value, new_value, reason, effective_date)
SELECT id, 0, COALESCE(monthly_value, 0), 'Valor inicial cadastrado', COALESCE(created_at, now())
FROM clients;