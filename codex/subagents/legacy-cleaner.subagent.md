# Subagent — Legacy Cleaner

## Objetivo

Remover o legado da rota `/relatorio-detalhado` após implementação e validação.

## Procedimento

1. Rodar busca por referências:

```bash
rg "RelatorioFiltros|ResultadosRelatorioDetalhado|RelatorioDetalhado|useDetailedReportBuilder|relatorio-detalhado" src
```

2. Se `RelatorioFiltros` for usado por `StatusRegistro`, não deletar.
3. Remover somente imports e JSX legado de `RelatorioDetalhado.tsx`.
4. Remover componentes novos descartados durante a implementação.
5. Garantir que `npm run build` não aponte imports mortos.
6. Registrar no resumo final o que foi removido e o que foi preservado por uso compartilhado.
