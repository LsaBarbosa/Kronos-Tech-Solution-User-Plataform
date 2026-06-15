# Skill — Kronos Correção Front-end pós-auditoria

## Missão

Corrigir o front-end Kronos com base no relatório `auditoria-front-end.md`, preservando contratos, regras de negócio, segurança, LGPD, responsividade e identidade visual.

## Repositórios

- Front-end alvo: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Back-end referência: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Documentação referência: `kronos-business`, branch `main`.

## Entradas obrigatórias

Leia antes de alterar código:

1. `auditoria-front-end.md` na raiz do front-end ou em `references/auditoria/auditoria-front-end.md`.
2. `src/App.tsx`.
3. `src/config/app-routes.ts`.
4. `src/config/api.ts`.
5. `src/components/PageShell.tsx`.
6. `src/components/Header.tsx` e `src/components/header/**/*`.
7. `src/components/Sidebar.tsx`.
8. `src/components/ProtectedRoute.tsx`.
9. `src/components/RoleRoute.tsx`.
10. `src/context/AuthContext.tsx`.
11. `src/context/CheckinContext.tsx` e `src/context/CheckinContextDef.ts`.
12. `package.json`, `package-lock.json`, `vite.config.*`, `tsconfig*.json`, `eslint.config.*`.
13. Arquivos do `kronos-business` sobre mapa de módulos, regras, fluxos, LGPD, segurança e UI.

## Correções mínimas esperadas

### 1. Corrigir FE-AUD-001 — páginas legadas sem PageShell

Arquivos mencionados pela auditoria:

- `src/pages/CriarEmpresa.tsx`
- `src/pages/BuscarEmpresa.tsx`
- `src/pages/AtualizarEmpresa.tsx`
- `src/pages/CriarAviso.tsx`
- `src/pages/EnviarDocumentos.tsx`
- `src/pages/CriarManager.tsx`
- `src/pages/NotFound.tsx`

Regras:

- Remover import direto de `Header` e `Sidebar` quando a página é autenticada.
- Usar `PageShell` como fonte única de `Header`/`Sidebar`.
- Preservar estado `sidebarOpen` e `toggleSidebar` por página, se o padrão atual do projeto ainda exigir.
- Manter formulários, services, validações, toasts, dialogs e navegação existentes.
- Não transformar a página em mock estático.
- `NotFound` exige cuidado: a rota `*` está fora do `ProtectedRoute`; portanto, não vazar header autenticado para usuário não autenticado. Implementar fallback público ou comportamento condicional com `useAuth`.

### 2. Corrigir FE-AUD-004 — teste `api-contract-guard`

- Executar `npx vitest run src/test/api-contract-guard.test.ts`.
- Identificar se a falha vem do `README.md` alterado por pacotes Codex.
- Preferir restaurar o `README.md` original do projeto se ele foi sobrescrito indevidamente.
- Só alterar o teste se o contrato esperado tiver realmente mudado.
- Não maquiar o teste removendo assertions úteis.

### 3. Corrigir FE-AUD-002 — código morto do Dashboard

- Confirmar com busca textual antes de remover:
  - `src/utils/dashboard-cards-config.ts`
  - `src/utils/dashboard-tone-colors.ts`
- Se nenhum import existir, deletar.
- Se algum import existir, atualizar ou manter justificando no relatório.

### 4. Corrigir FE-AUD-003 — lacuna de testes

Adicionar testes unitários para:

- `src/features/vacation-approvals/**`
- `src/features/time-off-approvals/**`

Cobrir, conforme existirem no código:

- mapeamento de status e aliases;
- labels exibidos;
- cálculo de dias corridos/úteis/finais de semana;
- formatação de período;
- tratamento de dados ausentes;
- helpers de tom/cor/impacto.

### 5. Corrigir FE-AUD-022 — dependências vulneráveis

- Executar `npm audit --audit-level=moderate`.
- Executar `npm audit fix` somente sem `--force`.
- Se alterar `package-lock.json`, executar validação completa.
- Não usar `npm audit fix --force` sem aprovação humana.

### 6. Corrigir FE-AUD-005/023 — responsividade

- Remover leitura direta de `window.innerWidth` quando houver alternativa por `matchMedia`.
- Consolidar hooks duplicados apenas se o impacto for controlado.
- Não criar regressão em mobile/desktop.
- O breakpoint padrão visual deve permanecer `1024px`, salvo se a documentação do projeto indicar outro.

### 7. Corrigir FE-AUD-006 — warning de hook

- Corrigir `src/pages/avisos/AvisosPage.tsx` sem gerar loop infinito.
- Preferir desestruturar dependências estáveis do view model.
- Rodar lint depois.

### 8. Corrigir FE-AUD-007 — Fast Refresh

- Separar hook `useCheckin` do provider, se necessário.
- Atualizar imports dos consumidores.
- Preservar API pública do hook.
- Rodar busca geral por `useCheckin`.

## Regras de segurança

- Não armazenar token, senha, CPF, salário, faceBase64 ou dados LGPD em `localStorage`/`sessionStorage`.
- Não remover CSRF.
- Não remover `withCredentials`.
- Não expor detalhes de erro sensível em UI.
- Não remover confirmações de ações sensíveis.
- Não alterar contratos de API sem comprovação no back-end.

## Validação obrigatória

Executar e registrar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
npm audit --audit-level=moderate
```

Quando possível, executar também:

```bash
npm run test:e2e
```

## Saída obrigatória

Criar `correção-front-end.md` na raiz do front-end com:

- sumário executivo;
- branch e commit inicial/final;
- lista de achados corrigidos;
- lista de achados não corrigidos;
- arquivos alterados;
- testes criados/ajustados;
- comandos executados e resultados;
- riscos remanescentes;
- próximos passos;
- referências `arquivo:linha` antes/depois.
