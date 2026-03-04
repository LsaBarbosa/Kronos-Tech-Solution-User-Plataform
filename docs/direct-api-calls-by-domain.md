# Mapeamento de chamadas diretas em páginas por domínio

Este mapeamento lista as chamadas diretas identificadas em páginas para os domínios `users`, `employee`, `reports` e `companies`, além do status após a refatoração.

## employee
- `src/pages/Documentos.tsx`
  - `GET /employee?active=...` → **migrado** para `fetchEmployeesByActiveStatus` em `src/service/document.Service.ts`.
- `src/pages/DocumentoColaborador.tsx`
  - `GET /employee?active=...` → **migrado** para `fetchEmployeesByActiveStatus` em `src/service/document.Service.ts`.
- `src/pages/StatusRegistro.tsx`
  - `GET /employee?active=...` → **migrado** para `listEmployeesByStatus` em `src/service/employee.service.ts`.

## reports
- `src/pages/StatusRegistro.tsx`
  - `POST /records/report` → **migrado** para `fetchDetailedReport` em `src/service/reports.service.ts`.
  - `PUT /records/update/status/{employeeId}/{timeRecordId}` → **migrado** para `updateTimeRecordStatus` em `src/service/reports.service.ts`.
  - `PUT /records/toggle-activate/{employeeId}/{timeRecordId}` → **migrado** para `toggleRecordActivation` em `src/service/reports.service.ts`.

## companies
- `src/pages/CriarEmpresa.tsx`
  - `GET /companies/check-cnpj?cnpj=...` → **migrado** para `checkCnpjAvailability` em `src/service/companies.service.ts`.
  - `POST /companies` → **migrado** para `createCompany` em `src/service/companies.service.ts`.

## users
- Não foram encontradas chamadas diretas em páginas para endpoints do domínio `users` no escopo desta alteração.

## endpoints externos (fora do domínio principal)
- `src/pages/CriarEmpresa.tsx`
  - ViaCEP e HERE Geocoding → **migrado** para `geocodeAddressByPostalCode` em `src/service/companies.service.ts` preservando `credentials: "omit"`.
