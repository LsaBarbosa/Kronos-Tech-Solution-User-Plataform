# Subagent — API Contract

## Objetivo

Garantir compatibilidade total com o back-end `PROD_HOSTINGER_V2`.

## Contratos esperados

- `GET /messages?page=&size=`
- `POST /messages`
- `DELETE /messages/{messageId}`

## Conferir no front

- `API_ROUTES.MESSAGES`
- `fetchMessages`
- `postMessage`
- `deleteMessage`
- `useMessages`
- `CriarAviso.tsx`

## Conferir no back

- `ApiPaths.MESSAGES`
- `MessageController`
- `CreateMessageRequest`
- `MessageResponse`
- `MessagePriority`

## Saída

Informar:

- contrato preservado;
- qualquer divergência entre front e back;
- qualquer ajuste recomendado sem implementar back-end.
