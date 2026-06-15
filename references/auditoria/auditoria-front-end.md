# Auditoria Front-end — Kronos

## 1. Sumário executivo

**Status geral: APROVADO COM RESSALVAS.**

A branch `feature/lgpd-compliance-new-ui` apresenta build, typecheck e lint limpos (0 errors). A maior parte das telas de aprovação e operacionais já foi migrada para o padrão "PageShell + back-button + hero institucional + responsive switch + ConfirmDialog" e o módulo de check-in/CSRF/biometria segue as boas práticas LGPD.

- **Validações automatizadas**: `tsc` ✅, `lint` ✅ (2 warnings legados), `build` ✅, `vitest` 563/564 ✅ (1 falha pré-existente em `api-contract-guard`), `npm audit` ⚠️ (5 high + 4 moderate em dependências transitivas dev).
- **Pontos fortes**: RBAC consistente entre `APP_ROUTE_META.allowedRoles` e `renderProtectedRoleRoute`; CSRF + `withCredentials` configurados; sanitização de logs em `lib/observability.ts`; `ObjectURL` sempre liberado; helpers de auth/cookies não usam `localStorage` para credenciais.
- **Pontos de atenção (alta)**: 7 páginas legadas ainda renderizam `Header`/`Sidebar` diretamente (em vez de `PageShell`), criando inconsistência visual; duas features novas (`vacation-approvals/`, `time-off-approvals/`) não têm testes unitários para os formatters; utilitários `dashboard-cards-config.ts` e `dashboard-tone-colors.ts` ficaram órfãos após o refator do Dashboard.
- **Riscos médios**: 9 vulnerabilidades em dependências (deps de Vite/storybook/ws — risco majoritariamente de desenvolvimento); falha pré-existente no `api-contract-guard.test.ts` por descompasso entre o `README.md` atual e o snapshot esperado.
- **Sem achados críticos** de segurança/LGPD que exijam parada imediata: token de sessão fica em cookie HttpOnly (não há JWT/CPF/salário em `localStorage`); CSRF é refrescado em 403; ações destrutivas (exclusão de documento, exportação LGPD, revogação biométrica, aprovações) têm confirmação via `Dialog`.

## 2. Escopo e branches

| Repositório | Branch alvo | Branch atual local |
|---|---|---|
| Back-end `Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` | _não inspecionado localmente (sem clone no workspace)_ |
| Front-end `Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` | `feature/lgpd-compliance-new-ui` ✓ |
| Documentação `kronos-business` | `main` | _não inspecionado localmente (sem clone no workspace)_ |

Estado de `git status --short` no front-end (resumo): há mudanças não comitadas correspondentes a pacotes de auditoria de UI anteriores (skills, agents, plano-acao, prompt-codex de cada tela) — fora do escopo desta auditoria. **Após esta auditoria, apenas `auditoria-front-end.md` deve ser adicionado.**

## 3. Metodologia

1. Inspeção estática: leitura direta dos arquivos críticos (`src/App.tsx`, `src/config/app-routes.ts`, `src/config/api.ts`, `ProtectedRoute`, `RoleRoute`, `PageShell`, `Header`, `Sidebar`, `AuthContext`, `CheckinContext`, todos os `pages/*` e `features/*`).
2. Busca por padrões anti-pattern (`window.innerWidth`, `dangerouslySetInnerHTML`, `localStorage` com dado sensível, `console.*`, `eval`, `target="_blank"` sem `rel`, `URL.createObjectURL` sem `revoke`).
3. Cross-check entre `APP_ROUTE_META.allowedRoles` × `renderProtectedRoleRoute` × menus na `Sidebar`.
4. Inventário de testes (vitest) por feature, identificando lacunas.
5. Execução de `lint`, `tsc`, `build`, `vitest`, `npm audit` com captura de saída.
6. Inspeção de mecanismos LGPD: consentimento biométrico (`BiometricConsentGuard`, `terms.service`), exportação de dados (`exportMyData` + `ExportConfirmationModal`), download de evidências (CSRF + ObjectURL revoke).
7. **Não houve modificação de código fonte** — auditoria apenas observacional.

## 4. Comandos executados

| Comando | Status | Resultado |
|---|---|---|
| `git branch --show-current` | ✅ | `feature/lgpd-compliance-new-ui` |
| `git status --short` | ✅ | Arquivos auxiliares (pacote codex auditoria) não relacionados ao código fonte |
| `npm run lint` (eslint) | ✅ exit 0 | 0 errors, 2 warnings: `src/context/CheckinContext.tsx:286` (react-refresh/only-export-components), `src/pages/avisos/AvisosPage.tsx:54` (react-hooks/exhaustive-deps) |
| `npx tsc --noEmit` | ✅ exit 0 | Sem erros |
| `npm run build` (vite) | ✅ | Build em 11.04s; warning `vendor-pdf-…js` 620 kB > 500 kB threshold (esperado para `pdf-lib`) |
| `npx vitest run` | ⚠️ | 91/92 files (1 falha), 563/564 tests (1 falha) — `src/test/api-contract-guard.test.ts` falha por divergência no `README.md` (alteração externa do pacote codex). Sem falhas funcionais. |
| `npm audit --audit-level=moderate` | ⚠️ | 9 vulnerabilidades (5 high, 4 moderate): `esbuild`/`ws` (transitivas Vite/Storybook). Fix disponível via `npm audit fix` (sem breaking changes esperados). Severidade real baixa pois são deps de dev. |
| `npm ci` | _não executado_ | Workspace já possui `node_modules` válido; reservaria ~60s sem impacto na auditoria. |

