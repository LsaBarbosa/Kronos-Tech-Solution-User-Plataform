# Subagent — API Contract

## Objetivo

Garantir que nenhum contrato HTTP seja alterado.

## Conferir no front-end

- `src/service/lgpd.service.ts`
- `src/config/api-routes.ts`
- componentes de termos e consentimentos

## Conferir no back-end

- `LgpdController`
- `TermsController`
- `PublicPrivacyController`, se usado por links públicos

## Proibições

- Não renomear payloads.
- Não trocar método HTTP.
- Não alterar URLs.
- Não alterar semântica de confirmação de exportação.
