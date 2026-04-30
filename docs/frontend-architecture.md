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

- `Authorization` quando existe token local.
- `X-Correlation-Id` por requisição.
- normalização de erro em `ServiceError`.
- redirecionamento de termos somente quando o backend retorna `TERMS_NOT_ACCEPTED`.

## React Query

As chaves de cache compartilhadas ficam em `src/lib/query-keys.ts`. Mutations administrativas invalidam prefixos por domínio para evitar listas obsoletas.

## Observabilidade

`src/lib/observability.ts` fornece captura opt-in por ambiente:

- `VITE_OBSERVABILITY_ENABLED=true`
- `VITE_OBSERVABILITY_ENDPOINT=https://...`

O payload é sanitizado e não envia token, senha, CPF, CNPJ, e-mail, username, imagens ou payloads biométricos.

## Acessibilidade

Estados reutilizáveis ficam em `src/components/states` com `role=status`, `role=alert` e `aria-live` quando aplicável.
