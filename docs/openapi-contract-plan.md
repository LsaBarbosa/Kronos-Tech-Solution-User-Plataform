# Plano OpenAPI

## Fonte

O arquivo base de contrato fica em:

```text
docs/openapi/flag-redis.openapi.json
```

Ele representa os endpoints consumidos por este front contra o backend `flag/redis`.

## Geração

```bash
npm run generate:api-types
```

Saída esperada:

```text
src/generated/api/schema.d.ts
```

## Regra

- Services continuam usando `api` de `src/config/api.ts`.
- Tipos gerados servem para convergência gradual, sem reescrever a camada de service inteira.
- Endpoints fora de escopo deste front não entram como dependência de implementação.
