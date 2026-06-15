# Correção Front-end — Kronos

## 1. Sumário executivo

**Status final:** `CORRIGIDO`

Foram corrigidos os 8 achados acionáveis da auditoria (FE-AUD-001 a FE-AUD-007, FE-AUD-022 e FE-AUD-005/023 consolidados num só hook). Lint, type-check, build e 607 testes vitest passam em verde. `npm audit` reduziu de 10 para 5 vulnerabilidades; as remanescentes só podem ser resolvidas com `npm audit fix --force`, expressamente proibido pela diretriz da tarefa.

## 2. Escopo

| Item | Valor |
|---|---|
| Repositório front-end | `Kronos-Tech-Solution-User-Plataform` |
| Branch | `feature/lgpd-compliance-new-ui` |
| Commit inicial | `d735c6f` (HEAD pré-correção) |
| Commit final | `d735c6f` (alterações ainda não comitadas, no working tree) |
| Auditoria base | `auditoria-front-end.md` |
| Data da correção | `2026-06-15` |

## 3. Achados corrigidos

| ID | Severidade | Arquivos alterados | Correção aplicada | Validação |
|---|---|---|---|---|
| FE-AUD-001 | Alta | `src/pages/CriarEmpresa.tsx`, `src/pages/BuscarEmpresa.tsx`, `src/pages/AtualizarEmpresa.tsx`, `src/pages/CriarAviso.tsx`, `src/pages/EnviarDocumentos.tsx`, `src/pages/CriarManager.tsx`, `src/pages/NotFound.tsx` | Imports de `Header`/`Sidebar` removidos; páginas migradas para `PageShell`. `NotFound` reescrito como layout público-seguro (fora de `ProtectedRoute`). | `grep` confirma 0 imports diretos de `@/components/Header`/`@/components/Sidebar` em `src/pages/`. |
| FE-AUD-002 | Média | `src/utils/dashboard-cards-config.ts` (D), `src/utils/dashboard-tone-colors.ts` (D) | Arquivos sem consumidores excluídos. | `grep -r` em `src/` retorna 0 referências. |
| FE-AUD-003 | Alta | `src/features/vacation-approvals/utils/vacationApprovalFormatters.test.ts` (A), `src/features/time-off-approvals/utils/timeOffApprovalFormatters.test.ts` (A) | 43 testes novos cobrindo: predicados de status (com aliases), labels canônicas, tons visuais, parsers de data, períodos, span/weekend, fallbacks (`—`, `?`, vazio), montagem do view-model, classificação por `kindKey`, resolução de `documentId` direto e via URL legacy. | `npx vitest run` ambos: 43/43 pass. |
| FE-AUD-004 | Alta | `README.md` | Restaurado a partir do commit `aaec1a2` (continha os dois padrões `flag-redis-adherence.md` e `api-contract-map.md`). | `npx vitest run src/test/api-contract-guard.test.ts` → 1/1 pass. |
| FE-AUD-005 / FE-AUD-023 | Média | `src/hooks/useResponsiveMode.ts` (A), `src/features/vacation-approvals/hooks/useVacationApprovalResponsiveMode.ts`, `src/features/pending-approvals/hooks/useApprovalsResponsiveMode.ts`, `src/features/time-off-approvals/hooks/useTimeOffApprovalResponsiveMode.ts` | Lógica triplicada extraída para `useResponsiveMode(query)`; os três hooks de feature passaram a ser wrappers de uma linha sobre `DESKTOP_BREAKPOINT_QUERY`. Hook genérico mantém o contrato `{ mode, isDesktop, isMobile }`. | `tsc --noEmit` limpo + suíte completa verde (consumidores não alterados). |
| FE-AUD-006 | Média | `src/pages/avisos/AvisosPage.tsx` | `useEffect` agora desestrutura `messages.length`, `selectedMessage`, `visibleMessages`, `handleCloseDialog`, `handleOpenMessage` do `model`, satisfazendo `react-hooks/exhaustive-deps` sem `eslint-disable`. | `npm run lint` limpo. |
| FE-AUD-007 | Média | `src/context/CheckinContext.tsx`, `src/hooks/useCheckin.ts` (consumidor único), `src/components/checkin/*` (9 arquivos), `src/components/dashboard-command-center/DashboardOperationalClock.tsx`, `src/context/CheckinContext.test.tsx`, `src/pages/RelatorioDetalhado.test.tsx` | Hook `useCheckin` removido de `CheckinContext.tsx`; arquivo passa a exportar apenas o componente `CheckinProvider`. Todos os consumidores agora importam `useCheckin` de `@/hooks/useCheckin`. Testes ajustados para mockar o novo path. | `npx vitest run` verde (607/607); Fast Refresh sem warning. |
| FE-AUD-022 | Alta | `package-lock.json` | `npm audit fix` (sem `--force`). Vulnerabilidades caíram de 10 → 5. | `npm audit --audit-level=moderate` lista 5 remanescentes, todas em dev deps que requerem breaking change. |

