# Prompt para Codex CLI — Corrigir auditoria Front-end Kronos

Você é o agente executor do Codex CLI responsável por corrigir o front-end Kronos após auditoria técnica.

## Contexto obrigatório

Repositórios e branches:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Documentação: `kronos-business`, branch `main`.

O front-end é o único repositório onde você deve alterar código.

## Objetivo

Corrigir as falhas, gaps, bugs, warnings e vulnerabilidades encontradas em `auditoria-front-end.md`, preservando identidade visual, responsividade mobile/desktop, segurança, LGPD e contratos front/back.

Ao final, criar na raiz do front-end o documento:

```text
correção-front-end.md
```

Esse documento deve listar tudo que foi corrigido, parcialmente corrigido e não corrigido, com referências no código.

## Arquivos que você deve ler antes de alterar

### Auditoria

- `auditoria-front-end.md`
- se estiver usando este pacote: `references/auditoria/auditoria-front-end.md`

### Front-end — estrutura e rotas

- `package.json`
- `package-lock.json`
- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/config/api-routes.ts`
- `src/config/api.ts`
- `src/components/ProtectedRoute.tsx`
- `src/components/RoleRoute.tsx`
- `src/components/PageShell.tsx`
- `src/components/Header.tsx`
- `src/components/header/**/*`
- `src/components/Sidebar.tsx`
- `src/context/AuthContext.tsx`
- `src/context/CheckinContext.tsx`
- `src/context/CheckinContextDef.ts`

### Front-end — páginas alvo P0

- `src/pages/CriarEmpresa.tsx`
- `src/pages/BuscarEmpresa.tsx`
- `src/pages/AtualizarEmpresa.tsx`
- `src/pages/CriarAviso.tsx`
- `src/pages/EnviarDocumentos.tsx`
- `src/pages/CriarManager.tsx`
- `src/pages/NotFound.tsx`

### Front-end — features alvo P1/P2

- `src/features/vacation-approvals/**/*`
- `src/features/time-off-approvals/**/*`
- `src/pages/avisos/AvisosPage.tsx`
- `src/hooks/use-mobile.tsx`
- todos os hooks `use*ResponsiveMode.ts*`
- `src/test/api-contract-guard.test.ts`

### Documentação

No repositório `kronos-business`, branch `main`, leia no mínimo:

- `04-mapa-modulos-telas.md`
- documentos de regras de negócio;
- documentos de fluxos;
- documentos LGPD;
- documentos sobre contratos front/back;
- documentos sobre identidade visual e telas, quando existirem.

### Back-end para contrato

No back-end, branch `PROD_HOSTINGER_V2`, use somente para leitura. Validar, quando necessário:

- `ApiPaths`
- controllers de `Auth`, `Terms`, `Lgpd`, `Employee`, `User`, `Records`, `Documents`, `Messages`, `Legal`.

Não altere back-end.

## Correções obrigatórias

### 1. FE-AUD-001 — Migrar páginas legadas para PageShell

Corrigir páginas que ainda importam `Header`/`Sidebar` diretamente:

- `CriarEmpresa`
- `BuscarEmpresa`
- `AtualizarEmpresa`
- `CriarAviso`
- `EnviarDocumentos`
- `CriarManager`
- `NotFound`

Regras:

- Em rotas autenticadas, `PageShell` deve ser a fonte única de `Header` e `Sidebar`.
- Não duplicar `Header`/`Sidebar`.
- Preservar funcionalidade, formulários, loading, toasts, dialogs e navegação.
- Mobile e desktop devem continuar funcionais.
- `NotFound` está fora de `ProtectedRoute`; não vaze header, logout, role, perfil ou menu autenticado para usuário público.

### 2. FE-AUD-004 — Corrigir teste api-contract-guard

A auditoria indicou falha por divergência de `README.md`.

Faça:

1. Rode `npx vitest run src/test/api-contract-guard.test.ts`.
2. Se o `README.md` foi sobrescrito por pacote Codex, restaure o README original do projeto.
3. Se a alteração do README for intencional, atualize o teste sem remover proteção relevante.
4. Rode `npx vitest run`.

### 3. FE-AUD-002 — Remover utilitários mortos

Confirmar ausência de uso e remover, se realmente órfãos:

- `src/utils/dashboard-cards-config.ts`
- `src/utils/dashboard-tone-colors.ts`

### 4. FE-AUD-003 — Adicionar testes de approvals

Criar testes para helpers/formatters de:

- `src/features/vacation-approvals`
- `src/features/time-off-approvals`

Cobrir:

- status;
- labels;
- aliases;
- datas;
- cálculos de impacto;
- valores ausentes;
- decisão visual quando aplicável.

### 5. FE-AUD-022 — Corrigir dependências vulneráveis

Execute:

```bash
npm audit --audit-level=moderate
npm audit fix
npm audit --audit-level=moderate
```

Proibido usar `npm audit fix --force`.

### 6. FE-AUD-006 — Corrigir warning em AvisosPage

Corrija dependency array do hook sem gerar loop e sem mascarar lint.

### 7. FE-AUD-007 — Corrigir Fast Refresh do CheckinContext

Separe hook e provider se necessário. Mantenha imports funcionais.

### 8. FE-AUD-005/023 — Responsividade

- Remover `window.innerWidth` direto em código de produção.
- Consolidar hooks responsivos quando seguro.
- Não alterar comportamento mobile/desktop existente sem necessidade.

## Validação obrigatória

Depois das correções, execute:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
npm audit --audit-level=moderate
```

Registre a saída resumida no relatório.

## Relatório obrigatório

Crie `correção-front-end.md` com este conteúdo mínimo:

1. Sumário executivo.
2. Branch, commit inicial e commit final ou hash local.
3. Tabela de achados corrigidos.
4. Tabela de achados parcialmente corrigidos.
5. Tabela de achados não corrigidos, com motivo.
6. Arquivos alterados.
7. Testes criados/alterados.
8. Comandos executados e resultados.
9. Evidências `arquivo:linha`.
10. Riscos remanescentes.
11. Próximos passos.

## Critério de parada

Pare e peça decisão humana somente se:

- uma correção exige mudança de backend;
- `npm audit fix` propõe breaking change;
- a correção altera regra trabalhista/LGPD sem respaldo documental;
- há conflito grande no workspace;
- um teste falha por comportamento de negócio ambíguo.

Caso contrário, execute a correção.
