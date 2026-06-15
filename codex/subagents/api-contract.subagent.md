# Subagent — API Contract

## Objetivo

Garantir que a nova UI use os contratos existentes sem alteração.

## Back-end esperado

- `GET /records/time-off/requests`
  - query: `page`, `size`, `status`, `employeeName?`
  - retorno: `TimeRecordPageResponse`

- `PATCH /records/time-off/approve/{timeRecordId}`
  - sem body
  - retorno esperado: `204`

- `PATCH /records/time-off/reject/{timeRecordId}`
  - sem body
  - retorno esperado: `204`

## Front-end esperado

- `listTimeOffRequests(params)`
- `approveTimeOff(timeRecordId)`
- `rejectTimeOff(timeRecordId)`
- `downloadDocument(documentId, fileName, employeeId)`

## Saída

- Confirmação de que nenhum contrato foi modificado.
- Lista de chamadas preservadas.
