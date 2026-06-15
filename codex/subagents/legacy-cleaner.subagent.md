# Subagent — Legacy Cleaner

## Objetivo

Remover o legado depois da nova implementação estar funcional.

## Procurar

- classes antigas não usadas em `layout-colors.ts`;
- imports de `Header` duplicados;
- headers manuais em páginas;
- CSS legado específico do header;
- lógica de logout duplicada;
- CTA de ponto duplicado fora do header, quando não for parte de uma página específica.

## Regra

Remover apenas o que estiver comprovadamente morto. Não remover componentes públicos ou fluxos ainda utilizados.
