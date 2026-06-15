# Plano de ação — Refatoração `/avisos`

## Objetivo

Refatorar a tela de avisos do Kronos para uma central de comunicação interna com experiências distintas para desktop e mobile.

---

## Fase 0 — Preparação

### Task 0.1 — Confirmar branch e workspace

```bash
git status
git branch --show-current
```

Critério:

- front-end na branch `feature/lgpd-compliance-new-ui`;
- sem alterações não rastreadas que possam ser sobrescritas.

### Task 0.2 — Ler referências

Ler:

- `references/docs/kronos_avisos_diretriz_visual.md`
- `references/mockups/kronos_avisos_desktop.png`
- `references/mockups/kronos_avisos_mobile.png`

Critério:

- documentar decisões visuais principais antes de codar.

---

## Fase 1 — Mapeamento técnico

### Task 1.1 — Confirmar rota

Ler:

- `src/config/app-routes.ts`
- `src/App.tsx`

Critério:

- identificar se a rota real é `/avisos` ou `/aviso`;
- se `/avisos` for real, manter `/avisos`;
- se precisar de `/aviso`, criar redirect sem duplicar tela.

### Task 1.2 — Mapear tela atual

Ler:

- `src/pages/Avisos.tsx`
- `src/hooks/useMessages.ts`
- `src/service/message.service.ts`
- `src/types/message.ts`

Critério:

- saber quais estados vêm do hook;
- saber quais ações já existem;
- saber onde há legado visual a remover.

### Task 1.3 — Mapear criação de aviso

Ler:

- `src/pages/CriarAviso.tsx`
- `src/service/message.service.ts`
- `src/types/message.ts`

Critério:

- garantir que `Novo aviso` continue apontando para o fluxo existente.

---

## Fase 2 — Domínio de UI

### Task 2.1 — Criar helpers de prioridade

Criar helpers para:

- label;
- descrição;
- classes visuais;
- ícone;
- contagem por prioridade.

Critério:

- `NORMAL`, `ALERT` e `CRITICAL` com texto explícito.

### Task 2.2 — Criar helpers de permissão

Criar helper:

```ts
canManageNotices(role)
```

Critério:

- `PARTNER` sem ações administrativas;
- `MANAGER` e `CTO` conforme regra real do produto;
- se back-end permitir só `MANAGER`, registrar divergência com diretriz.

### Task 2.3 — Criar filtros client-side

Filtros:

- texto por título/conteúdo;
- prioridade;
- sem resultado;
- limpar filtros.

Critério:

- não alterar query do back-end nesta tarefa.

---

## Fase 3 — Componentização

### Task 3.1 — Criar estrutura local de componentes

Sugestão:

```text
src/pages/avisos/
├── AvisosDesktopView.tsx
├── AvisosMobileView.tsx
├── NoticeHero.tsx
├── NoticeMetrics.tsx
├── NoticeSearchFilters.tsx
├── NoticeCard.tsx
├── NoticeDetailPanel.tsx
├── NoticePermissionFooter.tsx
├── NoticeDeleteDialog.tsx
└── notice-ui.helpers.ts
```

Critério:

- `src/pages/Avisos.tsx` deve virar orquestrador.

### Task 3.2 — Preservar design system

Usar:

- `Button`
- `Card`
- `Badge`
- `Dialog`
- inputs existentes
- `lucide-react`
- Tailwind

Critério:

- não introduzir biblioteca nova.

---

## Fase 4 — Desktop

### Task 4.1 — Implementar shell desktop

Elementos:

- sidebar;
- header;
- hero com métricas;
- grid principal.

Critério:

- experiência semelhante ao mockup desktop.

### Task 4.2 — Implementar lista de avisos

Mostrar:

- prioridade;
- título;
- resumo;
- destinatário;
- data;
- botão ver;
- botão deletar se permitido.

Critério:

- aviso selecionado destacado.

### Task 4.3 — Implementar painel lateral

Mostrar:

- título;
- prioridade;
- destinatário;
- data;
- texto completo;
- regra de permissão por ROLE;
- CTA `Novo aviso`;
- CTA `Deletar aviso` se permitido.

Critério:

- detalhe visível sem dialog no desktop.

---

## Fase 5 — Mobile

### Task 5.1 — Implementar shell mobile

Elementos:

- topo compacto;
- métricas;
- busca;
- chips;
- cards;
- rodapé fixo.

Critério:

- não usar tabela;
- não apenas redimensionar desktop.

### Task 5.2 — Implementar detalhe mobile

Pode ser:

- dialog;
- drawer;
- tela dedicada.

Critério:

- abrir aviso sem perder seleção;
- botões com 44px mínimos;
- `PARTNER` sem ações admin.

---

## Fase 6 — Ações sensíveis

### Task 6.1 — Novo aviso

- Visível apenas quando permitido.
- Navegar para `/criar-aviso`.

Critério:

- não quebrar `CriarAviso`.

### Task 6.2 — Deletar aviso

- Exigir confirmação.
- Texto claro: ação remove aviso para usuários afetados.
- Loading durante exclusão.

Critério:

- sem exclusão direta por clique único.

---

## Fase 7 — Estados

### Task 7.1 — Loading

- Desktop: skeleton de lista e painel.
- Mobile: skeleton de cards.

### Task 7.2 — Erro

- Card com mensagem clara.

### Task 7.3 — Vazio

- `Tudo tranquilo por aqui`.

### Task 7.4 — Sem resultado

- Mensagem de filtro sem resultado.
- Botão `Limpar filtros`.

---

## Fase 8 — Remoção do legado

### Task 8.1 — Remover render antigo

- remover lista antiga de cards genéricos;
- remover dialogs duplicados;
- remover comentários obsoletos.

### Task 8.2 — Limpar imports

- rodar lint;
- remover imports mortos.

---

## Fase 9 — Validação

### Task 9.1 — Build e lint

```bash
npm run lint
npm run build
```

### Task 9.2 — Testes manuais

Validar:

- `PARTNER`;
- `MANAGER`;
- `CTO`;
- busca;
- filtros;
- paginação;
- abrir detalhe;
- criar aviso;
- deletar com confirmação;
- mobile;
- desktop.

### Task 9.3 — Relatório final

Gerar resumo:

- arquivos alterados;
- contratos preservados;
- diferenças desktop/mobile;
- riscos;
- validações executadas.
