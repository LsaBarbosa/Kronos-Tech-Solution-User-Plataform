# Subagent — UI Architecture

## Objetivo

Criar arquitetura de UI clara, reutilizável e específica para a rota `/relatorio-detalhado`.

## Desktop

Implementar como construtor de relatório:

- hero largo com título `Solicitação inteligente de relatório de ponto`;
- cards de escopo `CTO`, `MANAGER`, `PARTNER`;
- grid de filtros em blocos compactos;
- seleção de datas por chips e calendário/dropdown quando necessário;
- painel direito com governança por ROLE;
- resumo esperado;
- botões `Gerar relatório`, `Limpar filtros`, `Baixar PDF`, `Ver resultados`.

## Mobile

Implementar como fluxo guiado:

- topo compacto com ROLE atual;
- card `Escopo atual`;
- etapa 1: datas;
- etapa 2: referência e status;
- etapa 3: o que aparece por ROLE;
- rodapé fixo com resumo e botão `Gerar relatório`.

## Componentização sugerida

```text
src/components/relatorio-detalhado/
├── DetailedReportDesktop.tsx
├── DetailedReportMobile.tsx
├── ReportScopeBadge.tsx
├── ReportRoleCards.tsx
├── ReportFilterField.tsx
├── ReportDateChips.tsx
├── ReportStatusChips.tsx
├── ReportGovernancePanel.tsx
├── ReportExpectedSummary.tsx
├── ReportResultsSummary.tsx
└── ReportActionFooter.tsx
```

## Estado compartilhado

Extrair o estado e handlers para `useDetailedReportBuilder`, ou manter no page component se ficar simples. Evitar duplicar regras em desktop e mobile.

## Estilo

Usar Tailwind e componentes atuais do projeto. Cores principais:

- `#0B1220` para topo/sidebar;
- `#2563EB` para CTA e seleção;
- `#7C3AED` para CTO;
- `#16A34A` para sucesso/trabalhadas;
- `#DC2626` para erro/saldo negativo;
- `#0D9488` para PARTNER;
- `#F8FAFC` para fundo.
