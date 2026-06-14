# Subagent — Legacy Cleaner

## Objetivo

Remover a implementação visual antiga após a nova tela estar funcionando.

## Tarefas

1. Identificar JSX legado em `CriarColaborador.tsx`.
2. Remover classes antigas que não serão usadas.
3. Remover componentes internos não utilizados.
4. Remover imports mortos.
5. Manter hook e service quando continuarem válidos.
6. Rodar lint/build.
7. Garantir que não existam duas versões da UI renderizadas.

## Saída esperada

Lista de arquivos limpos e validação de que a rota renderiza apenas a nova experiência.
