
# Correção do Desalinhamento da Tabela de Clientes

## Problema
Existe um `<td>` extra em cada linha da tabela que serve como indicador visual (barra verde no hover). Esse elemento ocupa uma coluna adicional que os cabeçalhos nao possuem, causando o deslocamento de todas as colunas de dados para a direita.

## Solucao
Remover o `<td>` extra e aplicar o efeito de borda esquerda diretamente na linha (`<tr>`) usando um pseudo-elemento CSS (`before:`), mantendo o visual identico sem afetar a estrutura da tabela.

## Detalhes Tecnicos

**Arquivo:** `src/pages/ClientsPage.tsx`

1. **Remover** o `<td>` extra na linha 583:
   ```
   <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-neon opacity-0 group-hover:opacity-100 transition-opacity"></td>
   ```

2. **Adicionar** pseudo-elemento `before:` na classe do `<tr>` para replicar o efeito visual:
   ```
   className="border-b border-border/40 transition-all duration-200 hover:bg-neon/5 group relative
     before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-neon
     before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
   ```

Isso corrige o alinhamento sem perder o efeito visual de destaque ao hover.
