# Subagent — legacy-cleaner

## Objetivo

Remover código legado substituído sem apagar funcionalidades úteis.

## Remover

- tabela antiga dentro de `AdminLgpdRequests.tsx`, caso substituída;
- helpers duplicados;
- imports mortos;
- CSS morto.

## Preservar

- rota;
- entrypoint;
- detalhes;
- services;
- contratos;
- testes existentes.