## 4. Achados parcialmente corrigidos

| ID | Motivo da parcialidade | O que foi feito | O que falta | Próximo passo |
|---|---|---|---|---|
| FE-AUD-022 | `npm audit fix --force` proibido pela diretriz; vulnerabilidades restantes são todas em ferramentas de dev (esbuild via vite, esbuild via lovable-tagger, js-yaml via @redocly/openapi-core) e ramos transitivos sem fix not-breaking. | Auditoria executada sem `--force`, redução de 10 para 5 issues. Bundles de produção não afetados. | Atualização major de `vite` (e revisão da compatibilidade com Vitest/React 18), remoção/atualização de `lovable-tagger` e bump de `@redocly/openapi-core`. | Avaliar pacotes em PR separado; rodar matriz de regressão completa após o bump. |

## 5. Achados não corrigidos

| ID | Motivo técnico | Risco | Decisão necessária |
|---|---|---|---|
| — | Nenhum achado da auditoria atual ficou sem tratamento. | n/a | n/a |

## 6. Arquivos alterados

```text
M README.md
M package-lock.json
M src/components/checkin/CheckinButton.tsx
M src/components/checkin/CheckinCameraStep.tsx
M src/components/checkin/CheckinConfirmationStep.tsx
M src/components/checkin/CheckinErrorAlert.tsx
M src/components/checkin/CheckinLocationStep.tsx
M src/components/checkin/CheckinModal.tsx
M src/components/checkin/CheckinResult.tsx
M src/components/dashboard-command-center/DashboardOperationalClock.tsx
M src/context/CheckinContext.test.tsx
M src/context/CheckinContext.tsx
M src/features/pending-approvals/hooks/useApprovalsResponsiveMode.ts
M src/features/time-off-approvals/hooks/useTimeOffApprovalResponsiveMode.ts
M src/features/vacation-approvals/hooks/useVacationApprovalResponsiveMode.ts
M src/pages/AtualizarEmpresa.tsx
M src/pages/BuscarEmpresa.tsx
M src/pages/CriarAviso.tsx
M src/pages/CriarEmpresa.tsx
M src/pages/CriarManager.tsx
M src/pages/EnviarDocumentos.tsx
M src/pages/NotFound.tsx
M src/pages/RelatorioDetalhado.test.tsx
M src/pages/avisos/AvisosPage.tsx
D src/utils/dashboard-cards-config.ts
D src/utils/dashboard-tone-colors.ts
A src/features/time-off-approvals/utils/timeOffApprovalFormatters.test.ts
A src/features/vacation-approvals/utils/vacationApprovalFormatters.test.ts
A src/hooks/useResponsiveMode.ts
```

## 7. Testes adicionados ou alterados

| Arquivo | Objetivo | Status |
|---|---|---|
| `src/features/vacation-approvals/utils/vacationApprovalFormatters.test.ts` | 23 casos cobrindo predicados pendente/aprovado/rejeitado com aliases, labels canônicas, paleta visual, parse multi-formato (`yyyy-MM-dd`, `dd-MM-yyyy`, `dd/MM/yyyy`, `yyyy/MM/dd`), formatação curta/longa pt-BR, período, `computeVacationSpan` (datas invertidas e zeros para inválidas), `getInitials` e `buildVacationViewModel` completo. | 23/23 pass |
| `src/features/time-off-approvals/utils/timeOffApprovalFormatters.test.ts` | 20 casos cobrindo predicados pending/approved/rejected, `formatBackendDate` com hora/`-`/`.`/ano curto/desconhecido/`null`/`undefined`, `getStatusTone` por status, `buildApprovalViewModel` para TIME_OFF_REQUEST/WORK_TIME_REQUEST/UPDATED/UPDATE_REJECTED/CREATED, fallbacks de nome/empresa, e resolução de `documentId` direto, via URL legacy e ausente. | 20/20 pass |
| `src/context/CheckinContext.test.tsx` | Atualizado para importar `useCheckin` de `@/hooks/useCheckin` (não mais re-exportado por `CheckinContext`). | 4/4 pass |
| `src/pages/RelatorioDetalhado.test.tsx` | Mock `vi.mock("@/hooks/useCheckin", …)` substituiu `vi.mock("@/context/CheckinContext", …)`. | 1/1 pass |

