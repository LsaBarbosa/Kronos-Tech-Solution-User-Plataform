# Diretrizes — Chat

## Gerais

- Trabalhar somente na branch `chat`.
- Usar TAWK.to como motor do atendimento.
- Usar o back-end para configuração e contexto.
- Usar FAQ consolidado antes do atendimento humano.
- Manter feature flag por ambiente.

## Desktop

- Criar fluxo próprio para telas largas.
- Exibir FAQ antes do chat.
- Evitar cobrir dashboards e tabelas.

## Mobile

- Criar fluxo próprio para telas pequenas.
- Usar bottom sheet ou entrada compacta.
- Evitar sobreposição com navegação inferior.

## Validação

Executar:

- `npm run lint`
- `npm run test`
- `npm run build`
