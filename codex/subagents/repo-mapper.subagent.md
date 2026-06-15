# Subagent — Repo Mapper

## Objetivo

Mapear o estado atual da rota `/ferias` antes de qualquer alteração.

## Tarefas

1. Confirmar branch atual:
   - `git branch --show-current`
2. Confirmar rota `/ferias` no router.
3. Localizar arquivo da página.
4. Localizar hooks e services usados.
5. Localizar componentes compartilhados que podem ser reaproveitados.
6. Identificar dependências de UI disponíveis.

## Saída esperada

Gerar um resumo com:

- arquivo da rota;
- componentes usados;
- hooks/services;
- tipos;
- pontos de legado que serão removidos;
- riscos técnicos.
