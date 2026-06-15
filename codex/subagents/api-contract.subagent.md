# Subagent — api-contract

## Objetivo

Garantir que o front continue compatível com o back-end.

## Conferir

```http
POST /documents
GET /documents
GET /documents/{documentId}
DELETE /documents/{documentId}
```

## Para upload

```text
params:
- employeeId
- type

formData:
- file
```

## Saída esperada

- Contrato preservado.
- Nenhuma alteração necessária no back-end.
- Pontos de risco, se houver.
