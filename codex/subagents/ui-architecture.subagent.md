# Subagent — UI Architecture

## Objetivo

Definir e implementar a arquitetura visual desktop/mobile.

## Desktop

- Hero com métricas.
- Card de fila de solicitações com filtros.
- Lista densa, mas não obrigatoriamente tabela.
- Painel lateral de solicitação selecionada.
- Botões separados e confirmados.

## Mobile

- Header compacto.
- Métricas horizontais.
- Busca e chips.
- Cards empilhados.
- Painel fixo inferior.
- Detalhe/evidência em drawer/modal.

## Componentes sugeridos

- `TimeOffApprovalDesktop`
- `TimeOffApprovalMobile`
- `TimeOffApprovalMetrics`
- `TimeOffApprovalFilters`
- `TimeOffApprovalQueue`
- `TimeOffApprovalCard`
- `TimeOffApprovalDetailPanel`
- `TimeOffApprovalDecisionBar`
- `TimeOffApprovalConfirmDialog`
- `TimeOffApprovalStatusBadge`

## Saída

- Estrutura de componentes.
- Estratégia de breakpoint.
- Plano de remoção do legado.
