# Subagent — Legacy Cleaner

## Objetivo

Remover legado após a nova implementação funcionar.

## Tarefas

1. Remover JSX antigo da página.
2. Remover estados locais que deixaram de ser usados.
3. Remover imports não utilizados.
4. Remover componentes auxiliares antigos sem uso.
5. Remover CSS/classes específicas antigas sem referência.
6. Confirmar que não há fallback visual antigo.
7. Rodar lint/build.

## Regra

Não remover hooks/services ainda usados por outras rotas.
