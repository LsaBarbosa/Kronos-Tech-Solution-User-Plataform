# Subagent — repo-mapper

## Objetivo
Mapear estrutura, branch e pontos de entrada.

## Ler

```text
package.json
src/pages/RelatorioDetalhado.tsx
src/hooks/useDetailedReportBuilder.ts
src/components/relatorio-detalhado/**/*
src/utils/report-export.ts
src/utils/report-utils.tsx
src/service/records.service.ts
src/config/app-routes.ts
src/App.tsx
```

## Produzir

- Lista de arquivos que serão alterados.
- Lista de arquivos que serão criados.
- Confirmação de rota `/relatorio-detalhado`.
- Confirmação de chamadas PDF/CSV na UI desktop e mobile.
