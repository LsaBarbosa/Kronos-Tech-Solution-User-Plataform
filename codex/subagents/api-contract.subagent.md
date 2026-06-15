# Subagent — API Contract

## Objetivo

Impedir quebra de contrato HTTP.

## Contratos

```text
GET /legal/technical-certificate
GET /legal/afd
GET /legal/aej?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

## Preservar

- `responseType: "blob"`.
- `Content-Disposition` para nome real do arquivo.
- fallback local de nome de arquivo.
- `dateToBackendDatePattern`.
- tratamento administrativo de erro.

## Proibido

- Enviar mês para AFD se o serviço não aceita.
- Enviar data para ATESTADO.
- Trocar GET por POST.
- Criar payload novo.
