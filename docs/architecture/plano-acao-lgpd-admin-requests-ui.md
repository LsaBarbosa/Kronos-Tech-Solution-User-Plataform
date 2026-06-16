# Plano de ação — Refatoração `/lgpd/admin/requests`

## Fase 0 — Preparação

### Task 0.1 — Confirmar branch

```bash
cd Kronos-Tech-Solution-User-Plataform
git branch --show-current
git status --short
```

Critério: branch `feature/lgpd-compliance-new-ui`.

### Task 0.2 — Validar baseline

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Registre falhas pré-existentes antes de alterar código.

---

## Fase 1 — Leitura obrigatória

### Task 1.1 — Documentação

No `kronos-business/main`, ler e buscar:

```text
04-mapa-modulos-telas.md
/lgpd/admin/requests
/lgpd/admin/requests/:requestId
Solicitações LGPD
Inventário de tratamento
Exportação
Anonimização
Direitos do titular
```

### Task 1.2 — Diretriz visual

Ler:

```text
references/docs/kronos_lgpd_admin_requests_diretriz_visual.md
references/mockups/kronos_lgpd_admin_requests_desktop.png
references/mockups/kronos_lgpd_admin_requests_mobile.png
```

Extrair métricas, filtros, status, estados, diferenças desktop/mobile e semântica de cores.

---

## Fase 2 — Mapeamento técnico

### Task 2.1 — Front-end

Ler:

```text
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
src/service/lgpd.service.ts
src/constants/lgpd.constants.ts
src/components/privacy/AdminLgpdRequests.tsx
src/components/privacy/AdminLgpdRequestDetails.tsx
src/components/PageShell.tsx
src/components/layout/AuthenticatedPageLayout.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
src/context/AuthContext.tsx
```

### Task 2.2 — Back-end

No `Kronos-Tech-Solutions-KTS/PROD_HOSTINGER_V2`, ler:

```text
LgpdController.java
ApiPaths.java
LgpdRequestAdminListResponse.java
LgpdRequestDetailsResponse.java
LgpdRequestStatus.java
LgpdRequestType.java
```

Confirmar contratos usados pelo front.

---

## Fase 3 — Arquitetura da nova tela

### Task 3.1 — Criar feature modular

Sugestão:

```text
src/features/lgpd-admin-requests/
├── LgpdAdminRequestsPage.tsx
├── LgpdAdminRequestsDesktop.tsx
├── LgpdAdminRequestsMobile.tsx
├── components/
│   ├── LgpdAdminHero.tsx
│   ├── LgpdAdminMetrics.tsx
│   ├── LgpdAdminFilters.tsx
│   ├── LgpdAdminInboxTable.tsx
│   ├── LgpdAdminRequestCard.tsx
│   ├── LgpdAdminCasePanel.tsx
│   ├── LgpdAdminMobileDecisionBar.tsx
│   └── LgpdAdminStatusBadge.tsx
├── hooks/
│   ├── useLgpdAdminRequestsViewModel.ts
│   └── useLgpdAdminRequestsResponsiveMode.ts
├── utils/
│   ├── lgpdAdminRequestsFormatters.ts
│   └── lgpdAdminRequestsMappers.ts
└── __tests__/
    └── lgpdAdminRequestsFormatters.test.ts
```

### Task 3.2 — Preservar entrypoint

Substituir `src/components/privacy/AdminLgpdRequests.tsx` por wrapper compatível ou manter named export, conforme `App.tsx` espera.

---

## Fase 4 — Implementação funcional

### Task 4.1 — ViewModel

Controlar:

- lista;
- item selecionado;
- loading;
- erro;
- página atual;
- total de páginas;
- filtros;
- busca por titular/empresa;
- reset de página ao trocar filtro;
- abertura de detalhes.

Se o service atual não passa `employeeName`, adicionar parâmetro opcional sem quebrar chamadas existentes.

### Task 4.2 — Métricas

Calcular:

- abertas;
- em análise;
- atrasadas;
- aprovadas para exportação.

Não inventar total global se a API só retornar página atual.

### Task 4.3 — Status e tipos

Criar mappers para:

- tipo → label;
- status → label/tom;
- risco de dados sensíveis;
- SLA com base em `isOverdue`.

### Task 4.4 — Desktop

Implementar hero, métricas, filtros, inbox, painel lateral e CTA `Abrir detalhes`.

### Task 4.5 — Mobile

Implementar resumo, busca, chips, cards, bottom bar/drawer e CTA `Abrir detalhes`.

---

## Fase 5 — Segurança e UX

Garantir:

- sem storage de dados LGPD;
- sem console com payload sensível;
- status textual + cor;
- atraso em vermelho;
- dados sensíveis com roxo/teal;
- erro com retry;
- loading acessível.

---

## Fase 6 — Testes

Criar testes para:

- status label/tone;
- type label;
- `isOverdue`;
- métricas;
- navegação/seleção quando possível.

Executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

---

## Fase 7 — Limpeza

Remover markup legado, imports mortos, helpers duplicados e CSS não usado. Não remover `AdminLgpdRequestDetails.tsx`.
