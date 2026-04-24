# Backend Required Changes

Não há bloqueadores de contrato obrigatórios em aberto para o escopo enterprise atual.

Observações:

- O front consome `POST /geolocation/resolve` como endpoint interno de geolocalização.
- O front normaliza `GET /records/vacation-request` tanto para array direto quanto para envelope paginado, sem depender de ajuste adicional do backend para funcionar corretamente.
