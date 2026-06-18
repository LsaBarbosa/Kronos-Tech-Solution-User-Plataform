# Subagent — UI Architecture

## Objetivo

Adicionar o novo painel à dashboard existente.

## Desktop

- Inserir um bloco Today Workday na área onde hoje existe o check-in genérico.
- Exibir:
  - hero diário compacto;
  - status atual;
  - próxima ação;
  - último registro;
  - timeline;
  - source/timezone;
  - resumo de sequência.

## Mobile

- Usar experiência orientada à próxima ação:
  - status card;
  - timeline em cards;
  - resumo rápido;
  - origem/confiança;
  - CTA fixo ou CTA principal destacado.
- Não usar tabela.

## Restrições

- Não reescrever `Dashboard.tsx` inteiro.
- Não remover o bottom nav mobile atual sem necessidade.
- Não duplicar CTA de ponto de forma confusa.
