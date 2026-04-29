# API Contract Map

Mapa de aderencia entre o front-end e o backend.

## Status atual

| Dominio | Endpoint | Status | Observacao |
|---|---|---:|---|
| Auth | `POST /auth/login` | Aderente | Login por senha. |
| Auth | `POST /auth/login-face` | Aderente | Envia `livenessPassed` no payload. |
| Auth | `POST /auth/recover-password` | Aderente | Recuperacao de senha. |
| Auth | `POST /auth/reset-password` | Aderente | Reset de senha. |
| Terms | `GET /terms/status` | Aderente | Retorna `boolean`. |
| Terms | `POST /terms/accept-biometric` | Aderente | Aceite biometrico. |
| Terms | `DELETE /terms/revoke-biometric` | Aderente | Revogacao biometrica. |
| Documents | `GET /documents` | Aderente | Sempre envia `type`. |
| Documents | `GET /documents/:documentId` | Aderente | Download com `employeeId?`. |
| Documents | `DELETE /documents/:documentId` | Aderente | Delete com `employeeId?`. |
| Records | `POST /records/report` | Aderente | Relatorio detalhado. |
| Records | `GET /records/pending-approvals` | Aderente | Fluxo de aprovacao. |
| Legal | `GET /legal/technical-certificate` | Aderente | Pode retornar `429` ou `503`. |
| Legal | `GET /legal/afd` | Aderente | Pode retornar `429` ou `503`. |
| Legal | `GET /legal/aej` | Aderente | Pode retornar `429` ou `503`. |
| Legal | `GET /legal/espelho-ponto` | Aderente | Aceita `startDate`, `endDate` e `targetEmployeeId?`. |
| Geolocation | `POST /geolocation/resolve` | Aderente | Backend `flag/redis` expõe `GeolocationController` com `POST /geolocation/resolve`. |

## Regras de interesse

- `429` significa processamento em andamento ou rate limit do backend.
- `503` significa indisponibilidade temporaria da camada Redis.
- `targetEmployeeId` no espelho de ponto e opcional.
- O front nao resolve geolocalizacao diretamente no navegador.
- `POST /geolocation/resolve` recebe `{ postalCode, number }` e retorna latitude/longitude numericas.