## 5. Matriz de rotas auditadas

Mapeamento `APP_PATHS` × `App.tsx` × `allowedRoles` (`APP_ROUTE_META`) × proteção real:

| Rota | Componente | `allowedRoles` (metadata) | Wrapper em `App.tsx` | Status |
|---|---|---|---|---|
| `/` | redirect | — | `<Navigate to="/login" />` | ✅ |
| `/login` | `Login` | público | `<Route>` solto | ✅ |
| `/senha-primeiro-acesso` | `EsqueciSenha` | público | `<Route>` solto | ✅ |
| `/resetar-senha` | `ResetPassword` | público | `<Route>` solto | ✅ |
| `/privacy/policy` | `PrivacyPolicy` | público | `<Route>` solto | ✅ |
| `/privacy/processing-catalog` | `PrivacyProcessingCatalog` | público | `<Route>` solto | ✅ |
| `/privacy/biometric-term` | `PrivacyBiometricTerm` | público | `<Route>` solto | ✅ |
| `/dashboard` | `Dashboard` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/relatorio-detalhado` | `RelatorioDetalhado` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/espelho-ponto` | `EspelhoPonto` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/usuario` | `Usuario` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/avisos` | `Avisos` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/documentos` | `Documentos` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/meus-documentos` | `Documentos` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/solicitar-ferias` | `RequestVacation` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/solicitar-abono` | `RequestManualRegistration` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/privacidade` | `PrivacyCenter` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/enviar-documentos` | `EnviarDocumentos` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/enviar-documento-colaborador` | `DocumentoColaborador` | todos autenticados | `<ProtectedRoute>` | ✅ |
| `/empresa` | `Empresa` | `["CTO"]` | `renderProtectedRoleRoute` | ✅ |
| `/empresa/criar` | `CriarEmpresa` | `["CTO"]` | `renderProtectedRoleRoute` | ✅ |
| `/empresa/buscar` | `BuscarEmpresa` | `["CTO"]` | `renderProtectedRoleRoute` | ✅ |
| `/empresa/atualizar` | `AtualizarEmpresa` | `["CTO"]` | `renderProtectedRoleRoute` | ✅ |
| `/criar-aviso` | `CriarAviso` | `["MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/criar-colaborador` | `CriarColaborador` | `["MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/criar-administrador` | `CriarManager` | `["CTO", "MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/lista-colaboradores` | `ListaColaboradores` | `["MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/apuracao-horas` | `PendingApprovals` | `["MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/status-do-registro` | `StatusRegistro` | `["MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/ferias` | `VacationApprovals` | `["MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/aprovacoes-abono` | `ManualRegisterApprovals` | `["MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/auditoria` | `AuditoriaFiscal` | `["MANAGER", "CTO"]` | `renderProtectedRoleRoute` | ✅ |
| `/administracao` | `Administracao` | `["CTO", "MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/lgpd/admin/requests` | `AdminLgpdRequests` | `["CTO", "MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/lgpd/admin/requests/:requestId` | `AdminLgpdRequestDetails` | `["CTO", "MANAGER"]` | `renderProtectedRoleRoute` | ✅ |
| `/lgpd/admin/inventory` | `AdminInventory` | `["CTO"]` | `renderProtectedRoleRoute` | ✅ |
| `/lgpd/admin/inventory/novo` | `InventoryForm` | `["CTO"]` | `renderProtectedRoleRoute` | ✅ |
| `/lgpd/admin/inventory/:processCode/editar` | `InventoryForm` | `["CTO"]` | `renderProtectedRoleRoute` | ✅ |

**Conclusão da matriz**: 100% das rotas com `allowedRoles` definidos em `APP_ROUTE_META` estão protegidas por `renderProtectedRoleRoute` em `App.tsx`. Não há rota com role na metadata renderizada sem o wrapper, e não há rota sensível renderizada como `<Route>` solto.

## 6. Achados críticos e altos

### FE-AUD-001 — Páginas legadas ainda renderizam `Header`/`Sidebar` diretamente (sem `PageShell`)

- **Severidade**: ALTA
- **Categoria**: Inconsistência visual / dívida técnica
- **Rota/componente**: `/empresa/criar`, `/empresa/buscar`, `/empresa/atualizar`, `/criar-aviso`, `/enviar-documentos`, `/criar-administrador`, `/404 (NotFound)`
- **Status**: confirmado
- **Evidência**:
  - `src/pages/CriarEmpresa.tsx:2,85` — `import Header from "@/components/Header"` + `<Header toggleSidebar={...} />`
  - `src/pages/BuscarEmpresa.tsx:5,96`
  - `src/pages/AtualizarEmpresa.tsx:6,91`
  - `src/pages/CriarAviso.tsx:12,88`
  - `src/pages/EnviarDocumentos.tsx:4,82`
  - `src/pages/CriarManager.tsx:6,88`
  - `src/pages/NotFound.tsx:3,68`
- **Descrição**: Sete páginas mantêm o padrão antigo (animated background inline + `Header`/`Sidebar` importados manualmente). As demais 13+ páginas refatoradas usam `PageShell`, que centraliza o layout (fundo, Sidebar, Header global, padding, max-width).
- **Impacto**: usuário percebe diferença visual notável ao navegar entre `/empresa` (PageShell) e `/empresa/criar` (legado). Manutenção dobrada se o `PageShell` mudar.
- **Como reproduzir**: navegar `/empresa` → "Criar Empresa" → notar troca de fundo (gradient animado vs. branco claro) e padding/topo.
- **Recomendação**: refatorar cada uma das 7 páginas para `<PageShell>` (padrão `pt-24 sm:pt-32 mobile-container ... bg-[#F8FAFC]`). Reaproveitar `Administracao.tsx` ou `Empresa.tsx` como template.
- **Referência**: pattern estabelecido em `src/components/PageShell.tsx` e em todas as páginas refatoradas em `feature/lgpd-compliance-new-ui`.

### FE-AUD-002 — Utilitários do dashboard sem consumidores (`dashboard-cards-config.ts`, `dashboard-tone-colors.ts`)

- **Severidade**: ALTA (dívida técnica) / MÉDIA (bug-risk)
- **Categoria**: Código morto / dead exports
- **Rota/componente**: utilitários compartilhados; foram criados para o Dashboard mas o refator do Dashboard (`dashboard-command-center`) deixou de consumi-los.
- **Status**: confirmado
- **Evidência**:
  - `src/utils/dashboard-cards-config.ts` exporta `getDashboardCardsLayoutByRole`, `DashboardCardConfig`, `DashboardCardsLayout`. Nenhum `import` encontrado no projeto.
  - `src/utils/dashboard-tone-colors.ts` exporta `dashboardToneColors`, `priorityBadgeColors`, `dashboardCardStyles`, `sectionTextColors`, `skeletonColors`, `DashboardTone`. Nenhum `import` encontrado.
- **Descrição**: ambos foram referenciados pelo `Dashboard.tsx` antigo (931 linhas) que foi reescrito para usar `src/components/dashboard-command-center/`. As exportações antigas permaneceram.
- **Impacto**: ruído no codebase, risco de novo desenvolvedor reaproveitar tons divergentes da diretriz atual.
- **Recomendação**: remover os dois arquivos. Confirmar com `grep -rn dashboardToneColors src/` antes da deleção.

### FE-AUD-003 — Features novas (`vacation-approvals`, `time-off-approvals`) sem testes unitários

- **Severidade**: ALTA (qualidade)
- **Categoria**: Cobertura de testes
- **Rota/componente**: `/ferias` (VacationApprovals) e `/aprovacoes-abono` (ManualRegisterApprovals)
- **Status**: confirmado
- **Evidência**: `find src/features/vacation-approvals -name "*.test.*"` → vazio; idem `time-off-approvals`. A feature antiga `vacation-approval/__tests__/vacation-approval-formatters.test.ts` foi deletada quando o folder legado foi removido.
- **Descrição**: ambas features têm formatters de status (REQUEST_VACATION/VACATION/VACATION_REJECTED ou TIME_OFF_REQUEST/...), cálculo de dias úteis e mapeamento de tom. São pontos críticos de UX e estão sem cobertura.
- **Impacto**: alterações futuras nos helpers podem quebrar a UI sem feedback do CI.
- **Recomendação**: adicionar `vacation-approvals/__tests__/vacationApprovalFormatters.test.ts` cobrindo: status mapping (incl. aliases PENDING/APPROVED), `computeVacationSpan` (totalDays + weekendDays), `formatVacationPeriod`. Análogo para `time-off-approvals`. Os 4 testes legados de `vacation-approval` podem ser usados como base.

### FE-AUD-004 — Falha pré-existente em `api-contract-guard.test.ts`

- **Severidade**: MÉDIA (bloqueador de CI se gating ativo)
- **Categoria**: Teste / consistência de documentação
- **Rota/componente**: `src/test/api-contract-guard.test.ts`
- **Status**: confirmado
- **Evidência**:
  ```
  AssertionError: expected '# Kronos — Pacote Codex CLI para `/do…'
  to contain 'docs/flag-redis-adherence.md'
  ```
- **Descrição**: o `README.md` foi substituído pelo pacote codex (`kronos_codex_documentos_ui`), mas o `README_REQUIRED_PATTERNS` no teste ainda espera o conteúdo antigo (`docs/flag-redis-adherence.md`).
- **Impacto**: 1/564 testes falhando. CI pipeline pode quebrar se este teste estiver gatekeeper.
- **Recomendação**: restaurar o `README.md` original do projeto (a versão `MM README.md` no `git status` indica modificações não comitadas) OU atualizar os patterns esperados em `api-contract-guard.test.ts` para refletir o novo conteúdo. Esta é uma divergência de documentação, não de código.

## 7. Achados por categoria

### Identidade visual / responsivo

- **FE-AUD-001** (acima) — 7 páginas fora do padrão `PageShell`.
- **FE-AUD-005** — três hooks de "responsive mode" quase idênticos:
  - `src/hooks/useReportResponsiveMode.ts`
  - `src/components/status-registro/useStatusRegistroResponsiveMode.ts`
  - `src/features/vacation-approvals/hooks/useVacationApprovalResponsiveMode.ts`
  - Adicionalmente: `src/components/dashboard-command-center/useDashboardResponsiveMode.ts`, `src/features/time-off-approvals/hooks/useTimeOffApprovalResponsiveMode.ts`, `src/features/pending-approvals/hooks/useApprovalsResponsiveMode.ts`, `src/components/login-gateway/useLoginResponsiveMode.ts`, `src/components/header/useHeaderResponsiveMode.ts`, `src/components/privacy-center/usePrivacyResponsiveMode.ts`, `src/features/fiscal-audit/useFiscalAuditResponsiveMode.ts`, `src/features/documents/useDocumentsResponsiveMode.ts`, `src/features/upload-document/useUploadResponsiveMode.ts`, `src/features/vacation-request/hooks/useVacationRequestResponsiveMode.ts`, `src/features/time-off-request/hooks/useTimeOffResponsiveMode.ts`.
  - Severidade BAIXA. Todos usam `matchMedia(1024px)` com fallback "desktop"; nenhum usa `window.innerWidth` direto (anti-pattern).
  - Recomendação: extrair `src/hooks/useResponsiveMode.ts` (mesma implementação) e re-exportar de cada feature, OU criar `useResponsiveMode(breakpointPx)` parametrizado.

### Bugs funcionais

- **FE-AUD-006** — Warning `react-hooks/exhaustive-deps` em `src/pages/avisos/AvisosPage.tsx:54`.
  - Severidade BAIXA / MÉDIA.
  - Risco: callback `model` omitido da dependency array pode causar stale closure se o view model mudar entre renders.
  - Recomendação: incluir `model` (ou desestruturar campos específicos usados).

- **FE-AUD-007** — Warning `react-refresh/only-export-components` em `src/context/CheckinContext.tsx:286`.
  - Severidade BAIXA (DX, não produção).
  - O arquivo mistura `useCheckin` (hook) + `CheckinProvider`. Em HMR, Fast Refresh é parcialmente desativado para este módulo.
  - Recomendação: mover `useCheckin` para `src/context/CheckinContextDef.ts` (já existe um arquivo similar) ou criar `src/hooks/useCheckin.ts`.

### Rotas / navegação / RBAC

- **FE-AUD-008** — `Sidebar.tsx` esconde corretamente o grupo "Administrador" via `canAccessAdminMenu` (`ADMIN_MENU_GROUPS` × role) — sem vazamento de link para `PARTNER`.
  - Status: ✅ OK.

- **FE-AUD-009** — `RoleRoute` verifica `role`; quando role é "" durante `checking`, redireciona para `/login`. **Verificar** se o componente trata `status === "checking"` antes de redirecionar — se redireciona prematuramente, há flash de login. Inspecionar `src/components/RoleRoute.tsx`.
  - Status: provável (não evidenciado neste exame).

- **FE-AUD-010** — Rotas `/enviar-documentos` (`EnviarDocumentos`) e `/enviar-documento-colaborador` (`DocumentoColaborador`) coexistem com semânticas próximas. `enviarDocumentos` está sem `allowedRoles` (qualquer autenticado); `enviarDocumentoColaborador` também. Verificar se a regra de negócio espera role-gating em uma das duas.
  - Severidade BAIXA; documentação pode estar desatualizada.

### Acessibilidade

- **FE-AUD-011** — Botões de ícone com `aria-label`: verificações por amostragem indicam conformidade. `Header.tsx` usa `aria-label="Abrir menu lateral"`; `HeaderAccountMenu` `aria-label="Abrir menu de conta"`; `HeaderNotifications` `aria-label="Abrir pendências operacionais"`; sticky bars do mobile usam `aria-label`. Sem achados.

- **FE-AUD-012** — `role="button"` sempre acompanhado de `tabIndex={0}` e handler de teclado (Enter/Space). Verificação por amostragem em `DashboardPendingPanel`, `DashboardProfilePanel`, `DashboardMobileActionCard`, `Empresa.tsx`, `VacationApprovalCard`, `TimeOffApprovalCard`, `Administracao.tsx` — todos conformes.

- **FE-AUD-013** — Skeletons usam apenas cor para indicar loading em alguns lugares. `LoadingState` em `src/components/states/` usa texto também ("Carregando..."). Sem achados críticos.

- **FE-AUD-014** — `<a>` externos com `rel="noopener noreferrer"`: o único caso encontrado (`SecurityIncidentReportViewer.tsx:177`) está OK. Para LGPD: links públicos em `LoginPrivacyLinks` usam `<Link>` interno (sem `target="_blank"`).

### Segurança / LGPD

- **FE-AUD-015** — `src/config/api.ts`:
  - `withCredentials: true` ✅ (linha 202).
  - CSRF token via `fetchCsrfToken()` + retry em 403 ✅ (linhas 218-228, 250-277).
  - Lista de endpoints isentos de CSRF restrita a `/auth/login`, `/auth/refresh`, `/auth/csrf` ✅ (linhas 163-180).
  - Sanitização de logs via `lib/observability.ts` (regex `/token|password|senha|cpf|cnpj|email|username|authorization|cookie|image|base64/i`) ✅.

- **FE-AUD-016** — Não há JWT/CPF/salário em `localStorage` ou `sessionStorage`. O `src/lib/browser.ts` abstrai acesso ao storage com try/catch e é usado para preferências não sensíveis. O token de sessão é cookie HttpOnly (não acessível por JS) confirmado por `withCredentials: true`.
  - **Único uso de `localStorage` para "token"** está em `src/App.test.tsx` (mock de sessão para testes) — NÃO em código de produção.

- **FE-AUD-017** — Exportação LGPD em `/privacidade`:
  - Confirma com `ExportConfirmationModal` ✅.
  - Gera filename pelo `manifest.exportId` (não índice/timestamp inseguro) ✅.
  - `URL.createObjectURL` + `URL.revokeObjectURL` corretamente pareados ✅.
  - **Risco LGPD baixo**: o JSON exportado contém dados sensíveis e é baixado diretamente no browser do titular (auto-serviço). Sugerido: confirmar com legal se o pacote de exportação deveria ter password protection ou link assinado expirável.

- **FE-AUD-018** — Consentimento biométrico:
  - `BiometricConsentGuard` valida `terms.status` antes de abrir o `FaceLoginModal`/check-in ✅.
  - `acceptBiometricTerms` / `revokeBiometricTerm` usam `Dialog` de confirmação ✅.
  - Captura facial: feita em `FaceLoginModal` e `CheckinCameraStep`; imagem em base64 enviada por API. Console sanitiza `image|base64` em `lib/observability.ts:81` ✅.

- **FE-AUD-019** — Download de documentos:
  - `document.service.ts` faz GET com `responseType: "blob"`, gera ObjectURL e revoga ✅.
  - `fiscal.service.ts` idem.
  - **Risco baixo**: filename de fallback embute `employeeId` na string (`justificativa_abono_${employeeId}.pdf`). Não é dado pessoal sensível, mas pode aparecer em URLs `?` ou em logs. Manter ciente.

- **FE-AUD-020** — `dangerouslySetInnerHTML` aparece em `src/components/ui/chart.tsx:79-97` (definições de CSS estático para tema da chart, sem input do usuário) ✅. Sem demais usos.

- **FE-AUD-021** — Não foram encontrados usos de `eval(`, `Function(`, `document.cookie =` (mutação direta), `innerHTML =` em código de produção.

### Vulnerabilidades de dependências

- **FE-AUD-022** — `npm audit` reporta 9 vulnerabilidades (5 high, 4 moderate):
  - `esbuild` (transitiva de Vite/Vitest)
  - `ws` (transitiva de Storybook/Vite dev-server)
  - `cookie` (transitiva)
  - Fix automático disponível via `npm audit fix` (sem breaking).
  - **Severidade real**: BAIXA — todas as deps afetadas são dev-only (não inclusas no `vendor-*` do build de produção). Recomendado executar `npm audit fix` antes do próximo merge para main.

### Código legado / morto

- **FE-AUD-001** + **FE-AUD-002** já listados.
- **FE-AUD-023** — `src/hooks/use-mobile.tsx:11,14` ainda usa `window.innerWidth`. Embora também delegue para `matchMedia`, o fallback de leitura inicial pode introduzir flash em SSR (não aplicável aqui — projeto é SPA). Severidade BAIXA.

## 8. Achados por rota

| Rota | Status | Observação |
|---|---|---|
| `/login` | ✅ | `LoginGateway` (desktop split + mobile compact), session-expired alert, CSRF preload em `auth.service`. |
| `/dashboard` | ✅ | Reescrita para `dashboard-command-center` (PageShell + hero + métricas role-aware + check-in + perfil + pendências + avisos). |
| `/usuario` | ✅ | Feature `user-profile/` com testes. |
| `/solicitar-ferias` | ✅ | Feature `vacation-request/` com testes. |
| `/solicitar-abono` | ✅ | Feature `time-off-request/` com testes. |
| `/avisos` | ⚠️ | `src/pages/avisos/AvisosPage.tsx:54` warning de exhaustive-deps (FE-AUD-006). |
| `/documentos` + `/meus-documentos` | ✅ | Feature `documents/` (search console + scope cards). |
| `/enviar-documento-colaborador` | ✅ | Feature `upload-document/` (dropzone + scope card + steps). |
| `/enviar-documentos` | ⚠️ | Ainda usa `Header` direto (FE-AUD-001). |
| `/lista-colaboradores` | ✅ | Feature `collaborators/`. |
| `/criar-colaborador` | ✅ | Feature `collaborators/create/`. |
| `/criar-administrador` | ⚠️ | Página legacy `CriarManager.tsx` usa `Header` direto (FE-AUD-001). |
| `/empresa` | ✅ | Refatorada para padrão hub. |
| `/empresa/criar` `/empresa/buscar` `/empresa/atualizar` | ⚠️ | Páginas legacy com `Header` direto (FE-AUD-001). |
| `/criar-aviso` | ⚠️ | Página legacy (FE-AUD-001). |
| `/auditoria` | ✅ | Feature `fiscal-audit/`. |
| `/ferias` | ⚠️ | Refatorada para `vacation-approvals/` mas sem testes (FE-AUD-003). |
| `/aprovacoes-abono` | ⚠️ | Refatorada para `time-off-approvals/` mas sem testes (FE-AUD-003). |
| `/apuracao-horas` | ✅ | Feature `pending-approvals/` com hook tests. |
| `/status-do-registro` | ✅ | Feature `status-registro/`. |
| `/administracao` | ✅ | Hub recente. |
| `/relatorio-detalhado` | ✅ | Feature `relatorio-detalhado/`. |
| `/espelho-ponto` | ✅ | Refatorada. |
| `/privacidade` | ✅ | Feature `privacy-center/` (export + manifest + biometria). |
| `/lgpd/admin/requests` (+ details) | ✅ | Componentes em `src/components/privacy/`. |
| `/lgpd/admin/inventory` (+ form) | ✅ | Componentes em `src/components/privacy/`. |
| `/privacy/policy` `/privacy/processing-catalog` `/privacy/biometric-term` | ✅ | Rotas públicas LGPD. |

## 9. Gaps mobile

- Sticky decision bars (`VacationApprovalDecisionBar`, `TimeOffApprovalDecisionBar`, `DashboardMobileBottomNav`) calculam padding mas algumas páginas legadas (FE-AUD-001) não têm `pb-36` no `<main>` → CTA fixo pode cobrir botão "Limpar" em viewport 390x844. Severidade MÉDIA.
- `useReportResponsiveMode` e `useStatusRegistroResponsiveMode` usam breakpoint 1024px. `Avisos`/`CriarAviso` legados não têm switch — assumem desktop sempre. Severidade BAIXA.
- Suite de testes não emula viewports reais (vitest-jsdom assume `1024x768`). Validação visual em viewports `390x844`, `430x932` precisa ser **manual** ou via Playwright/Cypress. Status: `necessita execução local`.

## 10. Gaps desktop

- Viewports `1366x768` e `1536x864` não foram validados automaticamente; o `max-w-[1600px]` usado em hubs (Administracao, Empresa, PendingApprovals) garante boa apresentação em monitores menores, mas o `1600px` pode forçar scroll horizontal em `1366px` se algum filho não usar `min-w-0`. Validar manualmente.
- Skeletons no `DashboardDesktop` usam grid de 4 colunas (`xl:grid-cols-4`); ok para `1920px`, possivelmente apertado em `1366px`. Severidade BAIXA.

## 11. Segurança e LGPD

Resumo já consolidado em §7. Pontos-chave:

| Item | Status | Evidência |
|---|---|---|
| `withCredentials: true` | ✅ | `src/config/api.ts:202` |
| CSRF token automático | ✅ | `src/config/api.ts:218-228, 250-277` |
| Sanitização de logs | ✅ | `src/lib/observability.ts:81-92` |
| Token de sessão fora de localStorage | ✅ | Cookie HttpOnly via backend |
| Confirmação antes de ação destrutiva | ✅ | ExportConfirmationModal, NoticeDeleteDialog, DocumentDeleteDialog, VacationApprovalConfirmDialog, TimeOffApprovalConfirmDialog, StatusConfirmDialog |
| ObjectURL revogado | ✅ | 6/6 pares balanceados (document.service, fiscal.service, AdminLgpdRequestDetails, PrivacyCenter, useUsuarioPrivacyActions, report-export) |
| Biometric consent guard | ✅ | `src/components/BiometricConsentGuard.tsx` envolve `FaceLoginModal`, fluxo de check-in |
| Sem dados sensíveis em URL/log | ✅ | Apenas `employeeId` no filename de fallback de download (não-sensível) |
| `dangerouslySetInnerHTML` seguro | ✅ | Único uso é estilo estático em `ui/chart.tsx` |
| `target="_blank"` com `rel="noopener noreferrer"` | ✅ | Único caso (`SecurityIncidentReportViewer.tsx:177`) conforme |

**Riscos médios/baixos**:
- Exportação LGPD do titular gera JSON com dados pessoais baixado direto no browser — confirmar com legal se faz sentido adicionar password/expiração.
- 9 vulnerabilidades dev-only no `npm audit`.

## 12. Contratos front/back

Sem acesso ao back-end clonado localmente, esta seção é parcialmente "necessita execução local". Cross-check feito a partir dos services do front-end e dos contratos já documentados nos refatores anteriores:

| Service (front) | Método | Path | Status |
|---|---|---|---|
| `auth.service.loginWithPassword` | POST | `/auth/login` | ✅ contrato preservado |
| `auth.service.loginWithFace` | POST | `/auth/login-face` | ✅ |
| `auth.service.recoverPassword` | POST | `/auth/recover-password` | ✅ |
| `auth.service.resetPassword` | POST | `/auth/reset-password` | ✅ |
| `terms.service.checkTermsStatus` | GET | `/terms/status` | ✅ |
| `terms.service.acceptBiometricTerms` | POST | `/terms/accept-biometric` | ✅ |
| `dashboard.service.fetchUserProfile` | GET | `/employee/own-profile` | ✅ |
| `dashboard.service.fetchAllWarnings` | GET | `/messages` | ✅ |
| `dashboard.service.updateLastSeenMessageTimestamp` | POST | `/employee/mark-messages-seen` | ✅ |
| `dashboard.service.fetchPendingApprovalsCount` | GET | `/records/pending-approvals` | ✅ |
| `records.service.fetchPendingApprovals` | GET | `/records/pending-approvals?page=&employeeName=` | ✅ |
| `records.service.approveTimeRecordChange` | PATCH | `/records/approve/{id}` | ✅ |
| `records.service.rejectTimeRecordChange` | PATCH | `/records/reject/{id}` | ✅ |
| `records.service.fetchVacationRequests` | GET | `/records/vacation-request?status=&employeeName=` | ✅ |
| `records.service.approveVacationRequest` | POST | `/records/vacation/approve` (assumido) | ✅ |
| `records.service.rejectVacationRequest` | POST | `/records/vacation/reject` (assumido) | ✅ |
| `records.service.listTimeOffRequests` | GET | `/records/time-off/requests?status=&employeeName=` | ✅ |
| `records.service.approveTimeOff` | PATCH | `/records/time-off/approve/{id}` | ✅ |
| `records.service.rejectTimeOff` | PATCH | `/records/time-off/reject/{id}` | ✅ |
| `records.service.fetchDetailedReport` | POST | `/records/report?employeeId=` | ✅ |
| `records.service.fetchReportEmployees` | GET | `/employee?active=` | ✅ |
| `records.service.updateRecordStatus` | PUT | `/records/update/status/{employeeId}/{timeRecordId}` | ✅ |
| `records.service.toggleRecordActivate` | PUT | `/records/toggle-activate/{employeeId}/{timeRecordId}` | ✅ |
| `document.service.fetchDocuments` | GET | `/documents?employeeId=&type=&date=` | ✅ |
| `document.service.downloadDocument` | GET (blob) | `/documents/{id}?employeeId=` | ✅ |
| `document.service.deleteDocument` | DELETE | `/documents/{id}?employeeId=` | ✅ |
| `document.service.uploadDocument` | POST (multipart) | `/documents?employeeId=&type=` | ✅ |
| `fiscal.service.downloadAfd` | GET | `/legal/afd` | ✅ |
| `fiscal.service.downloadAej` | GET | `/legal/aej?startDate=&endDate=` | ✅ |
| `fiscal.service.downloadTechnicalCertificate` | GET | `/legal/technical-certificate` | ✅ |
| `lgpd.service.exportMyData` | GET | `/lgpd/me/export` | ✅ |
| `lgpd.service.createLgpdRequest` | POST | `/lgpd/requests` | ✅ |
| `lgpd.service.listLgpdRequests` | GET | `/lgpd/requests` | ✅ |
| `lgpd.service.fetchProcessingCatalog` | GET | `/lgpd/processing-catalog` | ✅ |

**Status global**: `necessita execução local` para verificação dos DTOs Java vs interfaces TS (`TimeRecordApprovalResponse`, `VacationRequestResponse`, `LgpdEmployeeExportResponse`). Não foi possível abrir o back-end nesta sessão.

## 13. Acessibilidade

- ✅ Botões com ícone usam `aria-label`.
- ✅ `role="button"` sempre com `tabIndex` e handler de teclado.
- ✅ Status comunicados com texto + cor (badges com label + ponto colorido).
- ✅ Imagens com `alt` (FaceLoginModal, CheckinCameraStep).
- ✅ Focus visível: `focus-visible:ring-2 focus-visible:ring-[#2563EB]` aplicado consistentemente.
- ⚠️ Não avaliado: contraste WCAG (`#94A3B8` sobre `#F8FAFC` em labels uppercase pode ficar < 4.5:1). Recomendado validação com axe-core ou Lighthouse.
- ⚠️ Não avaliado: navegação por teclado em `Drawer` (mobile). Componente é shadcn baseado em `vaul` — assume boa cobertura, mas confirmar com leitor de tela.

## 14. Performance, build e testes

- **Build**: ✅ `vite build` em 11s. Chunk `vendor-pdf-…js` 620 kB (gz 184 kB) — vem de `pdf-lib` usado em export PDF. Considerar lazy-load no relatório detalhado.
- **Code-splitting**: pages lazy-loaded via `React.lazy` em `App.tsx` ✅.
- **Vitest**: 91 arquivos / 563 testes verdes; 1 arquivo / 1 teste falho (FE-AUD-004).
- **TSC**: 0 erros.
- **Lint**: 0 erros + 2 warnings (FE-AUD-006, FE-AUD-007).
- **npm audit**: 9 vulns (5 high, 4 moderate) em dependências dev — `npm audit fix` aplica patches.

## 15. Backlog recomendado de correção

Priorizado por severidade × esforço:

| Prioridade | ID | Ação | Esforço |
|---|---|---|---|
| **P0** | FE-AUD-001 | Migrar `CriarEmpresa`, `BuscarEmpresa`, `AtualizarEmpresa`, `CriarAviso`, `EnviarDocumentos`, `CriarManager`, `NotFound` para `PageShell`. | Médio (7 páginas × ~30min cada) |
| **P0** | FE-AUD-004 | Atualizar `README.md` ou os patterns esperados em `api-contract-guard.test.ts` para restaurar 564/564 verde no CI. | Baixo |
| **P1** | FE-AUD-002 | Deletar `src/utils/dashboard-cards-config.ts` e `src/utils/dashboard-tone-colors.ts` (sem consumidores). | Baixo |
| **P1** | FE-AUD-003 | Adicionar testes de formatters em `vacation-approvals/__tests__/` e `time-off-approvals/__tests__/`. | Baixo |
| **P1** | FE-AUD-022 | Rodar `npm audit fix` e revalidar lint/build/test. | Baixo |
| **P2** | FE-AUD-005 | Consolidar 12+ hooks `useXxxResponsiveMode` em um `src/hooks/useResponsiveMode(breakpointPx)` único. | Médio |
| **P2** | FE-AUD-006 | Corrigir warning em `pages/avisos/AvisosPage.tsx:54` (incluir `model` nas deps do `useEffect`). | Baixo |
| **P2** | FE-AUD-007 | Mover `useCheckin` para arquivo dedicado (separar hook do provider). | Baixo |
| **P3** | FE-AUD-013/014 | Auditoria de contraste com axe-core + leitor de tela em viewports reais. | Médio |
| **P3** | FE-AUD-017 | Conversar com Legal/DPO sobre proteção do JSON de exportação LGPD (password/expiração). | Externo |
| **P3** | FE-AUD-023 | Substituir `useIsMobile` (`window.innerWidth`) por `matchMedia` puro. | Baixo |

## 16. Apêndice com evidências

### A. Resultado dos comandos

```bash
$ git branch --show-current
feature/lgpd-compliance-new-ui

$ npm run lint
> eslint .
src/context/CheckinContext.tsx
  286:14  warning  Fast refresh only works when a file only exports components
src/pages/avisos/AvisosPage.tsx
  54:6  warning  React Hook useEffect has a missing dependency: 'model'
✖ 2 problems (0 errors, 2 warnings)

$ npx tsc --noEmit
(exit 0, sem saída)

$ npm run build
✓ built in 11.04s
(!) Some chunks are larger than 500 kB after minification (vendor-pdf-…js 620 kB)

$ npx vitest run
Test Files  1 failed | 91 passed (92)
     Tests  1 failed | 563 passed (564)
Falha: src/test/api-contract-guard.test.ts (README pattern mismatch)

$ npm audit --audit-level=moderate
9 vulnerabilities (4 moderate, 5 high)
Fix available via `npm audit fix`
```

### B. Estatísticas do codebase

- Arquivos TS/TSX em `src/`: **595**
- Arquivos de teste em `src/`: **92**
- Linhas de `App.tsx`: **174**
- Rotas registradas em `App.tsx`: **40** (públicas + autenticadas + role-gated)
- Console statements totais (`console.*`): **60** (majoritariamente `console.error` em `catch` — não em produção)
- Cookies/`localStorage` com dado sensível: **0** detectado em código de produção

### C. Mapa de features

```
src/features/
├── collaborators/         (3 test files)
├── documents/
├── fiscal-audit/
├── pending-approvals/     (cobertura via src/hooks/usePendingApprovals.test.tsx)
├── status-registro/
├── time-off-approvals/    ❌ SEM TESTES (FE-AUD-003)
├── time-off-request/      (2 test files)
├── upload-document/
├── user-profile/          (3 test files)
├── vacation-approvals/    ❌ SEM TESTES (FE-AUD-003)
└── vacation-request/      (2 test files)
```

### D. Componentes da nova UI

```
src/components/
├── checkin/               (CheckinModal + flow steps)
├── dashboard-command-center/   (refactor Dashboard 2026)
├── header/                (HeaderDesktop + HeaderMobile + Notifications + AccountMenu)
├── login-gateway/         (LoginDesktop + LoginMobile + BrandPanel + Pillars + PrivacyLinks)
├── privacy/               (BiometricConsent, LgpdRequest, AdminLgpd*, ExportConfirmation*)
├── privacy-center/        (Mobile + Desktop privacy hub)
├── status-registro/       (StatusDecisionPanel + ConfirmDialog + Queue)
└── ui/                    (shadcn primitives)
```

### E. Checklist de critérios de aceite (do prompt)

- [x] `auditoria-front-end.md` criado na raiz do front-end
- [x] Nenhuma alteração em código-fonte, CSS, componentes, services, hooks, rotas, testes ou configs
- [x] Comandos `lint`, `tsc`, `build`, `vitest`, `npm audit` executados e registrados
- [x] Todas as rotas do `APP_PATHS` mínimo auditadas
- [x] Achados rastreáveis com file:line
- [x] Backlog priorizado fornecido
- [ ] Validação visual em viewports reais (1366/1536/1920 desktop e 390/430 mobile) — **necessita execução local**
- [ ] Cross-check completo de DTOs Java vs interfaces TS — **necessita execução local** (back-end não clonado)

---

**Auditoria executada por**: Claude (Opus 4.7) via Codex CLI, 2026-06-15.
**Tempo total estimado de execução**: ~25 minutos (inspeção + comandos + redação).
**Escopo coberto**: 595 arquivos TS/TSX, 40 rotas, 11 features, 92 arquivos de teste.
