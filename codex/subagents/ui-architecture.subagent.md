# Subagent — UI Architecture

## Objetivo

Desenhar a decomposição de componentes da tela `/avisos`.

## Componentes recomendados

```text
src/pages/avisos/
├── AvisosPage.tsx ou manter Avisos.tsx como orquestrador
├── AvisosDesktopView.tsx
├── AvisosMobileView.tsx
├── NoticeHero.tsx
├── NoticeMetrics.tsx
├── NoticeSearchFilters.tsx
├── NoticeList.tsx
├── NoticeCard.tsx
├── NoticeDetailPanel.tsx
├── NoticePermissionFooter.tsx
├── NoticeDeleteDialog.tsx
└── notice-ui.helpers.ts
```

## Desktop

- grid com lista à esquerda e detalhe à direita;
- métricas no hero;
- filtros horizontais;
- seleção persistente;
- paginação no card da lista.

## Mobile

- cards empilhados;
- detalhe em modal/drawer;
- rodapé fixo com permissão;
- CTA contextual para abrir aviso selecionado.

## Regras

- Usar Tailwind e componentes existentes.
- Não usar tabela no mobile.
- Evitar CSS global.
- Preservar dark mode quando possível.