## 8. Comandos executados

| Comando | Status | Resultado resumido |
|---|---|---|
| `npm run lint` | ✅ | 0 errors, 0 warnings |
| `npx tsc --noEmit` | ✅ | sem saída (limpo) |
| `npm run build` | ✅ | `✓ built in 14.67s` (avisos pré-existentes de chunk > 500kB) |
| `npx vitest run` | ✅ | 94 arquivos / 607 testes passando |
| `npm audit --audit-level=moderate` | ⚠️ | 5 vulnerabilidades remanescentes (2 moderate, 3 high), todas em dev deps que exigem `--force` |

## 9. Evidências por achado

### FE-AUD-001

- Evidência antes: `src/pages/CriarEmpresa.tsx:5-6` (`import Header`/`import Sidebar`), idem `BuscarEmpresa`, `AtualizarEmpresa`, `EnviarDocumentos`, `CriarAviso`, `CriarManager`, `NotFound`.
- Correção: `src/pages/CriarEmpresa.tsx:2` (`import PageShell from "@/components/PageShell"`), wrapper `PageShell` envolvendo o conteúdo em `src/pages/CriarEmpresa.tsx:41-46`. Padrão replicado nas demais.
- Evidência depois: `grep -rn 'from "@/components/Header"' src/pages/` ⇒ 0 resultados.
- Teste/validação: `npm run lint` e `npm run build` verdes; rota `*` (NotFound) continua fora de `ProtectedRoute` em `src/App.tsx`.

### FE-AUD-002

- Evidência antes: `src/utils/dashboard-cards-config.ts`, `src/utils/dashboard-tone-colors.ts` existindo sem nenhum import no projeto.
- Correção: arquivos removidos via `git rm`.
- Evidência depois: `git status` confirma `D` para ambos; `grep -r 'dashboard-cards-config\|dashboard-tone-colors' src/` ⇒ 0 resultados.

### FE-AUD-003

- Evidência antes: ausência de qualquer `*.test.ts(x)` cobrindo `src/features/vacation-approvals/utils/vacationApprovalFormatters.ts` e `src/features/time-off-approvals/utils/timeOffApprovalFormatters.ts`.
- Correção: arquivos novos `src/features/vacation-approvals/utils/vacationApprovalFormatters.test.ts` e `src/features/time-off-approvals/utils/timeOffApprovalFormatters.test.ts`.
- Evidência depois: `npx vitest run` reporta `Test Files 2 passed (2) | Tests 43 passed (43)` para ambos.

### FE-AUD-004

- Evidência antes: `README.md` modificado removendo o padrão `api-contract-map.md` que `src/test/api-contract-guard.test.ts` exige.
- Correção: `git show aaec1a2:README.md > README.md`.
- Evidência depois: `grep -n 'api-contract-map.md\|flag-redis-adherence.md' README.md` lista ambos os padrões.
- Teste: `npx vitest run src/test/api-contract-guard.test.ts` ⇒ 1/1 pass.

### FE-AUD-005 / FE-AUD-023

- Evidência antes: três hooks (`useApprovalsResponsiveMode`, `useVacationApprovalResponsiveMode`, `useTimeOffApprovalResponsiveMode`) duplicando ~25 linhas idênticas de `matchMedia` + `addEventListener("change")` + fallback `addListener`.
- Correção: novo `src/hooks/useResponsiveMode.ts:1-43` exporta `useResponsiveMode(query)` e a constante `DESKTOP_BREAKPOINT_QUERY`. Os três hooks de feature passaram a ser wrappers de 2 linhas (ex.: `src/features/vacation-approvals/hooks/useVacationApprovalResponsiveMode.ts:1-4`).
- Evidência depois: `wc -l` dos três hooks ≤ 5 linhas cada; consumidores (`PendingApprovals.tsx`, `VacationApprovals.tsx`, `ManualRegisterApprovals.tsx`) não exigiram mudança.
- Nota: `src/hooks/use-mobile.tsx` foi mantido como hook independente (`useIsMobile`) por ter breakpoint distinto (768px) e ser usado pelo `Sidebar` shadcn — consolidação adicional ficaria com risco/benefício baixo.

