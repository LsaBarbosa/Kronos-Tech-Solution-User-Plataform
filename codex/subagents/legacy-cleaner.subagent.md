# Subagent — legacy-cleaner

## Objetivo
Remover código legado inline depois da nova implementação.

## Remover de `useDetailedReportBuilder.ts`

- `getStatusRGB` local.
- `timeToMinutes` local.
- `minutesToTime` local.
- `parseReportDate` local.
- montagem direta de `autoTable`.
- montagem direta de `headers` e `rows` CSV.
- constantes de cor locais do PDF.

## Garantir

- O hook continua exportando `handleDownloadPDF` e `handleDownloadCSV` no view model.
- As telas desktop/mobile não precisam ser reescritas se já chamam esses handlers.
- Nenhum import morto permanece.
