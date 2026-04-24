# Inventário HTTP do Front-end

## Objetivo

Mapear as chamadas HTTP ativas do front-end e classificar aderência ao backend atual.

## Matriz resumida

| Arquivo | Método | Endpoint | Domínio | Usa `api.ts` | Usa `fetch` | Token | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/service/auth.service.ts` | `POST` | `/auth/login` | autenticação | sim | não | não | válida |
| `src/service/auth.service.ts` | `POST` | `/auth/login-face` | autenticação | sim | não | não | válida |
| `src/service/auth.service.ts` | `POST` | `/auth/recover-password` | autenticação | sim | não | não | válida |
| `src/service/auth.service.ts` | `POST` | `/auth/reset-password` | autenticação | sim | não | não | válida |
| `src/service/company.service.ts` | `GET` | `/companies` | empresas | sim | não | sim | válida |
| `src/service/company.service.ts` | `GET` | `/companies/{cnpj}` | empresas | sim | não | sim | válida |
| `src/service/company.service.ts` | `GET` | `/companies/check-cnpj` | empresas | sim | não | sim | válida |
| `src/service/company.service.ts` | `POST` | `/companies` | empresas | sim | não | sim | válida |
| `src/service/company.service.ts` | `PATCH` | `/companies/{cnpj}` | empresas | sim | não | sim | válida |
| `src/service/company.service.ts` | `PATCH` | `/companies/{cnpj}/toggle-activate` | empresas | sim | não | sim | válida |
| `src/service/geolocation.service.ts` | `POST` | `/geolocation/resolve` | empresas | sim | não | sim | válida |
| `src/service/collaborator-management.service.ts` | `GET` | `/employee/check-cpf` | colaboradores | sim | não | sim | válida |
| `src/service/collaborator-management.service.ts` | `POST` | `/employee` | colaboradores | sim | não | sim | válida |
| `src/service/collaborator-management.service.ts` | `GET` | `/employee` | colaboradores | sim | não | sim | válida |
| `src/service/collaborator-management.service.ts` | `PATCH` | `/employee/manager/update-employee/{employeeId}` | colaboradores | sim | não | sim | válida |
| `src/service/collaborator-management.service.ts` | `POST` | `/users` | usuários | sim | não | sim | válida |
| `src/service/collaborator-management.service.ts` | `PATCH` | `/users/search/{userId}` | usuários | sim | não | sim | válida |
| `src/service/collaborator-management.service.ts` | `PATCH` | `/users/toggle-activate/{userId}` | usuários | sim | não | sim | válida |
| `src/service/user.service.ts` | `GET` | `/users/own-profile` | usuários | sim | não | sim | válida |
| `src/service/user.service.ts` | `GET` | `/users/search` | usuários | sim | não | sim | válida |
| `src/service/user.service.ts` | `PUT` | `/users/password` | usuários | sim | não | sim | válida |
| `src/service/user.service.ts` | `PATCH` | `/employee/update-own-profile` | usuários | sim | não | sim | válida |
| `src/service/document.service.ts` | `POST` | `/documents` | documentos | sim | não | sim | válida |
| `src/service/document.service.ts` | `GET` | `/documents?type=...` | documentos | sim | não | sim | válida |
| `src/service/document.service.ts` | `GET` | `/documents/{documentId}?employeeId?` | documentos | sim | não | sim | válida |
| `src/service/document.service.ts` | `DELETE` | `/documents/{documentId}?employeeId?` | documentos | sim | não | sim | válida |
| `src/service/message.service.ts` | `GET` | `/messages` | mensagens | sim | não | sim | válida |
| `src/service/message.service.ts` | `POST` | `/messages` | mensagens | sim | não | sim | válida |
| `src/service/message.service.ts` | `DELETE` | `/messages/{messageId}` | mensagens | sim | não | sim | válida |
| `src/service/records.service.ts` | `POST` | `/records/report` | ponto/relatórios | sim | não | sim | válida |
| `src/service/records.service.ts` | `GET` | `/records/pending-approvals` | ponto/ajustes | sim | não | sim | válida |
| `src/service/records.service.ts` | `PATCH` | `/records/approve/{timeRecordId}` | ponto/ajustes | sim | não | sim | válida |
| `src/service/records.service.ts` | `PATCH` | `/records/reject/{timeRecordId}` | ponto/ajustes | sim | não | sim | válida |
| `src/service/records.service.ts` | `POST` | `/records/vacation-request` | férias | sim | não | sim | válida |
| `src/service/records.service.ts` | `GET` | `/records/vacation-request` | férias | sim | não | sim | válida |
| `src/service/records.service.ts` | `PATCH` | `/records/vacation-request/approve` | férias | sim | não | sim | válida |
| `src/service/records.service.ts` | `PATCH` | `/records/vacation-request/reject` | férias | sim | não | sim | válida |
| `src/service/records.service.ts` | `POST` | `/records/time-off/request` | abonos | sim | não | sim | válida |
| `src/service/records.service.ts` | `GET` | `/records/time-off/requests` | abonos | sim | não | sim | válida |
| `src/service/records.service.ts` | `PATCH` | `/records/time-off/approve/{timeRecordId}` | abonos | sim | não | sim | válida |
| `src/service/records.service.ts` | `PATCH` | `/records/time-off/reject/{timeRecordId}` | abonos | sim | não | sim | válida |
| `src/service/terms.service.ts` | `GET` | `/terms/status` | termos | sim | não | sim | válida |
| `src/service/terms.service.ts` | `POST` | `/terms/accept-biometric` | termos | sim | não | sim | válida |
| `src/service/terms.service.ts` | `DELETE` | `/terms/revoke-biometric` | termos | sim | não | sim | válida |
| `src/service/fiscal.service.ts` | `GET` | `/legal/technical-certificate` | legal/fiscal | sim | não | sim | válida |
| `src/service/fiscal.service.ts` | `GET` | `/legal/afd` | legal/fiscal | sim | não | sim | válida |
| `src/service/fiscal.service.ts` | `GET` | `/legal/aej` | legal/fiscal | sim | não | sim | válida |
| `src/service/fiscal.service.ts` | `GET` | `/legal/espelho-ponto` | legal/fiscal | sim | não | sim | válida |

## Chamadas classificadas como obsoletas ou removidas

Não há uso ativo no código atual para:

- `/employees/create-partner`
- `/employees/create-manager`
- `/companies/list-basic`
- `/auth/username-availability`
- `/documents/me`
- `/documents/employee/{employeeId}`
- `/documents/upload`
- `/records/time-off-request`

## Observações

- Não há uso ativo de `fetch` em `src` para integrações de produção.
- Todas as chamadas internas ao backend passam por `api.ts`.
- As integrações críticas do sistema estão cobertas por testes unitários com MSW.
