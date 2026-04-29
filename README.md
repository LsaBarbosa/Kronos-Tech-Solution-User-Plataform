# Kronos User Platform

## Visão geral

Front-end React da plataforma de usuários da Kronos, alinhado ao backend `Kronos-Tech-Solutions-KTS`.
O foco do projeto é autenticação consistente, aderência real aos endpoints do backend e uma base segura para evolução enterprise.

## Stack

- Vite
- React 18
- TypeScript
- TanStack Query
- Axios
- Tailwind CSS
- shadcn/ui
- Vitest + Testing Library + MSW

## Requisitos

- Node.js 22+
- npm 10+

## Variáveis de ambiente

Copie os valores de [.env.example](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/.env.example) para o seu ambiente local.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_BASE_URL` | Sim | URL base do backend Kronos. Em desenvolvimento local o fallback é `http://localhost:8080`. |

## Como rodar localmente

```bash
npm install
npm run dev
```

## Como rodar testes

```bash
npm run test
```

Para executar um domínio específico:

```bash
npm run test -- terms
npm run test -- dashboard
npm run test -- records
```

Os testes de contrato cobrem `GET /documents` com `type` obrigatório, login facial com `livenessPassed` e revogação biométrica via `DELETE /terms/revoke-biometric`.

## Como gerar build

```bash
npm run build
```

## Arquitetura

### Pastas principais

- `src/config`: cliente Axios, rotas de API e metadados de rotas do app.
- `src/context`: autenticação e sessão.
- `src/service`: integração com o backend por domínio.
- `src/hooks`: orquestração de estado de tela e formulários.
- `src/pages`: telas de negócio.
- `src/components`: componentes compartilhados e guardas de rota.
- `src/test`: setup global, MSW e testes de integração mockados.
- `docs`: documentação técnica e de contrato.

### Padrões de service

- Toda chamada HTTP interna passa por `src/config/api.ts`.
- Toda rota de API usa `src/config/api-routes.ts`.
- Os services normalizam contrato e shape de resposta para a UI.
- Erros HTTP são convertidos para `ServiceError`.

## Integração com backend

- O mapa completo de endpoints consumidos está em [docs/api-contract-map.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/api-contract-map.md).
- O inventario HTTP do front está em [docs/frontend-http-inventory.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/frontend-http-inventory.md).
- A visao de arquitetura está em [docs/frontend-architecture.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/frontend-architecture.md).
- A aderência à branch backend `flag/redis` está em [docs/flag-redis-adherence.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/flag-redis-adherence.md).
- O plano de liveness biometrico está em [docs/biometric-liveness-plan.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/biometric-liveness-plan.md).
- O plano OpenAPI está em [docs/openapi-contract-plan.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/openapi-contract-plan.md).

## Autenticação e sessão

- `AuthProvider` centraliza token, perfil e estado de sessão.
- `ProtectedRoute` impede vazamento de conteúdo durante `checking`.
- `RoleRoute` usa `APP_ROUTE_META` para bloquear acesso manual por URL.
- O aceite biométrico trata `GET /terms/status` como `boolean` e `POST /terms/accept-biometric` como retorno com novo token.
- O login facial envia `livenessPassed` por contrato com o backend atual.
- A listagem de documentos exige `type` em toda chamada.
- O espelho de ponto aceita `targetEmployeeId?` para gestores.
- O tratamento de erros HTTP diferencia `429` e `503`.

## Testes

- A suíte usa `MSW` com `onUnhandledRequest: "error"` para impedir rotas não mockadas.
- Os handlers base ficam em `src/test/mocks/handlers.ts`.
- Testes podem sobrescrever handlers por caso usando `server.use(...)`.

## Troubleshooting

- `npm` fora do `PATH`: garanta que o Node instalado pelo `nvm` esteja carregado no shell.
- `401/403` na navegação: verifique `VITE_API_BASE_URL` e o token salvo no storage.
- erro de geolocalização: a criação/edição de empresa depende do endpoint backend `POST /geolocation/resolve`.
- teste falhando por rota não mockada: adicione ou atualize o handler em `src/test/mocks/handlers.ts`.
