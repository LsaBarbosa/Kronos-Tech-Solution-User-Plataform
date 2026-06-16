# Prompt para Codex CLI — Refatorar `/lgpd/admin/requests`

Você é o agente de implementação do projeto Kronos.

## Contexto obrigatório

Observe:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`
- Documentação: `kronos-business`, branch `main`

O repositório `kronos-business` é o norteador funcional.

## Objetivo

Refatorar a rota:

```text
/lgpd/admin/requests
```

A tela deve ser uma **central administrativa de governança LGPD**, com:

- desktop em formato de mesa/inbox de governança;
- mobile em formato de fila de cards;
- leitura clara de status, SLA, titular, empresa, tipo, responsável e próxima ação;
- navegação para detalhe;
- sem ações destrutivas diretas na lista.

## Leia antes de codar

### Front-end

```text
package.json
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

### Back-end

```text
LgpdController.java
ApiPaths.java
LgpdRequestAdminListResponse.java
LgpdRequestDetailsResponse.java
LgpdRequestStatus.java
LgpdRequestType.java
```

Confirme:

```text
GET /lgpd/admin/requests
GET /lgpd/admin/requests/{requestId}
PATCH /lgpd/admin/requests/{requestId}/assign
POST /lgpd/admin/requests/{requestId}/transition-status
POST /lgpd/admin/requests/{requestId}/notes
POST /lgpd/admin/requests/{requestId}/complete
POST /lgpd/admin/requests/{requestId}/reject
POST /lgpd/admin/requests/{requestId}/request-complement
POST /lgpd/admin/requests/{requestId}/cancel
POST /lgpd/admin/requests/{requestId}/export
```

### Documentação

No `kronos-business/main`, leia `04-mapa-modulos-telas.md` e busque por:

```text
/lgpd/admin/requests
/lgpd/admin/requests/:requestId
LGPD
solicitações LGPD
inventário
exportação
anonimização
direitos do titular
```

### Diretriz e mockups

```text
references/docs/kronos_lgpd_admin_requests_diretriz_visual.md
references/mockups/kronos_lgpd_admin_requests_desktop.png
references/mockups/kronos_lgpd_admin_requests_mobile.png
```

## Regras

1. Preserve `APP_PATHS.lgpdAdminRequests`.
2. Preserve `APP_ROUTE_META.lgpdAdminRequests.allowedRoles = ["CTO", "MANAGER"]`.
3. `PARTNER` não deve acessar.
4. Preserve o lazy import atual do `App.tsx`.
5. Se mover a implementação para `src/features/lgpd-admin-requests`, mantenha `src/components/privacy/AdminLgpdRequests.tsx` como entrypoint compatível.
6. Não execute transições, rejeições, cancelamentos ou exportações diretamente na lista.
7. A lista deve abrir detalhes.
8. Mobile não pode usar tabela.
9. Desktop deve ter painel lateral do caso selecionado.
10. O status deve ser textual e colorido.
11. `isOverdue` deve gerar destaque vermelho.
12. Dados sensíveis devem usar destaque roxo/teal.
13. Loading deve bloquear ações duplicadas.
14. Não logar payloads LGPD no console.
15. Não usar `localStorage` para dados da tela.

## Sugestão de arquitetura

```text
src/features/lgpd-admin-requests/
├── LgpdAdminRequestsPage.tsx
├── LgpdAdminRequestsDesktop.tsx
├── LgpdAdminRequestsMobile.tsx
├── components/
├── hooks/
├── utils/
└── __tests__/
```

## Pontos funcionais

### Filtros

A API suporta `type`, `status`, `companyId` e pode aceitar `employeeName`. Se o service ainda não passa `employeeName`, adicione como parâmetro opcional retrocompatível.

### Seleção

- selecionar primeiro item automaticamente;
- manter seleção se o item ainda existir;
- se a seleção sair da página, selecionar o primeiro item;
- mobile mostra bottom bar do selecionado.

### Métricas

Não inventar totais globais se a API não retornar agregados.

### SLA

Usar `request.isOverdue` como fonte principal.

## Validação obrigatória

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

## Critério de aceite

- `/lgpd/admin/requests` abre.
- `CTO` e `MANAGER` acessam.
- `PARTNER` não acessa.
- Desktop segue o mockup.
- Mobile segue o mockup.
- Mobile não tem tabela.
- `Abrir detalhes` navega para `/lgpd/admin/requests/:requestId`.
- Solicitações atrasadas têm badge crítico.
- Status e tipo são legíveis.
- Sem regressão em `AdminLgpdRequestDetails`.
