# Subagent — Repo Mapper

## Objetivo

Mapear o estado atual dos três repositórios antes da implementação.

## Checklist

1. Confirmar branches:
   - back-end: `PROD_HOSTINGER_V2`;
   - front-end: `feature/lgpd-compliance-new-ui`;
   - docs: `main`.
2. Identificar arquivo da rota:
   - `src/pages/RelatorioDetalhado.tsx`.
3. Confirmar rota:
   - `src/config/app-routes.ts` possui `relatorioDetalhado: "/relatorio-detalhado"`.
   - `src/App.tsx` renderiza `RelatorioDetalhado` em rota autenticada.
4. Procurar usos de:
   - `RelatorioFiltros`;
   - `ResultadosRelatorioDetalhado`;
   - `RegistroEdicaoModal`.
5. Mapear serviços:
   - `fetchDetailedReport`;
   - `fetchReportEmployees`;
   - `fetchManagerOptions`;
   - `updateTimeRecord`;
   - exportação PDF/CSV.

## Saída esperada

Antes de editar, criar uma nota local no terminal/resumo com:

- arquivos que serão alterados;
- arquivos que não podem ser removidos por serem compartilhados;
- riscos de regressão.
