# Subagent — Security LGPD

## Objetivo

Garantir que a nova área não crie brechas.

## Verificar

- Sem `localStorage`/`sessionStorage` para dados do ponto.
- Sem logs com payload completo.
- Sem exposição de geolocalização ou biometria no painel.
- `source` e `timezone` podem aparecer como metadados.
- Check-in segue modal e consentimento existentes.
- Erros devem ser genéricos, sem vazar stack ou payload.
