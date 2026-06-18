# Subagent — API Contract

## Objetivo

Implementar consumo tipado de `GET /records/me/today`.

## Tarefas

- Adicionar rota em `api-routes` se necessário.
- Adicionar função em `records.service.ts`:
  - `fetchTodayTimeRecordStatus()`
- Usar `extractObject` ou normalizador padrão do projeto.
- Validar resposta defensivamente.
- Não alterar endpoint de check-in.

## Validação

- TypeScript compila.
- Service tem teste se o projeto já possuir padrão de teste de services.
