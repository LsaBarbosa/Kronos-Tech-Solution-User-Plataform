# Subagent — Header Domain

## Objetivo

Garantir que o header represente corretamente sessão, role, segurança, LGPD, navegação e ação de ponto.

## Regras de negócio

- `PARTNER`: priorizar registrar ponto, documentos próprios, avisos, privacidade e solicitações próprias.
- `MANAGER`: priorizar registrar ponto, pendências, avisos, equipe e aprovações.
- `CTO`: priorizar visão administrativa, empresas, auditoria, inventário LGPD e governança.
- O header comunica contexto, mas não decide autorização final.
- O header deve refletir role e sessão carregadas pelo `AuthContext`.

## Validar

- role visível;
- status online/sessão protegida;
- consentimento/LGPD claro;
- CTA de ponto sempre disponível em contexto autenticado;
- logout seguro;
- notificações discretas.
