# Skill — Auditoria e correção do fluxo AEJ

## Objetivo

Executar auditoria técnica e correção incremental do fluxo de geração do AEJ no Kronos, cobrindo front-end, back-end, segurança, assinatura digital, ambiente Hostinger e testes.

## Escopo obrigatório

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `PROD_HOSTINGER_v2`.
- Documentação: `kronos-business`, branch `main`.
- Fluxo: Auditoria Fiscal ⇒ AEJ ⇒ `GET /legal/aej?startDate=&endDate=`.

## Contexto funcional

O AEJ deve:

1. Exigir usuário autenticado.
2. Permitir apenas `MANAGER` e `CTO`.
3. Receber `startDate` e `endDate`.
4. Gerar conteúdo fiscal do período.
5. Incluir colaboradores, jornadas, marcações e ausências.
6. Assinar digitalmente o conteúdo.
7. Retornar arquivo `.p7s`.

## Diagnóstico a separar

Sempre classifique a falha em uma das categorias:

| Categoria | Status típico | Onde investigar |
|---|---:|---|
| Autenticação | `401` | Cookie, JWT, `sessionVersion`, blacklist, domínio, SameSite |
| Autorização | `403` | Role `MANAGER`/`CTO`, `@PreAuthorize` |
| Certificado digital | `500`/`503` | `DigitalSignatureService`, `DIGITAL_CERTIFICATE_PATH`, `DIGITAL_CERTIFICATE_PASSWORD` |
| Geração AEJ | `400`/`500` | Datas, registros, ausências, `AejService` |
| Front/download | erro no navegador | Blob error parsing, interceptor Axios, UX |

## Heurística principal

- Se o usuário volta para login, primeiro confirme `401`.
- Se o arquivo não é gerado, mas a sessão permanece, investigue `500`/certificado/generation.
- Não confunda falha de certificado com expiração de sessão.

## Arquivos críticos

### Back-end

```text
src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java
src/main/java/com/kts/kronos/application/service/AejService.java
src/main/java/com/kts/kronos/infrastructure/DigitalSignatureService.java
src/main/java/com/kts/kronos/config/SecurityConfig.java
src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticationFilter.java
src/main/java/com/kts/kronos/adapter/out/security/AuthCookieService.java
src/main/java/com/kts/kronos/adapter/out/security/TermsValidationFilter.java
src/main/java/com/kts/kronos/adapter/in/web/exceptions/RestExceptionHandler.java
src/main/resources/application-prod.yml
```

### Front-end

```text
src/pages/AuditoriaFiscal.tsx
src/features/fiscal-audit/useFiscalAuditViewModel.ts
src/service/fiscal.service.ts
src/config/api.ts
src/config/api-routes.ts
src/service/helpers/service-error.helper.ts
src/service/helpers/admin-error-message.helper.ts
```

## Comandos de verificação

### Back-end

```bash
./gradlew clean test
./gradlew test --tests '*AejService*'
./gradlew test --tests '*LegalController*'
```

### Front-end

```bash
npm install
npm run lint
npm run build
```

### Hostinger/VPS

```bash
printenv | grep -E 'AUTH_COOKIE|DIGITAL_CERTIFICATE|FRONTEND_ALLOWED_ORIGINS|JWT_EXPIRATION|SPRING_PROFILES_ACTIVE'
ls -lah "$DIGITAL_CERTIFICATE_PATH"
sudo -u deploy test -r "$DIGITAL_CERTIFICATE_PATH" && echo 'certificado legível'
journalctl -u kronos-backend -n 300 --no-pager | grep -E 'legal_aej|digital_signature|SESSION|/legal/aej|http_error'
```
