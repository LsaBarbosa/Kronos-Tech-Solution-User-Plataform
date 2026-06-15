# Plano de ação — Refatoração `/relatorio-detalhado`

## Fase 0 — Preparação

### Task 0.1 — Confirmar branches

```bash
git status
git branch --show-current
```

Confirmar:

- back-end em `PROD_HOSTINGER_V2`;
- front-end em `feature/lgpd-compliance-new-ui`;
- docs em `main`.

### Task 0.2 — Ler referências visuais

Ler:

- `references/docs/kronos_relatorio_detalhado_diretriz_visual.md`;
- `references/mockups/kronos_relatorio_detalhado_desktop.png`;
- `references/mockups/kronos_relatorio_detalhado_mobile.png`.

Critério: registrar mentalmente que desktop é construtor avançado e mobile é fluxo guiado.

---

## Fase 1 — Mapeamento técnico

### Task 1.1 — Mapear rota e arquivos atuais

Ler:

```text
src/App.tsx
src/config/app-routes.ts
src/pages/RelatorioDetalhado.tsx
src/pages/RelatorioFiltros.tsx
src/components/ResultadosRelatorioDetalhado.tsx
src/components/ResultadosRelatorioDetalhado.utils.ts
src/components/RegistroEdicaoModal.tsx
```

### Task 1.2 — Mapear serviços e tipos

Ler:

```text
src/service/records.service.ts
src/utils/report-utils.ts
src/utils/report-export.ts
src/context/AuthContext.tsx
```

Confirmar:

- `fetchDetailedReport`;
- `fetchReportEmployees`;
- `fetchManagerOptions`;
- `updateTimeRecord`;
- PDF/CSV client-side;
- role vinda de `useAuth`.

### Task 1.3 — Mapear back-end

Ler no back-end:

```text
TimeRecordController.java
ListReportRequest.java
TimeRecordResponse.java
ApiPaths.java
TimeRecordUseCase.java
TimeRecordService.java
```

Confirmar contrato:

```http
POST /records/report?employeeId={optional}
```

Body:

```json
{
  "reference": "08:00",
  "active": true,
  "dates": ["13-06-2026"],
  "statuses": ["CREATED"]
}
```

---

## Fase 2 — Arquitetura da nova tela

### Task 2.1 — Definir estado compartilhado

Extrair ou reorganizar estado em:

```text
src/hooks/useDetailedReportBuilder.ts
```

O hook deve controlar:

- datas;
- referência;
- colaborador;
- status;
- ativo/inativo;
- resultados;
- loading;
- exportações;
- modal de edição;
- regras por ROLE.

### Task 2.2 — Criar componentes de feature

Criar pasta:

```text
src/components/relatorio-detalhado/
```

Componentes recomendados:

```text
DetailedReportDesktop.tsx
DetailedReportMobile.tsx
ReportRoleCards.tsx
ReportGovernancePanel.tsx
ReportDateChips.tsx
ReportStatusChips.tsx
ReportEmployeeSelector.tsx
ReportExpectedSummary.tsx
ReportActionFooter.tsx
ReportResultsPanel.tsx
report-ui.helpers.ts
```

### Task 2.3 — Atualizar `RelatorioDetalhado.tsx`

A página deve ficar como orquestradora:

- usa `PageShell`;
- injeta hook;
- renderiza desktop em `hidden lg:block`;
- renderiza mobile em `lg:hidden`;
- mantém `RegistroEdicaoModal` se necessário;
- não contém layout legado extenso.

---

## Fase 3 — Desktop

### Task 3.1 — Hero e governança

Implementar:

- breadcrumb visual `Kronos / Relatórios / Relatório detalhado`;
- badge `Visão por ROLE`;
- role atual;
- título `Solicitação inteligente de relatório de ponto`;
- cards `CTO`, `MANAGER`, `PARTNER`.

### Task 3.2 — Construtor de relatório

Implementar card com:

- escopo atual;
- carga horária `HH:mm`;
- status multi-seleção;
- colaborador;
- datas;
- filtro ativo/inativo;
- exportação após gerar.

### Task 3.3 — Painel direito

Implementar:

- governança por ROLE;
- resumo esperado;
- contadores estimados quando possível;
- `Baixar PDF` desabilitado sem dados;
- `Ver resultados` desabilitado sem dados.

---

## Fase 4 — Mobile

### Task 4.1 — Topo compacto

Implementar topo semelhante ao mockup:

- logo/ícone K;
- título `Relatório detalhado`;
- role atual;
- subtítulo `Solicitação por perfil`.

### Task 4.2 — Fluxo guiado

Implementar cards:

1. `Escopo atual`;
2. `Datas do relatório`;
3. `Referência e status`;
4. `Quem aparece?`.

### Task 4.3 — Rodapé fixo

Implementar rodapé com:

- resumo: quantidade de datas, referência, colaborador;
- chips `Sem resultados` ou `PDF após busca`;
- botão `Gerar relatório`.

---

## Fase 5 — Resultados e exportação

### Task 5.1 — Resultado pós-busca

Após `fetchDetailedReport`:

- mostrar resumo de resultados;
- permitir abrir resultados completos;
- manter edição de registro quando aplicável;
- manter download de documentos quando existente.

### Task 5.2 — Exportação

Preservar funções existentes:

- PDF;
- CSV, se ainda estiver exposto;
- bloqueio quando `reportData.length === 0`.

---

## Fase 6 — Limpeza e validação

### Task 6.1 — Remover legado da rota

- Remover uso legado de `RelatorioFiltros` em `/relatorio-detalhado`.
- Não remover `RelatorioFiltros` se `StatusRegistro` ainda usa.
- Remover imports mortos.

### Task 6.2 — Validar build

```bash
npm run lint
npm run build
```

### Task 6.3 — Validar manualmente

- Desktop com 1366px+.
- Mobile com 430px.
- ROLE `PARTNER`.
- ROLE `MANAGER`.
- ROLE `CTO`, quando disponível.
- Sem datas.
- Referência inválida.
- Com resultado.
- Exportação após resultado.
