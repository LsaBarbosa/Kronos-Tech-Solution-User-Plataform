# Subagent — UI Architecture

## Objetivo

Projetar e implementar a arquitetura visual responsiva do header.

## Desktop

- layout horizontal;
- três zonas: esquerda, centro, direita;
- breadcrumb/rota;
- CTA textual;
- chips e badge.

## Mobile

- barra compacta;
- marca curta;
- menu em destaque;
- role chip;
- notificação por badge;
- CTA de ponto prioritário;
- texto reduzido.

## Componentização sugerida

- `HeaderBrand`
- `HeaderRouteContext`
- `HeaderSessionStatus`
- `HeaderRoleChip`
- `HeaderCheckinAction`
- `HeaderNotifications`
- `HeaderAccountMenu`

## Atenção

- evitar acoplamento excessivo no `Header.tsx`;
- manter helpers puros para route labels, iniciais, status e classes;
- preservar padrão do design system do projeto.
