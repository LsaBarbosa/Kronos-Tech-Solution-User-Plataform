# Subagent — UI Architecture

## Objetivo

Desenhar a arquitetura de componentes da nova tela.

## Desktop

- hero institucional;
- métricas;
- painel de ações principais;
- solicitações recentes;
- painel lateral de governança;
- CTAs no contexto.

## Mobile

- topo compacto;
- métricas resumidas;
- cards de ações;
- card DPO/política;
- bottom CTA;
- modais/sheets para fluxos sensíveis.

## Regras

- Evitar duplicação de lógica entre desktop e mobile.
- Criar componentes pequenos e legíveis.
- Manter dados e handlers no nível adequado.
- Não quebrar componentes existentes de privacidade.
