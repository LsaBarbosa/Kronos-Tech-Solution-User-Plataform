# Subagent — API Contract

## Objetivo
Garantir preservação dos contratos existentes.

## Tarefas
- Ler `src/service/lgpd.service.ts`.
- Confirmar endpoints administrativos:
  - `GET /lgpd/admin/requests/{requestId}`
  - assign
  - notes
  - complete
  - reject
  - transition-status
  - request-complement
  - cancel
  - anonymization-result
  - export
- Verificar DTOs no back-end.
- Não alterar assinatura dos services sem necessidade.
- Se criar hook, ele deve encapsular os mesmos services.

## Saída esperada
Garantia de compatibilidade front/back.
