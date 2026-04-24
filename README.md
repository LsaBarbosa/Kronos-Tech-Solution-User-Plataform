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
| `VITE_HERE_API_KEY` | Não | Chave temporária para geolocalização no navegador até existir endpoint backend dedicado. |

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
- A matriz de permissão do front está em [docs/permissions.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/permissions.md).
- Mudanças recomendadas para o backend estão em [docs/backend-required-changes.md](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/docs/backend-required-changes.md).

## Autenticação e sessão

- `AuthProvider` centraliza token, perfil e estado de sessão.
- `ProtectedRoute` impede vazamento de conteúdo durante `checking`.
- `RoleRoute` usa `APP_ROUTE_META` para bloquear acesso manual por URL.
- O aceite biométrico trata `GET /terms/status` como `boolean` e `POST /terms/accept-biometric` como retorno com novo token.

## Testes

- A suíte usa `MSW` com `onUnhandledRequest: "error"` para impedir rotas não mockadas.
- Os handlers base ficam em `src/test/mocks/handlers.ts`.
- Testes podem sobrescrever handlers por caso usando `server.use(...)`.

## Troubleshooting

- `npm` fora do `PATH`: garanta que o Node instalado pelo `nvm` esteja carregado no shell.
- `401/403` na navegação: verifique `VITE_API_BASE_URL` e o token salvo no storage.
- erro de geolocalização: a criação/edição de empresa depende de `VITE_HERE_API_KEY` até existir endpoint backend dedicado.
- teste falhando por rota não mockada: adicione ou atualize o handler em `src/test/mocks/handlers.ts`.
