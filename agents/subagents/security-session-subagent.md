# Subagent — Segurança, sessão e cookie

## Missão

Diagnosticar por que a chamada `/legal/aej` retorna para login.

## Arquivos obrigatórios

```text
src/main/java/com/kts/kronos/config/SecurityConfig.java
src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticationFilter.java
src/main/java/com/kts/kronos/adapter/out/security/AuthCookieService.java
src/main/java/com/kts/kronos/adapter/out/security/JwtUtils.java
src/main/java/com/kts/kronos/adapter/out/security/TermsValidationFilter.java
src/main/java/com/kts/kronos/adapter/in/web/exceptions/DelegatedAuthenticationEntryPoint.java
src/main/java/com/kts/kronos/adapter/in/web/exceptions/JsonAccessDeniedHandler.java
src/main/resources/application-prod.yml
```

## Checks

1. Confirmar se o browser envia `KRONOS_ACCESS_TOKEN` no request `/legal/aej`.
2. Confirmar se backend recebe cookies no log/proxy.
3. Confirmar se token está expirado.
4. Confirmar se token está em blacklist.
5. Confirmar se `sessionVersion` diverge.
6. Confirmar se role é `MANAGER` ou `CTO`.
7. Confirmar se `AUTH_COOKIE_DOMAIN` bate com domínio real.
8. Confirmar se `SameSite=None` é necessário para o cenário real.
9. Confirmar se HTTPS está ativo, já que `Secure=true` exige HTTPS.

## Resultado esperado

Classificar o retorno para login em uma destas causas:

```text
COOKIE_NOT_SENT
TOKEN_EXPIRED
TOKEN_BLACKLISTED
SESSION_VERSION_MISMATCH
ROLE_FORBIDDEN
CORS_CREDENTIALS_FAILURE
UNKNOWN
```
