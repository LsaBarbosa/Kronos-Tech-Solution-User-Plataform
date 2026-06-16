# Subagent — Certificado Digital e Infra

## Missão

Validar e corrigir o contexto do certificado digital usado para assinar AEJ e atestado técnico.

## Arquivos obrigatórios

```text
src/main/java/com/kts/kronos/infrastructure/DigitalSignatureService.java
src/main/resources/application.yml
src/main/resources/application-prod.yml
Dockerfile
docker-compose.yml
.env.example
README.md
```

## Variáveis obrigatórias

```text
DIGITAL_CERTIFICATE_PATH
DIGITAL_CERTIFICATE_PASSWORD
AUTH_COOKIE_SECURE
AUTH_COOKIE_SAME_SITE
AUTH_COOKIE_DOMAIN
FRONTEND_ALLOWED_ORIGINS
```

## Checks em produção

```bash
printenv | grep -E 'DIGITAL_CERTIFICATE|AUTH_COOKIE|FRONTEND_ALLOWED_ORIGINS'
ls -lah "$DIGITAL_CERTIFICATE_PATH"
sudo -u deploy test -r "$DIGITAL_CERTIFICATE_PATH" && echo OK
```

## Checks técnicos

1. O arquivo existe?
2. O usuário do processo consegue ler?
3. A senha abre o `PKCS12`?
4. Existe alias?
5. O alias possui chave privada?
6. O certificado está válido?
7. O algoritmo `SHA256withRSA` é compatível?

## Implementações esperadas se necessário

- Criar exceção `DigitalSignatureException`.
- Criar validação controlada de certificado.
- Criar health/check interno de assinatura sem expor segredo.
- Atualizar `.env.example` com variáveis de certificado.
- Documentar deploy do certificado na VPS.
