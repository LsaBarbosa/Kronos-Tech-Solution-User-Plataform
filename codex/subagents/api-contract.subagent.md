# Subagent — api-contract

## Missão

Validar que a refatoração não quebra integração com backend.

## Contrato esperado

### Listar documentos

```txt
GET /documents?employeeId=&date=&type=
```

### Download

```txt
GET /documents/{documentId}?employeeId=
```

### Excluir

```txt
DELETE /documents/{documentId}?employeeId=
```

### Colaboradores

```txt
GET /employee?active=
```

## Checklist

- `type` enviado como enum aceito.
- `employeeId` omitido ou enviado conforme role e estado.
- `date` enviado apenas se preenchido.
- download usa blob e `Content-Disposition`.
- exclusão remove item da lista local apenas após sucesso.
- erros continuam usando feedback já existente.