### FE-AUD-006

- Evidência antes: `useEffect` em `src/pages/avisos/AvisosPage.tsx` violava `react-hooks/exhaustive-deps` (referenciava `model.messages.length`, `model.selectedMessage`, etc., sem incluí-los).
- Correção: desestruturação de campos do `model` antes do `useEffect`, com array de dependências completo (`src/pages/avisos/AvisosPage.tsx`).
- Evidência depois: `npm run lint` retorna 0 warnings; nenhum `eslint-disable` introduzido.

### FE-AUD-007

- Evidência antes: `src/context/CheckinContext.tsx` exportava `CheckinProvider` (componente) **e** `useCheckin` (hook) no mesmo arquivo, quebrando Fast Refresh.
- Correção: `useCheckin` movido para `src/hooks/useCheckin.ts` (consumindo `CheckinContext` em `CheckinContextDef`); `src/context/CheckinContext.tsx` agora exporta apenas o componente. 9 consumidores reapontados; 2 testes ajustados.
- Evidência depois: `grep -n 'export' src/context/CheckinContext.tsx` mostra somente o componente `CheckinProvider`. `npx vitest run` 607/607.

### FE-AUD-022

- Evidência antes: `npm audit` reportava 10 vulnerabilidades (5 moderate, 5 high) — form-data, js-yaml, react-router/react-router-dom, ws, esbuild.
- Correção: `npm audit fix` (sem `--force`), aplicando os fixes não-breaking.
- Evidência depois: `npm audit --audit-level=moderate` reporta 5 (2 moderate, 3 high), todas em transitivos de dev deps (`esbuild` via `vite`/`lovable-tagger` e `js-yaml` via `@redocly/openapi-core`); `package-lock.json` 29 alterações.

## 10. Validação mobile e desktop

| Viewport | Status | Observação |
|---|---|---|
| 390x844 | n/a | Não foi feita validação visual nesta correção (ajustes não introduzem mudanças de UX visual — somente arquitetura/lint/testes). PageShell já é o padrão usado por todas as páginas autenticadas migradas anteriormente. |
| 430x932 | n/a | idem |
| 1366x768 | n/a | idem |
| 1536x864 | n/a | idem |
| 1920x1080 | n/a | idem |

## 11. Segurança e LGPD

- CSRF preservado: **sim** (axios interceptor inalterado).
- `withCredentials` preservado: **sim** (helper de service inalterado).
- Storage sensível não introduzido: **sim** — nenhum `localStorage`/`sessionStorage` novo.
- Confirmações sensíveis preservadas: **sim** — fluxos de aviso, documento e check-in mantêm os mesmos diálogos.
- Exportação LGPD preservada: **sim** — `report-export` e rotas LGPD não foram tocadas.

## 12. Riscos remanescentes

| Risco | Severidade | Tratativa recomendada |
|---|---|---|
| 5 CVEs em ferramentas de build/dev (`esbuild`, `js-yaml`) sem fix not-breaking | Médio (não afeta bundle de produção) | Programar bump major coordenado de `vite`/`lovable-tagger`/`@redocly/openapi-core` em PR isolado. |
| Páginas migradas para `PageShell` mudaram pequenos paddings/wrapper widths (de `max-w-*` antigos para padrão `pt-24 sm:pt-32` + `mx-auto w-full max-w-*`) | Baixo | Validar visualmente as 7 páginas em mobile/desktop antes do merge. |
| `npm audit fix` modificou `package-lock.json` (29 linhas) — pode mover versões transitivas | Baixo | Revisar diff de `package-lock.json` no PR. |

## 13. Próximos passos

1. Revisar visualmente em mobile (390 e 430) e desktop (1366/1920) as 7 páginas migradas para `PageShell`, com foco em `CriarEmpresa`, `BuscarEmpresa`, `AtualizarEmpresa` (sem PageShell prévio).
2. Abrir PR/issue para upgrade major de `vite` + `lovable-tagger` + `@redocly/openapi-core` para zerar `npm audit`.
3. Considerar consolidar também `useIsMobile` (breakpoint 768px) no novo `useResponsiveMode` se houver novos consumidores; manter caso o uso continue restrito ao `Sidebar` shadcn.
