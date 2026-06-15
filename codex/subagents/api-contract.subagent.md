# Subagent — API Contract

## Objetivo

Preservar integração existente entre front-end e back-end.

## Arquivos a ler

### Front

- service de férias/time records;
- hook da tela `/ferias`;
- tipos usados por vacation requests;
- interceptors/cliente HTTP.

### Back

- `ApiPaths.java`;
- `TimeRecordController.java`;
- DTOs de vacation request;
- service/usecase relacionado.

## Checklist

- Endpoint de listagem confirmado.
- Query params confirmados.
- Endpoint de aprovação confirmado.
- Endpoint de rejeição confirmado.
- Payload confirmado.
- Tratamento de erro preservado.
- CSRF/cookie preservados pelo cliente HTTP atual.
