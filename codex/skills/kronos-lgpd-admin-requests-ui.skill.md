# Skill — Kronos LGPD Admin Requests UI

## Missão

Implementar a nova experiência da rota `/lgpd/admin/requests` no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.

A tela deve representar uma **central administrativa de governança LGPD**, com foco em triagem, SLA, status, titular, empresa, responsável e próxima ação.

## Escopo funcional

A tela deve permitir:

1. listar solicitações LGPD administrativas;
2. filtrar por tipo;
3. filtrar por status;
4. filtrar por empresa quando o contrato atual permitir;
5. localizar titular/funcionário;
6. identificar solicitações atrasadas;
7. selecionar uma solicitação;
8. abrir detalhes do caso;
9. apoiar atribuição de responsável pela navegação para detalhe;
10. não executar ações destrutivas diretamente na lista;
11. preservar paginação e loading;
12. preservar rotas protegidas por `CTO` e `MANAGER`.

## Experiência desktop

Desktop deve conter:

- hero institucional com métricas: abertas, em análise, atrasadas e exportáveis;
- inbox administrativo com busca por titular/empresa e filtros de tipo/status;
- linhas com titular, empresa, tipo, status, SLA e responsável;
- painel lateral com caso selecionado, linha de tratamento, alerta de SLA/dados sensíveis e CTA para detalhes.

## Experiência mobile

Mobile deve conter:

- topo compacto;
- cards de métricas;
- busca;
- chips de status;
- cards de solicitações;
- drawer/bottom action fixo com o caso selecionado;
- CTA `Abrir detalhes`;
- sem tabela.

## Contratos que devem ser preservados

- `GET /lgpd/admin/requests`
- `GET /lgpd/admin/requests/{requestId}`
- `PATCH /lgpd/admin/requests/{requestId}/assign`
- `POST /lgpd/admin/requests/{requestId}/transition-status`
- `POST /lgpd/admin/requests/{requestId}/notes`
- `POST /lgpd/admin/requests/{requestId}/complete`
- `POST /lgpd/admin/requests/{requestId}/reject`
- `POST /lgpd/admin/requests/{requestId}/request-complement`
- `POST /lgpd/admin/requests/{requestId}/cancel`
- exportação e anonimização já usadas no detalhe.

## Arquitetura sugerida

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

Mantenha `src/components/privacy/AdminLgpdRequests.tsx` como entrypoint compatível com o `App.tsx`.

## Qualidade mínima

Execute:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```
