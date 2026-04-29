# Frontend HTTP Inventory

Inventario das chamadas HTTP usadas pelo front-end.

## Auth

- `POST /auth/login`
- `POST /auth/login-face`
- `POST /auth/recover-password`
- `POST /auth/reset-password`

## Company

- `GET /companies`
- `GET /companies/:cnpj`
- `GET /companies/check-cnpj`
- `POST /companies`
- `PATCH /companies/:cnpj`
- `PATCH /companies/:cnpj/toggle-activate`
- `POST /geolocation/resolve` com `{ postalCode, number }`

## Documents

- `GET /documents?type=...`
- `GET /documents/:documentId`
- `DELETE /documents/:documentId`
- `POST /documents`

## Records

- `POST /records/report`
- `GET /records/pending-approvals`
- `PATCH /records/approve/:timeRecordId`
- `PATCH /records/reject/:timeRecordId`
- `POST /records/time-off/request`
- `GET /records/time-off/requests`
- `PATCH /records/time-off/approve/:timeRecordId`
- `PATCH /records/time-off/reject/:timeRecordId`
- `POST /records/vacation-request`
- `GET /records/vacation-request`
- `PATCH /records/vacation-request/approve`
- `PATCH /records/vacation-request/reject`

## Legal

- `GET /legal/technical-certificate`
- `GET /legal/afd`
- `GET /legal/aej`
- `GET /legal/espelho-ponto`

## Notes

- Os downloads legais usam o helper de erro compartilhado para exibir `429` e `503`.
- O espelho de ponto pode receber `targetEmployeeId` opcional.
- A listagem de documentos exige `type` em todas as chamadas.
- A geolocalizacao e resolvida exclusivamente pelo backend `flag/redis`; o front nao chama HERE, ViaCEP ou geocoding externo diretamente.
