# Subagent — API Contract

## Objetivo

Validar que a nova UI consome o back-end sem alterar contrato.

## Endpoints principais

```http
POST /records/report?employeeId={uuid opcional}
PUT /records/update/time-record/{timeRecordId}
GET/PDF local via exportação client-side existente
```

## Payload de relatório

```ts
type DetailedReportQueryParams = {
  reference: string;
  active: boolean;
  dates: string[];
  statuses?: string[];
  employeeId?: string;
}
```

## Validações obrigatórias no front

- `reference` deve bater com `/^([01]\\d|2[0-3]):[0-5]\\d$/`.
- `dates.length > 0`.
- `dates` deve seguir o padrão já esperado pelo serviço atual.
- `statuses` só deve ser enviado quando tiver itens.
- `employeeId` deve ser enviado em query param apenas quando aplicável.

## Preservar serviços existentes

Não quebrar:

- `fetchDetailedReport`;
- `fetchReportEmployees`;
- `fetchManagerOptions`;
- `updateTimeRecord`;
- `downloadDocument` usado nos resultados;
- `loadPdfLibraries` e `downloadCsvFile`.

## Testes manuais mínimos

1. Buscar com data e referência válida.
2. Tentar buscar sem data.
3. Tentar referência inválida.
4. Buscar com status selecionado.
5. Buscar como `PARTNER` sem selector de colaborador.
6. Buscar como `MANAGER` com colaborador selecionado.
7. Gerar PDF após resultado.
8. Confirmar que PDF antes de resultado está bloqueado.
