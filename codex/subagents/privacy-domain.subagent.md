# Subagent — Privacy Domain

## Objetivo

Garantir que a implementação respeite LGPD, consentimento biométrico, exportação, solicitações e transparência.

## Validar

- direitos LGPD contemplados;
- exportação com confirmação;
- solicitação LGPD com status textual;
- histórico de consentimento disponível;
- revogação explicada;
- catálogo, política e DPO acessíveis;
- nenhum dado biométrico sensível exibido.

## Contratos relevantes

- `POST /lgpd/requests`
- `GET /lgpd/requests`
- `GET /lgpd/me/export`
- `GET /lgpd/processing-catalog`
- `GET /terms/status`
- `GET /terms/biometric/current`
- `POST /terms/accept-biometric`
- `DELETE /terms/revoke-biometric`
- `GET /terms/consents/history`
