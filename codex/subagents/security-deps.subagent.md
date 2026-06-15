# Subagent — Security and Dependencies

## Missão
Corrigir vulnerabilidades e preservar segurança/LGPD.

## Tasks

1. Executar `npm audit --audit-level=moderate`.
2. Executar `npm audit fix` sem `--force`, se seguro.
3. Revalidar `package-lock.json`.
4. Conferir que `api.ts` mantém `withCredentials`, CSRF e retry controlado.
5. Conferir que nenhuma correção introduziu armazenamento sensível.
6. Conferir confirmações em exportação LGPD, exclusões e aprovações.

## Saída
Resumo de vulnerabilidades corrigidas e remanescentes.
