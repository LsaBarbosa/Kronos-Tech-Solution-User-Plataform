# Subagent — api-contract

## Objetivo

Garantir que os contratos HTTP sejam preservados.

## Ler

```text
src/service/records.service.ts
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/UpdateTimeRecordStatusRequest.java
```

## Validar

- `fetchDetailedReport` continua usando `POST /records/report`.
- `updateRecordStatus` continua usando `PUT /records/update/status/{employeeId}/{timeRecordId}`.
- `toggleRecordActivate` continua usando `PUT /records/toggle-activate/{employeeId}/{timeRecordId}`.
- Payload de status continua `{ statusRecord }`.
