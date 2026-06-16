# Subagent — pdf-csv-architecture

## Objetivo
Criar a arquitetura de exportação PDF/CSV.

## Arquitetura sugerida

```text
src/features/detailed-report-export/
├── detailed-report-export.types.ts
├── detailed-report-export.helpers.ts
├── detailed-report-pdf.exporter.ts
├── detailed-report-csv.exporter.ts
└── __tests__/
    ├── detailed-report-export.helpers.test.ts
    └── detailed-report-csv.exporter.test.ts
```

## PDF

- `exportDetailedReportPdf(context): Promise<void>`.
- Usar `loadPdfLibraries()`.
- Usar `autoTable`.
- Gerar arquivo `relatorio_detalhado_ponto_<yyyyMMdd_HHmmss>.pdf`.
- Adicionar rodapé por página após `autoTable`.

## CSV

- `exportDetailedReportCsv(context): void`.
- Usar `downloadTextFile` ou `downloadCsvFile` corrigido.
- Gerar arquivo `relatorio_detalhado_ponto_<yyyyMMdd_HHmmss>.csv`.
- Uma linha por registro.

## Integração

`useDetailedReportBuilder.ts` deve apenas montar contexto e chamar os exportadores.
