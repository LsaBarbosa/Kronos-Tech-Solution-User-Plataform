# Prompt para Codex CLI — Refatorar `/relatorio-detalhado`

Você é o agente de implementação do projeto Kronos.

## Contexto obrigatório

Observe estes repositórios e branches antes de editar:

```text
Back-end:  Kronos-Tech-Solutions-KTS             branch PROD_HOSTINGER_V2
Front-end: Kronos-Tech-Solution-User-Plataform   branch feature/lgpd-compliance-new-ui
Docs:      kronos-business                       branch main
```

A tela alvo é a rota:

```text
/relatorio-detalhado
```

O objetivo é refatorar a tela de relatório detalhado, hoje visualmente legada, para uma nova experiência baseada nos mockups e na diretriz visual.

## Referências visuais obrigatórias

Leia antes de implementar:

```text
references/docs/kronos_relatorio_detalhado_diretriz_visual.md
references/mockups/kronos_relatorio_detalhado_desktop.png
references/mockups/kronos_relatorio_detalhado_mobile.png
```

A diretriz define a tela como uma central de solicitação e geração de relatório de ponto, com regras por ROLE `CTO`, `MANAGER` e `PARTNER`.

## Arquivos do front-end que você deve ler

Leia estes arquivos antes de alterar:

```text
package.json
src/App.tsx
src/config/app-routes.ts
src/pages/RelatorioDetalhado.tsx
src/pages/RelatorioFiltros.tsx
src/components/ResultadosRelatorioDetalhado.tsx
src/components/ResultadosRelatorioDetalhado.utils.ts
src/components/RegistroEdicaoModal.tsx
src/service/records.service.ts
src/utils/report-utils.ts
src/utils/report-export.ts
src/context/AuthContext.tsx
src/components/PageShell.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
```

Busque também:

```bash
rg "RelatorioFiltros|ResultadosRelatorioDetalhado|fetchDetailedReport|relatorioDetalhado|/relatorio-detalhado" src
```

## Arquivos do back-end que você deve ler

No back-end, leia:

```text
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/ListReportRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TimeRecordResponse.java
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/application/port/in/usecase/TimeRecordUseCase.java
src/main/java/com/kts/kronos/application/service/TimeRecordService.java
```

Confirme que o contrato permanece:

```http
POST /records/report?employeeId={uuid opcional}
```

Body:

```json
{
  "reference": "08:00",
  "active": true,
  "dates": ["13-06-2026", "14-06-2026"],
  "statuses": ["CREATED", "ABSENCE"]
}
```

Não altere esse contrato.

## Regras de negócio obrigatórias

1. `reference` deve seguir `HH:mm`.
2. Deve haver pelo menos uma data selecionada.
3. `statuses` é opcional e multi-seleção.
4. `active` deve continuar no payload.
5. `employeeId` deve ser opcional em query param.
6. `PARTNER` não pode trocar colaborador.
7. `MANAGER` pode selecionar colaborador do tenant/equipe conforme serviço atual.
8. `CTO` deve ter comunicação visual de escopo administrativo, mas você não deve inventar endpoint de empresa se não existir.
9. PDF/CSV só podem ser habilitados após `reportData.length > 0`.
10. A edição de registro pós-resultado deve continuar funcionando se já existe no fluxo atual.

## Implementação esperada

### 1. Criar arquitetura de feature

Crie uma pasta:

```text
src/components/relatorio-detalhado/
```

Sugestão de componentes:

```text
DetailedReportDesktop.tsx
DetailedReportMobile.tsx
ReportRoleCards.tsx
ReportGovernancePanel.tsx
ReportDateChips.tsx
ReportStatusChips.tsx
ReportEmployeeSelector.tsx
ReportExpectedSummary.tsx
ReportResultsSummary.tsx
ReportActionFooter.tsx
report-ui.helpers.ts
```

Crie ou extraia hook:

```text
src/hooks/useDetailedReportBuilder.ts
```

O hook deve centralizar estado e handlers para desktop e mobile.

### 2. Refatorar `RelatorioDetalhado.tsx`

Transforme `RelatorioDetalhado.tsx` em orquestrador:

- `PageShell` preservado;
- hook compartilhado;
- desktop em `hidden lg:block`;
- mobile em `lg:hidden`;
- modal de edição preservado;
- resultados preservados;
- sem JSX legado extenso.

### 3. Desktop

Implemente a experiência do mockup desktop:

- sidebar/header preservados;
- hero com `Solicitação inteligente de relatório de ponto`;
- cards `CTO`, `MANAGER`, `PARTNER`;
- construtor de relatório;
- filtros densos;
- datas visíveis;
- painel de governança;
- resumo esperado;
- botões `Gerar relatório`, `Limpar filtros`, `Baixar PDF`, `Ver resultados`.

### 4. Mobile

Implemente a experiência do mockup mobile:

- topo compacto;
- escopo atual;
- etapas verticais;
- datas por chips;
- referência e status no mesmo card;
- explicação de visibilidade por ROLE;
- rodapé fixo com resumo e `Gerar relatório`.

### 5. Limpeza do legado

Depois de validar:

- remova o uso legado de `RelatorioFiltros` da rota `/relatorio-detalhado`;
- não delete `RelatorioFiltros.tsx` se `StatusRegistro` usa;
- remova imports mortos;
- remova componentes abandonados.

## Comandos finais obrigatórios

```bash
npm run lint
npm run build
```

Se houver testes:

```bash
npm test
```

## Resumo final esperado

Ao final, responda com:

- arquivos alterados;
- componentes criados;
- legado removido;
- comandos executados;
- resultado do build/lint;
- observações de risco, se houver.
