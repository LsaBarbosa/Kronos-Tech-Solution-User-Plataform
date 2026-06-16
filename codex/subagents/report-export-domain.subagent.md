# Subagent — report-export-domain

## Objetivo
Modelar domínio de exportação sem depender de UI.

## Criar helpers para

- parsing de `HH:mm` e `-HH:mm`;
- soma de minutos;
- formatação `HH:mm` com sinal;
- derivação de competência;
- período inicial/final;
- contagem por status;
- tipo de evento derivado de `statusRecord`;
- status label;
- geolocalização coletada como `sim`, `nao` ou `parcial`;
- resumo contábil.

## Regras

- `IMPLICIT_BREAK` não entra no total trabalhado.
- `PENDING` não entra no total trabalhado.
- `TIME_OFF`, `DAY_OFF`, `VACATION` e `ABSENCE` devem ser contabilizados separadamente.
- Documento presente deve ser boolean derivado de `documentId`, `documentDownloadUrl` ou `documentDownloadPath`.
- Não exportar coordenadas precisas por padrão.
