# Plano de ação — Implementação correta do fluxo AEJ

## Fase 0 — Preparação

### Task 0.1 — Garantir branches corretas

```bash
# backend
git checkout PROD_HOSTINGER_V2
git pull

# frontend
git checkout PROD_HOSTINGER_v2
git pull

# documentação
git checkout main
git pull
```

### Task 0.2 — Criar branch de correção

Sugestão:

```bash
git checkout -b fix/auditoria-fiscal-aej-login-certificado
```

---

## Fase 1 — Diagnóstico real

### Task 1.1 — Reproduzir no navegador

- Abrir DevTools.
- Gerar AEJ.
- Capturar status de `GET /legal/aej`.
- Capturar se o request contém `KRONOS_ACCESS_TOKEN`.
- Capturar headers `X-Session-Revoked` e `X-Session-Revoked-Reason`.

### Task 1.2 — Reproduzir via curl

```bash
curl -i \
  -H 'Cookie: KRONOS_ACCESS_TOKEN=<token_do_browser>' \
  'https://kronostechsolutions.com/legal/aej?startDate=2026-06-01&endDate=2026-06-30' \
  --output /tmp/aej-response.bin
```

### Task 1.3 — Verificar logs

```bash
journalctl -u kronos-backend -n 500 --no-pager | grep -E 'legal_aej|digital_signature|SESSION|/legal/aej|http_error'
```

---

## Fase 2 — Correção por causa

### Task 2.1 — Se for `401`

- Verificar `AUTH_COOKIE_DOMAIN`.
- Verificar `AUTH_COOKIE_SAME_SITE`.
- Verificar `AUTH_COOKIE_SECURE`.
- Verificar `JWT_EXPIRATION`.
- Verificar se houve `sessionVersion` mismatch.
- Verificar se Nginx preserva cookies.

### Task 2.2 — Se for `403`

- Confirmar role do usuário.
- Confirmar se deveria ser `MANAGER`/`CTO`.
- Melhorar mensagem no front para “sem permissão”.

### Task 2.3 — Se for `500` com assinatura

- Validar `DIGITAL_CERTIFICATE_PATH`.
- Validar `DIGITAL_CERTIFICATE_PASSWORD`.
- Criar exceção específica para assinatura.
- Mapear erro controlado.
- Adicionar health/check seguro.

### Task 2.4 — Se for `500` com dados AEJ

- Validar registros do período.
- Validar ausências/férias/abonos sem `startWork`.
- Adicionar erro controlado para dados inconsistentes.

---

## Fase 3 — Implementação backend

### Task 3.1 — Melhorar erro de assinatura

Criar:

```text
src/main/java/com/kts/kronos/application/exceptions/DigitalSignatureException.java
```

Alterar:

```text
DigitalSignatureService.java
RestExceptionHandler.java
```

### Task 3.2 — Proteger escrita da resposta

Alterar `LegalController.downloadAej` para gerar em buffer antes de escrever no response:

```java
var buffer = new ByteArrayOutputStream();
aejUseCase.generateAej(companyId, startDate, endDate, buffer);
response.setContentType("application/pkcs7-signature");
response.setHeader(HttpHeaders.CONTENT_DISPOSITION, ...);
response.getOutputStream().write(buffer.toByteArray());
response.flushBuffer();
```

### Task 3.3 — Melhorar validação de dados AEJ

No `AejService`, tratar ausência com `startWork == null` como erro controlado.

### Task 3.4 — Adicionar logs estruturados

Adicionar contagens e motivo de falha sem dados pessoais.

---

## Fase 4 — Implementação frontend

### Task 4.1 — Converter erro Blob para JSON quando possível

Adicionar helper para ler `Blob` de erro:

```ts
const tryReadBlobError = async (data: unknown) => { ... }
```

### Task 4.2 — Melhorar mensagens fiscais

Atualizar `getAdministrativeErrorMessage(error, "fiscal")` para códigos:

```text
AUTHENTICATION_REQUIRED
SESSION_REVOKED
ACCESS_DENIED
DIGITAL_SIGNATURE_UNAVAILABLE
AEJ_INVALID_DATA
INTERNAL_ERROR
```

### Task 4.3 — Confirmar que apenas `401` redireciona login

Não disparar fluxo de sessão expirada para `500`/`503`.

---

## Fase 5 — Testes

### Task 5.1 — Back-end

```bash
./gradlew clean test
./gradlew test --tests '*AejService*'
./gradlew test --tests '*LegalController*'
```

### Task 5.2 — Front-end

```bash
npm run lint
npm run build
```

### Task 5.3 — Manual em produção

- Login como `MANAGER`.
- Gerar AEJ do mês atual.
- Confirmar download `.p7s`.
- Login como `PARTNER`.
- Confirmar `403` amigável.
- Remover temporariamente certificado em ambiente controlado.
- Confirmar erro de certificado sem logout.

---

## Fase 6 — Atualização documental

Atualizar `auditoria-aej.md` com:

- status real encontrado;
- causa raiz confirmada;
- arquivos alterados;
- testes executados;
- evidências dos logs;
- pendências de infraestrutura, se houver.
