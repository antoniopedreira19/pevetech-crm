

## Diagnóstico

A linha branca entre o header e o hero é causada pela regra CSS global `* { @apply border-border; }` em `src/index.css` (linha 54-55). Como o `<nav>` tem `border-b` aplicado condicionalmente quando `scrolled` é true, mas o seletor universal `*` aplica `border-color` a todos os elementos, a navbar pode renderizar uma borda visível mesmo quando não deveria (o `border-b` do estado não-scrolled não está explicitamente removido — o navegador ainda aplica `border-width` padrão em alguns casos).

**Correção**: Na navbar, quando `scrolled` é `false`, adicionar explicitamente `border-b border-transparent` para garantir que nenhuma borda seja visível.

### Alteração

**`src/components/landing/Navbar.tsx`** (linha 28):
- Trocar `"bg-transparent"` por `"bg-transparent border-b border-transparent"` para forçar borda invisível no estado não-scrolled.

