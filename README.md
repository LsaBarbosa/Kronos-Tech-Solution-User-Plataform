# Kronos User Platform

Front-end React da plataforma de usuários da Kronos, alinhado ao backend `Kronos-Tech-Solutions-KTS` na branch `flag/redis`.

## Stack

- Vite
- React 18
- TypeScript strict
- TanStack Query
- Axios
- Tailwind CSS
- shadcn/ui
- Vitest + Testing Library + MSW
- Playwright para E2E administrativo

## Requisitos

- Node.js 22+
- npm 10+

## Variáveis de Ambiente

Copie `.env.example` para o ambiente local.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_BASE_URL` | Sim | URL base do backend Kronos. O fallback local é `http://localhost:8080`. |
| `VITE_OBSERVABILITY_ENABLED` | Não | Habilita captura opt-in de erros de runtime/API. |
| `VITE_OBSERVABILITY_ENDPOINT` | Não | Endpoint para eventos de observabilidade. |

## Comandos

```bash
npm install
npm run dev
npm run generate:api-types
npm run lint
npm run test
npm run build
npm run test:e2e
npm run test:coverage
npm run analyze
```

## Escopo e Arquitetura

- **Escopo dos repositórios:** [docs/architecture/repository-scope.md](docs/architecture/repository-scope.md) — Define responsabilidades entre User-Plataform e User-Register
- Mapa de endpoints: [docs/api-contract-map.md](docs/api-contract-map.md)
- Inventário HTTP: [docs/frontend-http-inventory.md](docs/frontend-http-inventory.md)
- Aderência ao backend `flag/redis`: [docs/flag-redis-adherence.md](docs/flag-redis-adherence.md)
- Plano OpenAPI: [docs/openapi-contract-plan.md](docs/openapi-contract-plan.md)
- Arquitetura: [docs/frontend-architecture.md](docs/frontend-architecture.md)
- Plano de liveness: [docs/biometric-liveness-plan.md](docs/biometric-liveness-plan.md)

## Padrões

- Toda chamada HTTP passa por `src/config/api.ts`.
- Rotas HTTP usam `API_ROUTES` e `buildRoute`.
- `GET /documents` sempre envia `type`.
- Geolocalização usa `POST /geolocation/resolve` no backend, sem chave externa no navegador.
- Relatórios legais tratam `429` e `503` com mensagens específicas.
- Requisições Axios enviam `X-Correlation-Id`.
- MSW fica organizado por domínio em `src/test/msw/handlers`.

## Fora de Escopo Neste Front

Os seguintes fluxos pertencem a `Kronos-Tech-Solution-User-Register` (aplicação de registro de ponto):

- ❌ `POST /records/checkin` — Marcação de ponto
- ❌ Captura facial para batida
- ❌ Geolocalização para marcação
- ❌ Fluxo completo de liveness para ponto

Este projeto mantém apenas documentação e contratos de guarda, sem implementação. Para detalhes de escopo, veja [docs/architecture/repository-scope.md](docs/architecture/repository-scope.md).
