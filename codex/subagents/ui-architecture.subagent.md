# Subagent — UI Architecture

## Objetivo

Projetar e implementar a nova arquitetura visual.

## Desktop

Criar estrutura:

- `ApprovalShell`;
- `ApprovalHero`;
- `ApprovalMetrics`;
- `ApprovalFilters`;
- `ApprovalInboxTable`;
- `ApprovalDetailPanel`;
- `ApprovalDecisionDialog`.

Os nomes são sugestões; adapte ao padrão do projeto.

## Mobile

Criar estrutura:

- `ApprovalMobileHeader`;
- `ApprovalMobileMetrics`;
- `ApprovalStatusChips`;
- `ApprovalRequestCard`;
- `ApprovalBottomDecisionPanel`.

## Regras

- Mobile não usa tabela.
- Desktop não usa apenas cards empilhados.
- Estados de loading e vazio são específicos por experiência.
- Evitar duplicação excessiva de lógica; compartilhar view-model e handlers.
