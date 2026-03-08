

## Historico de MRR por Cliente

### O Problema
Hoje, quando voce atualiza o MRR de um cliente, o valor antigo e sobrescrito. Nao ha como saber quanto era o MRR antes, nem quando mudou.

### A Solucao
Criar uma tabela de **historico de MRR** (`client_mrr_history`) que registra cada alteracao de valor, com data e motivo. O campo `monthly_value` na tabela `clients` continua existindo como o valor atual, mas cada mudanca gera um registro no historico.

### Como vai funcionar

1. **Nova tabela `client_mrr_history`** com as colunas:
   - `id` (uuid, PK)
   - `client_id` (uuid, FK para clients)
   - `previous_value` (numeric) - valor anterior
   - `new_value` (numeric) - novo valor
   - `reason` (text) - motivo da alteracao (ex: "Novo modulo contratado", "Reajuste anual")
   - `effective_date` (timestamp) - a partir de quando vale o novo valor
   - `created_at` (timestamp) - quando o registro foi criado

2. **Fluxo na interface**: Ao editar o MRR de um cliente (na pagina de clientes), se o valor mudar, abre um campo para informar o **motivo** da alteracao. Ao salvar, o sistema:
   - Insere um registro em `client_mrr_history` com valor antigo, valor novo, motivo e data
   - Atualiza o `monthly_value` na tabela `clients`

3. **Grafico de evolucao no Dashboard**: O grafico de "Crescimento de Receita" passa a usar dados reais do historico, mostrando a evolucao do MRR total ao longo do tempo (somando os valores vigentes de cada cliente em cada periodo).

### Detalhes Tecnicos

**1. Migracao SQL**
```sql
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

-- Registro inicial para clientes existentes
INSERT INTO client_mrr_history (client_id, previous_value, new_value, reason, effective_date)
SELECT id, 0, COALESCE(monthly_value, 0), 'Valor inicial cadastrado', COALESCE(created_at, now())
FROM clients;
```

**2. ClientsPage.tsx**
- No drawer de edicao, ao detectar que o MRR mudou, exibir um campo "Motivo da alteracao" (obrigatorio)
- Ao salvar, inserir o registro no historico antes de atualizar o cliente

**3. DashboardOverview.tsx**
- Buscar dados de `client_mrr_history` para calcular o MRR real de cada mes
- Substituir os dados simulados do grafico por dados reais baseados no historico

