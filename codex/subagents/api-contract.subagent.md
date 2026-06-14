# Subagent — API Contract

## Objetivo

Impedir quebra de contrato HTTP.

## Endpoints

```http
GET /employee/check-cpf?cpf=
POST /employee
GET /users/check-username?username=
POST /users
```

## Tarefas

1. Confirmar payload atual de `createCollaborator`.
2. Confirmar payload atual de `createUser`.
3. Garantir que a UI nova chama os mesmos handlers.
4. Garantir que `preloadCsrfToken` continue antes das mutações.
5. Garantir que erros normalizados continuem exibidos por toast/feedback.
6. Não alterar `api-routes.ts`, salvo correção realmente necessária.

## Saída esperada

Checklist de compatibilidade API.
