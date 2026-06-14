# Subagent — API Contract

## Responsabilidade

Garantir que a nova UI consuma os contratos existentes sem alterar o back-end.

## Endpoints obrigatórios

| Ação | Endpoint |
|---|---|
| Buscar conta | `GET /users/own-profile` |
| Buscar perfil | `GET /employee/own-profile` |
| Atualizar contato/endereço | `PATCH /employee/update-own-profile` |
| Trocar senha | `PUT /users/password` |
| Ver status de termo | `GET /terms/status` |
| Ver termo atual | `GET /terms/biometric/current` |
| Ver histórico de consentimentos | `GET /terms/consents/history` |
| Revogar biometria | `DELETE /terms/revoke-biometric` |
| Exportar dados próprios | `GET /lgpd/me/export` |
| Criar solicitação LGPD | `POST /lgpd/requests`, somente se necessário |
| Ver catálogo LGPD | `GET /lgpd/processing-catalog` |

## Arquivos front-end a revisar

- `src/service/user.service.ts`;
- `src/service/session-profile.service.ts`;
- `src/service/terms.service.ts`;
- `src/service/lgpd.service.ts`;
- `src/config/api.ts`;
- `src/config/api-routes.ts`;
- `src/types/user.ts`;
- `src/types/legal.ts`.

## Regras

- Não mudar nomes de endpoints.
- Não adicionar campo obrigatório que o back-end não exige.
- Não remover `confirmPassword` se o back-end espera o campo.
- Mutations devem passar pelo interceptor CSRF atual.
- Tratar `401` como sessão expirada.
- Tratar `403` como acesso negado ou CSRF, conforme helper existente.
- Não criar payloads com salário, role, empresa, escala ou biometria administrativa no fluxo de próprio perfil.

## Saída

- Confirmar que os serviços atuais continuam compatíveis.
- Criar apenas wrappers de alto nível se necessário.
- Não duplicar lógica HTTP sem motivo.
