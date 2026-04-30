# Inventário HTTP do Front-end

Este inventário lista os pontos do front-end que chamam o backend `flag/redis`.

| Service | Método | Endpoint | Observações |
|---|---|---|---|
| `auth.service.ts` | `POST` | `/auth/login` | Login por senha. |
| `auth.service.ts` | `POST` | `/auth/login-face` | Envia `livenessPassed` por contrato. |
| `auth.service.ts` | `POST` | `/auth/recover-password` | Recuperação de senha. |
| `auth.service.ts` | `POST` | `/auth/reset-password` | Reset de senha. |
| `company.service.ts` | `GET` | `/companies` | Consulta paginável. |
| `company.service.ts` | `GET` | `/companies/{cnpj}` | Consulta por CNPJ. |
| `company.service.ts` | `POST` | `/companies` | Criação. |
| `company.service.ts` | `PATCH` | `/companies/{cnpj}` | Atualização. |
| `company.service.ts` | `PATCH` | `/companies/{cnpj}/toggle-activate` | Ativação/inativação. |
| `geolocation.service.ts` | `POST` | `/geolocation/resolve` | Resolve CEP/número no backend. |
| `document.service.ts` | `GET` | `/documents` | `type` obrigatório em todas as chamadas. |
| `document.service.ts` | `POST` | `/documents` | Multipart com arquivo e metadados. |
| `document.service.ts` | `GET` | `/documents/{documentId}` | Download por ID. |
| `document.service.ts` | `DELETE` | `/documents/{documentId}` | Exclusão por ID. |
| `records.service.ts` | `POST` | `/records/report` | Relatório detalhado. |
| `records.service.ts` | `POST` | `/records/time-off/request` | Datas normalizadas para `dd-MM-yyyy`. |
| `records.service.ts` | `POST` | `/records/vacation-request` | Datas normalizadas para `dd-MM-yyyy`. |
| `records.service.ts` | `GET` | `/records/vacation-request` | Gestão de férias. |
| `records.service.ts` | `GET` | `/records/time-off/requests` | Gestão de abonos. |
| `fiscal.service.ts` | `GET` | `/legal/technical-certificate` | Download fiscal; trata `429`/`503`. |
| `fiscal.service.ts` | `GET` | `/legal/afd` | Download fiscal; trata `429`/`503`. |
| `fiscal.service.ts` | `GET` | `/legal/aej` | Usa período; trata `429`/`503`. |
| `fiscal.service.ts` | `GET` | `/legal/espelho-ponto` | `targetEmployeeId` é opcional para MANAGER/CTO. |

## Redis/Idempotência

Relatórios legais podem retornar:

- `429`: processamento em andamento.
- `503`: indisponibilidade temporária da camada Redis/lock.

As mensagens são centralizadas em `service-error.helper.ts` e refinadas em `admin-error-message.helper.ts`.

## Contratos Protegidos

- Documentos sempre exigem `type`.
- O front não chama provedores externos de geocoding.
- Os mocks MSW ficam em `src/test/msw/handlers/*` por domínio.
- `onUnhandledRequest: "error"` evita chamadas não mapeadas em teste.
