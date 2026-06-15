# Subagent — Time-Off Approval Domain

## Objetivo

Traduzir o domínio de abono para componentes e estados de UI.

## Estados de status

- Filtro `PENDING`: pendentes.
- Status pendente real: `TIME_OFF_REQUEST` ou `WORK_TIME_REQUEST`.
- Aprovado: `TIME_OFF` ou `UPDATED`.
- Rejeitado: `TIME_OFF_REJECTED`, `WORK_TIME_REJECTED` ou `UPDATE_REJECTED`.

## Dados relevantes de cada registro

- `timeRecordId`
- `employeeId`
- `employeeData.employeeName`
- `startWork`
- `endWork`
- `startHour`
- `endHour`
- `hoursWork`
- `statusRecord`
- `documentId`/download path quando disponível

## Saída

- Mapa de status para label, cor e elegibilidade de ação.
- Critérios para métricas superiores.
- Modelo de solicitação selecionada.
