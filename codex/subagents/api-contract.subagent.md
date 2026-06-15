# Subagent — API Contract

## Objetivo

Garantir que a refatoração do header não quebre contratos com back-end.

## Contratos envolvidos

- autenticação/sessão via `AuthContext`;
- logout via `/auth/logout`;
- perfil via `loadSessionProfile`;
- termos via `checkTermsStatus`;
- check-in via `registerCheckin`;
- avisos via serviços existentes de mensagens, se usados.

## Regras

- Não criar endpoint novo.
- Não mudar payloads.
- Não inferir permissões além do que já existe.
- Falha em badge de avisos não pode derrubar o header.
- Falha de sessão deve seguir handler existente de sessão expirada.
