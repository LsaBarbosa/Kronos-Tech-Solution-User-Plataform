# Subagent — Repo Mapper

## Missão
Mapear o estado atual do workspace antes de qualquer alteração.

## Tasks

1. Confirmar branch com `git branch --show-current`.
2. Capturar `git status --short`.
3. Localizar `auditoria-front-end.md`.
4. Mapear rotas em `src/App.tsx` e `src/config/app-routes.ts`.
5. Mapear páginas mencionadas na auditoria.
6. Mapear testes existentes por feature.
7. Registrar arquivos candidatos à alteração.

## Saída
Um resumo técnico para o agente principal com lista de arquivos e riscos de alteração.
