# Backend Required Changes

## Geolocalização

Hoje o front resolve latitude/longitude por serviços externos para não bloquear o cadastro e a edição de empresas.
Isso foi isolado em uma camada única no front para facilitar a troca futura por backend.

### Endpoint recomendado

`POST /geolocation/resolve`

Payload sugerido:

```json
{
  "postalCode": "00000000",
  "number": "123"
}
```

Resposta sugerida:

```json
{
  "latitude": -22.000000,
  "longitude": -43.000000
}
```

## Férias

O front aceita `GET /records/vacation-request` tanto como array direto quanto como envelope paginado.
Para previsibilidade de paginação, o backend deveria padronizar sempre um envelope com:

```json
{
  "requests": [],
  "totalPages": 0,
  "totalElements": 0,
  "currentPage": 0,
  "isFirst": true,
  "isLast": true
}
```
