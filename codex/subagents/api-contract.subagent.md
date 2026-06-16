# Subagent — api-contract

## Objetivo
Garantir que a refatoração respeite contratos existentes.

## Front-end

Ler:

```text
src/service/records.service.ts
src/utils/report-utils.tsx
src/types/user.ts
```

Confirmar:

- `fetchDetailedReport(params)` usa `POST /records/report`.
- `employeeId` segue query param opcional.
- `DetailedReportItem` não contém CNPJ/cargo/CPF do colaborador selecionado, exceto se derivado do usuário autenticado quando aplicável.

## Back-end

Ler:

```text
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/ListReportRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TimeRecordResponse.java
```

Confirmar:

- `@PostMapping(REPORT)`.
- `@PreAuthorize(ANY_EMPLOYEE)`.
- `ListReportRequest.reference` exige `HH:mm`.
- `dates` segue padrão do back-end.
