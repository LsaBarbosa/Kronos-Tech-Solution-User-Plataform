# Mapa de Contrato HTTP

Front-end: `Kronos-Tech-Solution-User-Plataform`  
Branch front-end: `v4/fase4/limpeza`  
Back-end alvo: `Kronos-Tech-Solutions-KTS`  
Branch back-end: `flag/redis`

## Endpoints Consumidos

| Domínio | Endpoint | Status | Observação |
|---|---|---|---|
| Auth | `POST /auth/login` | Aderente | Login por senha via `auth.service.ts`. |
| Auth | `POST /auth/login-face` | Aderente | Envia `faceImageBase64` e `livenessPassed`; liveness real segue como melhoria enterprise. |
| Auth | `POST /auth/recover-password` | Aderente | Recuperação de senha delegada ao backend. |
| Auth | `POST /auth/reset-password` | Aderente | Reset por token temporário. |
| Terms | `GET /terms/status` | FORA_DE_ESCOPO_OUTRO_FRONT | Endpoint documentado para guarda de contrato; este front não implementa o fluxo de termo biométrico. |
| Terms | `POST /terms/accept-biometric` | FORA_DE_ESCOPO_OUTRO_FRONT | Endpoint documentado para guarda de contrato; este front não implementa o fluxo de termo biométrico. |
| Terms | `DELETE /terms/revoke-biometric` | FORA_DE_ESCOPO_OUTRO_FRONT | Endpoint documentado para guarda de contrato; este front não implementa o fluxo de termo biométrico. |
| Users | `GET /users/own-profile` | Aderente | Perfil de usuário autenticado. |
| Users | `GET /users/search` | Aderente | Busca administrativa de usuários. |
| Users | `PUT /users/password` | Aderente | Troca de senha do usuário. |
| Users | `POST /users` | Aderente | Criação administrativa de usuário. |
| Companies | `GET /companies` | Aderente | Lista empresas. |
| Companies | `GET /companies/{cnpj}` | Aderente | Consulta por CNPJ. |
| Companies | `GET /companies/check-cnpj` | Aderente | Verificação de disponibilidade. |
| Companies | `POST /companies` | Aderente | Criação de empresa. |
| Companies | `PATCH /companies/{cnpj}` | Aderente | Atualização de empresa. |
| Companies | `PATCH /companies/{cnpj}/toggle-activate` | Aderente | Ativação/inativação. |
| Geolocation | `POST /geolocation/resolve` | Aderente | Backend flag/redis expõe GeolocationController com POST /geolocation/resolve. |
| Employee | `GET /employee/own-profile` | Aderente | Perfil do colaborador autenticado. |
| Employee | `GET /employee` | Aderente | Lista colaboradores; usada em documentos e relatórios. |
| Employee | `GET /employee/check-cpf` | Aderente | Validação de CPF. |
| Employee | `POST /employee` | Aderente | Criação de colaborador. |
| Employee | `PATCH /employee/manager/update-employee/{employeeId}` | Aderente | Atualização administrativa. |
| Employee | `POST /employee/mark-messages-seen` | Aderente | Marca avisos como vistos. |
| Documents | `GET /documents` | Aderente | Sempre envia `type`; pode enviar `employeeId` e `date`. |
| Documents | `POST /documents` | Aderente | Upload multipart com `file`, `employeeId` e `type`. |
| Documents | `GET /documents/{documentId}` | Aderente | Download por `documentId`; o front não extrai ID de path textual. |
| Documents | `DELETE /documents/{documentId}` | Aderente | Exclusão por ID. |
| Messages | `GET /messages` | Aderente | Lista avisos. |
| Messages | `POST /messages` | Aderente | Criação de aviso. |
| Messages | `DELETE /messages/{messageId}` | Aderente | Exclusão de aviso. |
| Records | `POST /records/report` | Aderente | Relatório detalhado com payload tipado. |
| Records | `GET /records/pending-approvals` | Aderente | Aprovações pendentes. |
| Records | `PATCH /records/approve/{timeRecordId}` | Aderente | Aprovação de ajuste. |
| Records | `PATCH /records/reject/{timeRecordId}` | Aderente | Rejeição de ajuste. |
| Records | `POST /records/vacation-request` | Aderente | Datas enviadas em `dd-MM-yyyy`. |
| Records | `GET /records/vacation-request` | Aderente | Lista férias. |
| Records | `PATCH /records/vacation-request/approve` | Aderente | Aprovação em lote. |
| Records | `PATCH /records/vacation-request/reject` | Aderente | Rejeição em lote. |
| Records | `POST /records/time-off/request` | Aderente | Datas enviadas em `dd-MM-yyyy`. |
| Records | `GET /records/time-off/requests` | Aderente | Lista abonos/esquecimentos. |
| Records | `PATCH /records/time-off/approve/{timeRecordId}` | Aderente | Aprovação de abono. |
| Records | `PATCH /records/time-off/reject/{timeRecordId}` | Aderente | Rejeição de abono. |
| Legal/Fiscal | `GET /legal/technical-certificate` | Aderente | Pode retornar `429`/`503` por lock Redis. |
| Legal/Fiscal | `GET /legal/afd` | Aderente | Pode retornar `429`/`503` por lock Redis. |
| Legal/Fiscal | `GET /legal/aej` | Aderente | Usa `startDate`/`endDate`; pode retornar `429`/`503`. |
| Legal/Fiscal | `GET /legal/espelho-ponto` | Aderente | Aceita `targetEmployeeId?`; pode retornar `429`/`503`. |

## Fora de Escopo Desta Aplicação

Os fluxos de registro de ponto e termo biométrico pertencem a outro front-end. Este repositório mantém apenas guardas/documentação para evitar regressões de contrato.

## Convenções

- Todas as chamadas usam `src/config/api.ts`.
- Rotas são centralizadas em `API_ROUTES` e `buildRoute`.
- `GET /documents` exige `type`.
- Erros `429` e `503` são normalizados por `service-error.helper.ts`.
- Requisições Axios recebem `X-Correlation-Id`.
- Geolocalização é resolvida pelo backend; chaves externas não ficam no navegador.
