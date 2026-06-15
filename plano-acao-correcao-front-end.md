# Plano de ação — Correção Front-end Kronos

## Fase 0 — Preparação

### Task 0.1 — Confirmar ambiente

```bash
git branch --show-current
git status --short
node --version
npm --version
```

Critério de aceite:

- Branch `feature/lgpd-compliance-new-ui` confirmada.
- Workspace documentado antes de alterar.

### Task 0.2 — Ler auditoria e documentação

Ler:

- `auditoria-front-end.md`
- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/components/PageShell.tsx`
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- `kronos-business/04-mapa-modulos-telas.md`
- demais documentos do `kronos-business` sobre LGPD, rotas, regras e fluxos.

Critério de aceite:

- Backlog FE-AUD-* confirmado.

---

## Fase 1 — Correções P0

### Task 1.1 — Corrigir FE-AUD-001: migrar páginas legadas para PageShell

Arquivos:

- `src/pages/CriarEmpresa.tsx`
- `src/pages/BuscarEmpresa.tsx`
- `src/pages/AtualizarEmpresa.tsx`
- `src/pages/CriarAviso.tsx`
- `src/pages/EnviarDocumentos.tsx`
- `src/pages/CriarManager.tsx`
- `src/pages/NotFound.tsx`

Procedimento:

1. Abrir cada arquivo.
2. Identificar imports diretos de `Header` e `Sidebar`.
3. Substituir por `PageShell` quando rota for autenticada.
4. Preservar estados, submits, services e dialogs.
5. Ajustar classes de layout para mobile/desktop.
6. Para `NotFound`, evitar vazamento de header autenticado para rota pública.

Validação:

```bash
grep -R "import Header" src/pages/CriarEmpresa.tsx src/pages/BuscarEmpresa.tsx src/pages/AtualizarEmpresa.tsx src/pages/CriarAviso.tsx src/pages/EnviarDocumentos.tsx src/pages/CriarManager.tsx src/pages/NotFound.tsx
grep -R "import Sidebar" src/pages/CriarEmpresa.tsx src/pages/BuscarEmpresa.tsx src/pages/AtualizarEmpresa.tsx src/pages/CriarAviso.tsx src/pages/EnviarDocumentos.tsx src/pages/CriarManager.tsx src/pages/NotFound.tsx
```

Critério de aceite:

- Páginas autenticadas usam `PageShell`.
- Nenhuma duplicação de `Header`/`Sidebar`.
- `NotFound` seguro para público e autenticado.

### Task 1.2 — Corrigir FE-AUD-004: restaurar Vitest completo

Procedimento:

1. Rodar teste específico:

```bash
npx vitest run src/test/api-contract-guard.test.ts
```

2. Verificar se o `README.md` do projeto foi sobrescrito por pacote Codex.
3. Restaurar README original ou ajustar expectations somente se o contrato mudou.
4. Rodar suite completa.

Critério de aceite:

- `npx vitest run` sem falha de `api-contract-guard`.

---

## Fase 2 — Correções P1

### Task 2.1 — Corrigir FE-AUD-002: remover código morto

Procedimento:

```bash
grep -R "dashboard-cards-config" -n src || true
grep -R "dashboard-tone-colors" -n src || true
grep -R "dashboardToneColors\|getDashboardCardsLayoutByRole\|dashboardCardStyles" -n src || true
```

Se não houver consumidores:

- remover `src/utils/dashboard-cards-config.ts`;
- remover `src/utils/dashboard-tone-colors.ts`.

Critério de aceite:

- Arquivos removidos ou justificativa documentada.

### Task 2.2 — Corrigir FE-AUD-003: criar testes ausentes

Criar testes para:

- `src/features/vacation-approvals/**/__tests__/*`
- `src/features/time-off-approvals/**/__tests__/*`

Casos mínimos:

- status pendente/aprovado/rejeitado;
- aliases, se existirem;
- cálculo de período e impacto;
- dados incompletos;
- labels exibidos.

Critério de aceite:

- Testes específicos verdes.
- Suite completa verde.

### Task 2.3 — Corrigir FE-AUD-022: dependências

Procedimento:

```bash
npm audit --audit-level=moderate
npm audit fix
npm audit --audit-level=moderate
```

Regras:

- Não usar `--force`.
- Se o fix não resolver tudo, documentar vulnerabilidades remanescentes.

Critério de aceite:

- Vulnerabilidades reduzidas ou remanescentes justificadas.

---

## Fase 3 — Correções P2/P3

### Task 3.1 — Corrigir FE-AUD-006

Arquivo alvo:

- `src/pages/avisos/AvisosPage.tsx`

Procedimento:

- Corrigir dependency array sem gerar loop.
- Preferir desestruturação de callbacks/valores estáveis.

Critério:

- Warning removido do lint.

### Task 3.2 — Corrigir FE-AUD-007

Alvos:

- `src/context/CheckinContext.tsx`
- `src/context/CheckinContextDef.ts`
- consumidores de `useCheckin`.

Procedimento:

- Separar hook do provider, mantendo API pública.
- Atualizar imports.
- Rodar busca por `useCheckin`.

Critério:

- Warning `react-refresh/only-export-components` removido.

### Task 3.3 — Corrigir FE-AUD-005/FE-AUD-023

Procedimento:

- Criar `src/hooks/useResponsiveMode.ts`, se viável.
- Remover leituras diretas de `window.innerWidth` em produção.
- Manter breakpoint e semântica atual.

Critério:

- Sem regressão visual em mobile/desktop.

---

## Fase 4 — Validação final

Executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
npm audit --audit-level=moderate
```

Validar manualmente ou via Playwright:

- Desktop: 1366x768, 1536x864, 1920x1080.
- Mobile: 390x844, 430x932.

---

## Fase 5 — Relatório final

Criar `correção-front-end.md` na raiz do front-end.

O documento deve conter:

- achados corrigidos;
- achados não corrigidos;
- arquivos alterados;
- comandos executados;
- evidências com `arquivo:linha`;
- riscos remanescentes;
- próximos passos.
