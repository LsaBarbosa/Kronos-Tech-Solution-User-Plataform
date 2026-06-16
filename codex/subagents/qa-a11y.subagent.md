# Subagent — QA & A11y

## Objetivo
Validar qualidade, acessibilidade e responsividade.

## Tarefas
- Testar desktop em 1366, 1536 e 1920.
- Testar mobile em 390x844 e 430x932.
- Validar navegação por teclado.
- Validar labels e aria.
- Rodar:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
  - `npx vitest run`
- Criar ou ajustar testes unitários para helpers.

## Saída esperada
Lista de validações executadas e pendências.
