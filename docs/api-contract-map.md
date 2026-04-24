# API Contract Map

| Domínio | Método | Endpoint | Service | Tela/Hook | Payload | Retorno | Status |
|---|---|---|---|---|---|---|---|
| Auth | POST | `/auth/login` | `auth.service.ts` | `LoginForm`, `Login` | `{ username, password }` | `{ token }` | Aderente |
| Auth | POST | `/auth/login-face` | `auth.service.ts` | `FaceLoginModal` | `{ faceImageBase64, livenessPassed }` | `{ token }` | Aderente |
| Auth | POST | `/auth/recover-password` | `auth.service.ts` | `useForgotPassword`, `EsqueciSenha` | recuperação de senha | `204/200` | Aderente |
| Auth | POST | `/auth/reset-password` | `auth.service.ts` | `useResetPassword`, `ResetPassword` | reset de senha | `204/200` | Aderente |
| Terms | GET | `/terms/status` | `terms.service.ts` | fluxos de aceite biométrico | sem payload | `boolean` | Aderente |
| Terms | POST | `/terms/accept-biometric` | `terms.service.ts` | fluxos de aceite biométrico | sem payload | `{ token }` | Aderente |
| Terms | DELETE | `/terms/revoke-biometric` | `terms.service.ts` | `Usuario` | sem payload | `{ token }` | Aderente |
| Users | GET | `/users/own-profile` | `user.service.ts` | `AuthContext`, `session-profile.service.ts` | sem payload | perfil da conta | Aderente |
| Users | GET | `/users/search` | `records.service.ts` | `useManualRegister`, `RequestVacation` | `active=true` | lista de usuários | Aderente |
| Users | PUT | `/users/password` | `user.service.ts` | `useUser`, `Usuario` | troca de senha | `204/200` | Aderente |
| Employee | GET | `/employee/own-profile` | `employee.service.ts` | `AuthContext`, `Dashboard`, `Usuario` | sem payload | perfil do colaborador | Aderente |
| Employee | GET | `/employee` | `document.service.ts`, `records.service.ts` | documentos, relatórios, listagens | filtros `active`, paginação conforme tela | lista de colaboradores | Aderente |
| Employee | GET | `/employee/check-cpf` | `collaborator-management.service.ts` | `useCreateCollaborator` | `cpf` | disponibilidade | Aderente |
| Employee | POST | `/employee` | `collaborator-management.service.ts` | `CriarColaborador` | onboarding do colaborador | `{ employeeId }` | Aderente |
| Employee | PATCH | `/employee/manager/update-employee/:employeeId` | `collaborator-management.service.ts` | gestão de colaborador | patch parcial | `204/200` | Aderente |
| Companies | GET | `/companies` | `company.service.ts` | `Empresa`, `useUpdateCompanyForm` | sem payload | `{ companies }` | Aderente |
| Companies | GET | `/companies/:cnpj` | `company.service.ts` | `BuscarEmpresa`, `AtualizarEmpresa` | sem payload | detalhe da empresa | Aderente |
| Companies | GET | `/companies/check-cnpj` | `company.service.ts` | `useCreateCompany` | `cnpj` | disponibilidade via 404/200 | Aderente |
| Companies | POST | `/companies` | `company.service.ts` | `CriarEmpresa`, `useCreateCompany` | onboarding de empresa | `201/204` | Aderente |
| Companies | PATCH | `/companies/:cnpj` | `company.service.ts` | `AtualizarEmpresa`, `useUpdateCompanyForm` | atualização parcial | `204/200` | Aderente |
| Companies | PATCH | `/companies/:cnpj/toggle-activate` | `company.service.ts` | gestão de empresa | `{ active }` | `204/200` | Aderente |
| Geolocation | POST | `/geolocation/resolve` | `geolocation.service.ts` | `CriarEmpresa`, `AtualizarEmpresa` | `{ postalCode, number }` | `{ latitude, longitude }` | Aderente |
| Documents | GET | `/documents` | `document.service.ts` | `Documentos`, `useDocumentsPage`, `useMyDocuments` | `type` obrigatório, `employeeId` e `date` opcionais | lista de documentos | Aderente |
| Documents | POST | `/documents` | `document.service.ts` | `EnviarDocumentos`, `DocumentoColaborador` | `multipart/form-data` com `file`, `employeeId`, `type` | `201/204` | Aderente |
| Documents | GET | `/documents/:documentId` | `document.service.ts` | `Documentos`, `ResultadosRelatorioDetalhado` | `employeeId` opcional | blob + `Content-Disposition` | Aderente |
| Documents | DELETE | `/documents/:documentId` | `document.service.ts` | `Documentos`, `useEmployeeDocuments`, `useMyDocuments` | `employeeId` opcional | `204/200` | Aderente |
| Messages | GET | `/messages` | `message.service.ts`, `dashboard.service.ts` | `Avisos`, `Dashboard` | sem payload | `{ messages }` | Aderente |
| Messages | POST | `/messages` | `message.service.ts` | `CriarAviso` | payload de aviso | `201/204` | Aderente |
| Messages | DELETE | `/messages/:messageId` | `message.service.ts` | `Avisos` | sem payload | `204/200` | Aderente |
| Records | GET | `/records/pending-approvals` | `records.service.ts`, `dashboard.service.ts` | `PendingApprovals`, `Dashboard` | paginação e `employeeName` | página de aprovações | Aderente |
| Records | PATCH | `/records/approve/:timeRecordId` | `records.service.ts` | `PendingApprovals` | sem payload | `204/200` | Aderente |
| Records | PATCH | `/records/reject/:timeRecordId` | `records.service.ts` | `PendingApprovals` | sem payload | `204/200` | Aderente |
| Records | POST | `/records/report` | `records.service.ts` | `RelatorioDetalhado` | `{ reference, active, dates, statuses }` + `employeeId` opcional | lista detalhada | Aderente |
| Records | POST | `/records/vacation-request` | `records.service.ts` | `RequestVacation` | `{ startDate, endDate, managerId }` | `number[]` | Aderente |
| Records | GET | `/records/vacation-request` | `records.service.ts` | `VacationApprovals`, `useVacationCount` | paginação, status, `employeeName` | array direto ou envelope paginado normalizado pelo front | Aderente |
| Records | PATCH | `/records/vacation-request/approve` | `records.service.ts` | `VacationApprovals` | `{ timeRecordIds }` | `204/200` | Aderente |
| Records | PATCH | `/records/vacation-request/reject` | `records.service.ts` | `VacationApprovals` | `{ timeRecordIds }` | `204/200` | Aderente |
| Records | POST | `/records/time-off/request` | `records.service.ts` | `RequestManualRegistration` | multipart com parte `request` e `document` opcional | id numérico | Aderente |
| Records | GET | `/records/time-off/requests` | `records.service.ts` | `ManualRegisterApprovals`, `useTimeOffCount` | paginação, status, `employeeName`, `size` | página de registros | Aderente |
| Records | PATCH | `/records/time-off/approve/:timeRecordId` | `records.service.ts` | `ManualRegisterApprovals` | sem payload | `204/200` | Aderente |
| Records | PATCH | `/records/time-off/reject/:timeRecordId` | `records.service.ts` | `ManualRegisterApprovals` | sem payload | `204/200` | Aderente |
| Legal | GET | `/legal/technical-certificate` | `fiscal.service.ts` | `AuditoriaFiscal`, `Sidebar` | sem payload | blob | Aderente |
| Legal | GET | `/legal/afd` | `fiscal.service.ts` | `AuditoriaFiscal`, `Sidebar` | sem payload | blob | Aderente |
| Legal | GET | `/legal/aej` | `fiscal.service.ts` | `AuditoriaFiscal`, `Sidebar` | `startDate`, `endDate` | blob | Aderente |
| Legal | GET | `/legal/espelho-ponto` | `fiscal.service.ts` | `EspelhoPonto`, `Sidebar` | `startDate`, `endDate` | blob | Aderente |
