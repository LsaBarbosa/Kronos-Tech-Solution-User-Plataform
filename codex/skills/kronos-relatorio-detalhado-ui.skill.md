# Skill — Kronos Relatório Detalhado UI

## Papel

Atuar como executor técnico de front-end para refatorar a rota `/relatorio-detalhado` do Kronos com base em documentos de negócio, mockups e contratos existentes.

## Objetivo de implementação

Criar uma nova experiência de relatório detalhado de ponto com:

- UI desktop em formato de construtor avançado;
- UI mobile em formato de fluxo guiado;
- mesma lógica de API;
- regras de ROLE preservadas;
- exportação habilitada somente após resultado;
- remoção do legado visual da rota após validação.

## Inputs obrigatórios

Ler, nessa ordem:

1. `references/docs/kronos_relatorio_detalhado_diretriz_visual.md`.
2. `references/mockups/kronos_relatorio_detalhado_desktop.png`.
3. `references/mockups/kronos_relatorio_detalhado_mobile.png`.
4. `src/pages/RelatorioDetalhado.tsx`.
5. `src/pages/RelatorioFiltros.tsx`.
6. `src/components/ResultadosRelatorioDetalhado.tsx`.
7. `src/components/ResultadosRelatorioDetalhado.utils.ts`.
8. `src/components/RegistroEdicaoModal.tsx`.
9. `src/service/records.service.ts`.
10. `src/utils/report-utils.ts`.
11. `src/utils/report-export.ts`.
12. `src/config/app-routes.ts`.
13. `src/context/AuthContext.tsx`.
14. Documentos do repositório `kronos-business` relacionados a rotas, ponto, perfis e relatórios.
15. Back-end `TimeRecordController`, `ListReportRequest`, `TimeRecordResponse`, `ApiPaths` e service/usecase de relatório.

## Capacidade esperada

- Mapear dependências antes de editar.
- Separar estado compartilhado de apresentação.
- Criar componentes específicos de `/relatorio-detalhado` sem quebrar outras rotas.
- Preservar `fetchDetailedReport`, `fetchReportEmployees`, `fetchManagerOptions`, `updateTimeRecord` e exportação existente.
- Validar permissões por `role` vindas do `useAuth`.
- Criar UX responsiva com experiências distintas, não apenas redimensionamento.

## Estratégia recomendada

Criar uma pasta de feature:

```text
src/components/relatorio-detalhado/
├── DetailedReportDesktop.tsx
├── DetailedReportMobile.tsx
├── ReportBuilderShell.tsx
├── ReportScopeCards.tsx
├── ReportDateSelector.tsx
├── ReportStatusSelector.tsx
├── ReportEmployeeSelector.tsx
├── ReportGovernancePanel.tsx
├── ReportExpectedSummary.tsx
├── ReportResultsLauncher.tsx
├── ReportFooterCta.tsx
└── report-ui.helpers.ts
```

Criar ou extrair hook:

```text
src/hooks/useDetailedReportBuilder.ts
```

O hook deve concentrar:

- datas selecionadas;
- carga horária de referência;
- colaborador selecionado;
- status selecionados;
- filtro ativo/inativo;
- dados de relatório;
- loading;
- exportação;
- edição de registro;
- regras por ROLE.

## Resultado técnico

A página `src/pages/RelatorioDetalhado.tsx` deve ficar como orquestradora curta:

- instancia o hook;
- renderiza `PageShell`;
- renderiza `DetailedReportDesktop` para desktop;
- renderiza `DetailedReportMobile` para mobile;
- mantém modal de edição se ainda fizer parte do fluxo;
- não contém marcação extensa de layout legado.
