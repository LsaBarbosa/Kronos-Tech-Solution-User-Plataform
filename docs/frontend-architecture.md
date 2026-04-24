# Arquitetura Técnica do Front-end

## Visão geral

O front-end segue uma arquitetura por domínio, com quatro regras centrais:

1. chamadas internas ao backend passam por `api.ts`
2. services encapsulam endpoint, payload, erro e normalização
3. hooks orquestram estado de UI e consumo de services
4. componentes e páginas não conhecem detalhes de endpoint

## Estrutura principal

- `src/config/api.ts`: client Axios central com interceptors
- `src/config/api-routes.ts`: rotas oficiais da API
- `src/service/*.service.ts`: camada oficial de integração por domínio
- `src/service/helpers/*`: normalização e padronização de erro
- `src/context/AuthContext.tsx`: sessão global
- `src/hooks/*`: orquestração de formulário, queries e mutações
- `src/pages/*`: composição de tela
- `src/test/*`: setup de testes e handlers MSW

## Padrão obrigatório de service

Cada service deve:

- usar `api.ts`
- usar `API_ROUTES` e `buildRoute`
- normalizar respostas com `response-normalizer.helper`
- propagar erros via `service-error.helper`
- expor funções pequenas e específicas por endpoint

Não usar:

- `fetch` para backend interno
- strings soltas de endpoint em componente
- parsing manual repetido de envelopes no componente

Exceção:

- integrações externas explícitas, como geocodificação, podem usar `fetch`

## Sessão e autenticação

- `AuthProvider` envolve a árvore da aplicação
- `ProtectedRoute` usa `AuthContext`
- o token é persistido via camada de browser/storage
- login com senha usa `POST /auth/login`
- login facial usa `POST /auth/login-face`
- logout é local

## Padrão de erro

Usar `src/service/helpers/service-error.helper.ts`.

Objetivo:

- transformar erros HTTP em `ServiceError`
- padronizar `401`, `403`, `404`, `409`, `500`
- evitar parsing duplicado em hooks e componentes

## Padrão de normalização

Usar `src/service/helpers/response-normalizer.helper.ts`.

Helpers principais:

- `extractArray`
- `extractObject`
- `extractPage`
- `safeString`
- `safeBoolean`
- `safeDate`

Objetivo:

- aceitar arrays diretos e envelopes
- evitar quebra por payload parcial
- manter parsing no service, não na UI

## Rotas da API

Cadastrar novas rotas em [src/config/api-routes.ts](/home/kronos/Documentos/Codigin/Kronos-Tech-Solution-User-Plataform/src/config/api-routes.ts).

Regras:

- evitar strings literais em services
- preferir `buildRoute(...)` para path params
- manter um namespace por domínio

## Como criar um novo service

1. definir rota em `api-routes.ts`
2. criar `src/service/<dominio>.service.ts`
3. usar `api.ts`
4. normalizar resposta
5. normalizar erro
6. criar teste unitário com MSW

## Como testar service com MSW

Arquivos-base:

- `src/test/setup.ts`
- `src/test/mocks/server.ts`

Padrão:

1. sobrescrever handler com `server.use(...)`
2. chamar o service
3. validar método, URL, body e retorno

## Endpoints oficiais por domínio

### Auth

- `POST /auth/login`
- `POST /auth/login-face`
- `POST /auth/recover-password`
- `POST /auth/reset-password`

### Companies

- `POST /companies`
- `GET /companies`
- `GET /companies/{cnpj}`
- `PATCH /companies/{cnpj}`
- `PATCH /companies/{cnpj}/toggle-activate`
- `GET /companies/check-cnpj`

### Employee

- `POST /employee`
- `GET /employee`
- `GET /employee/{employeeId}`
- `PATCH /employee/manager/update-employee/{employeeId}`
- `DELETE /employee/{employeeId}`
- `GET /employee/check-cpf`
- `GET /employee/own-profile`

### Users

- `POST /users`
- `GET /users/search`
- `GET /users/own-profile`
- `GET /users/check-username`
- `PUT /users/password`
- `PATCH /users/toggle-activate/{userId}`

### Documents

- `POST /documents`
- `GET /documents`
- `GET /documents/{documentId}`
- `DELETE /documents/{documentId}`

### Messages

- `POST /messages`
- `GET /messages`
- `DELETE /messages/{messageId}`

### Records

- `POST /records/report`
- `GET /records/pending-approvals`
- `PATCH /records/approve/{timeRecordId}`
- `PATCH /records/reject/{timeRecordId}`
- `POST /records/vacation-request`
- `GET /records/vacation-request`
- `PATCH /records/vacation-request/approve`
- `PATCH /records/vacation-request/reject`
- `POST /records/time-off/request`
- `GET /records/time-off/requests`
- `PATCH /records/time-off/approve/{timeRecordId}`
- `PATCH /records/time-off/reject/{timeRecordId}`

### Terms

- `GET /terms/status`
- `POST /terms/accept-biometric`

### Legal

- `GET /legal/technical-certificate`
- `GET /legal/afd`
- `GET /legal/aej`
- `GET /legal/espelho-ponto`
