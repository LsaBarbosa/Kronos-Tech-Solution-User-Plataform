# OpenAPI Contract Plan

## Problema atual

Os contratos entre front e backend ainda sao mantidos manualmente.

## Risco observado

Branches diferentes podem divergir em endpoints como `/geolocation/resolve` sem aviso automatico.

## Proposta

- O backend expoe OpenAPI.
- O front gera tipos e cliente a partir do schema.
- O CI compara o contrato para evitar regressao.

## Ferramentas candidatas

- `openapi-typescript`
- `openapi-fetch`
- `swagger-codegen` se houver necessidade de geracao mais ampla

## Fases

1. Publicar o schema OpenAPI no backend.
2. Gerar tipos no front.
3. Trocar services manuais pelos contratos gerados onde fizer sentido.
4. Adicionar validação de compatibilidade no CI.

