# Arquitetura do Front-end

## Camadas

| Camada | Responsabilidade |
|---|---|
| `src/config` | Axios, rotas HTTP e rotas da aplicação. |
| `src/service` | Integração com backend por domínio. |
| `src/hooks` | Estado de tela, mutations e query cache. |
| `src/pages` | Composição de telas. |
| `src/components` | UI compartilhada, layout e guardas. |
| `src/test/msw` | Handlers MSW por domínio. |

## HTTP

Todas as chamadas passam por `src/config/api.ts`, que aplica:

- Autenticação via cookie HTTP-Only (sem `Authorization` header com token).
- `X-Correlation-Id` por requisição.
- normalização de erro em `ServiceError`.
- bloqueio de rotas protegidas por `TermsAcceptanceGate` quando o backend retorna `TERMS_NOT_ACCEPTED`.

## React Query

As chaves de cache compartilhadas ficam em `src/lib/query-keys.ts`. Mutations administrativas invalidam prefixos por domínio para evitar listas obsoletas.

## Observabilidade

`src/lib/observability.ts` fornece captura opt-in por ambiente:

- `VITE_OBSERVABILITY_ENABLED=true`
- `VITE_OBSERVABILITY_ENDPOINT=https://...`

O payload é sanitizado e não envia token, senha, CPF, CNPJ, e-mail, username, imagens ou payloads biométricos.

## Acessibilidade

Estados reutilizáveis ficam em `src/components/states` com `role=status`, `role=alert` e `aria-live` quando aplicável.

## Convenções de Nomenclatura

| Tipo | Local | Padrão | Exemplo |
|---|---|---|---|
| Services | `src/service/` | `[domínio].service.ts` | `auth.service.ts`, `records.service.ts` |
| Hooks | `src/hooks/` | `use[Nome].ts` | `useUser.ts`, `usePendingApprovals.ts` |
| Testes | Mesmo dir do arquivo | `[arquivo].test.ts(x)` | `auth.service.test.ts`, `FaceLoginModal.test.tsx` |
| Types | `src/types/` | `[domínio].ts` | `user.ts`, `auth.ts`, `vacation.ts` |
| Helpers | `src/service/helpers/` | `[nome].helper.ts` | `service-error.helper.ts`, `response-normalizer.helper.ts` |
| Pages | `src/pages/` | `[NomeComCamelCase].tsx` | `Dashboard.tsx`, `StatusRegistro.tsx` |
| Components | `src/components/` | `[NomeComCamelCase].tsx` | `FaceLoginModal.tsx`, `EmployeeBadge.tsx` |

### Endpoints

Endpoints (rotas de API) são centralizados em `src/config/api-routes.ts`:

```ts
export const API_ROUTES = {
  AUTH: "auth",
  RECORDS: "records",
  // ...
} as const;

export const AUTH_PATHS = {
  LOGIN: "login",
  LOGIN_FACE: "login-face",
  // ...
} as const;
```

Services usam: `buildRoute(API_ROUTES.AUTH, AUTH_PATHS.LOGIN)` ao invés de strings literais.
