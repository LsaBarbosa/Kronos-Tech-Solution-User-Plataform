# Subagent — QA Runner

## Missão
Executar comandos de validação e registrar resultados.

## Comandos obrigatórios

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
npm audit --audit-level=moderate
```

## Comandos condicionais

```bash
npm run test:e2e
npm run analyze
```

## Saída
Tabela com comando, status, saída resumida e impacto.
