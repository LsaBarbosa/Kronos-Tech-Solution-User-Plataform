# Auditoria técnica — Falha no fluxo AEJ

**Projeto:** Kronos  
**Back-end:** `LsaBarbosa/Kronos-Tech-Solutions-KTS` — branch `PROD_HOSTINGER_V2`  
**Front-end:** `LsaBarbosa/Kronos-Tech-Solution-User-Plataform` — branch `PROD_HOSTINGER_v2`  
**Documentação:** `LsaBarbosa/kronos-business` — branch `main` + documentação técnica carregada no projeto  
**Fluxo:** Auditoria fiscal / geração de AEJ — Arquivo Eletrônico de Jornada  
**Sintoma informado:** ao tentar gerar AEJ, o sistema volta para a tela de login; arquivo não é gerado.

---

## 1. Conclusão executiva

A análise separa a falha em duas hipóteses principais, porque elas produzem sintomas diferentes:

| Hipótese | Evidência principal | Sintoma esperado | Probabilidade |
|---|---|---:|---:|
| Sessão/cookie/JWT inválido antes de chegar no controller AEJ | O endpoint `/legal/aej` exige autenticação e papel `MANAGER` ou `CTO`; o front usa Axios com `withCredentials`; o filtro JWT ignora requisição sem token ou token inválido, deixando o Spring responder `401`; o front trata `401` como sessão expirada/revogada. | Volta para login. | Alta |
| Falha de assinatura digital/certificado dentro do AEJ | O `AejService` sempre assina o conteúdo com `DigitalSignatureService`; o serviço exige `DIGITAL_CERTIFICATE_PATH` e `DIGITAL_CERTIFICATE_PASSWORD`; falha de arquivo/senha/certificado vira `RuntimeException` e depois erro genérico. | Erro `500`/toast de erro, não deveria redirecionar para login. | Alta para arquivo não gerado, média para retorno ao login |

**Diagnóstico provável:** o retorno para login indica que a chamada de download está recebendo `401` antes da geração do AEJ. Isso pode ser causado por cookie `KRONOS_ACCESS_TOKEN` ausente, expirado, com `domain/sameSite/secure` incompatível com o domínio real, token em blacklist, ou `sessionVersion` divergente. A ausência do arquivo também pode coexistir com erro de certificado, mas certificado normalmente aparece como `500`, não como redirecionamento para login.

---

## 2. Contrato funcional esperado

Segundo a documentação da plataforma, o fluxo legal/fiscal expõe:

| Fluxo | Endpoint | Entrada | Saída | Autorização |
|---|---|---|---|---|
| AEJ | `GET /legal/aej?startDate=&endDate=` | Query `startDate`, `endDate` | Arquivo `.p7s` | `MANAGER`/`CTO` |

Regra de negócio aplicável:

- AEJ depende de `startDate` e `endDate`.
- AEJ inclui colaboradores, jornadas, marcações e ausências.
- Resultado é assinado digitalmente.

---

## 3. Referências de código — Front-end

### 3.1 Página do fluxo

**Arquivo:** `src/pages/AuditoriaFiscal.tsx`  
**Branch:** `PROD_HOSTINGER_v2`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solution-User-Plataform/blob/PROD_HOSTINGER_v2/src/pages/AuditoriaFiscal.tsx`

A página monta o `viewModel` do fluxo fiscal e alterna entre experiência desktop/mobile:

- `FiscalDesktopView`
- `FiscalMobileView`
- `useFiscalAuditViewModel`

Trecho relevante: linhas 14–33.

### 3.2 ViewModel de auditoria fiscal

**Arquivo:** `src/features/fiscal-audit/useFiscalAuditViewModel.ts`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solution-User-Plataform/blob/PROD_HOSTINGER_v2/src/features/fiscal-audit/useFiscalAuditViewModel.ts`

Pontos encontrados:

- O tipo padrão do relatório é `AEJ`.
- O mês atual é usado como referência inicial.
- Para AEJ, o front calcula:
  - `startDate` = primeiro dia do mês;
  - `endDate` = último dia do mês;
  - chama `FiscalService.downloadAej(startDate, endDate)`.

Trecho relevante: linhas 27–58.

### 3.3 Service fiscal

**Arquivo:** `src/service/fiscal.service.ts`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solution-User-Plataform/blob/PROD_HOSTINGER_v2/src/service/fiscal.service.ts`

Pontos encontrados:

- `downloadAej` usa `api.get(...)`.
- Rota gerada: `buildRoute(API_ROUTES.LEGAL, LEGAL_PATHS.AEJ)` ⇒ `/legal/aej`.
- Envia `params: { startDate, endDate }`.
- Usa `responseType: "blob"`.
- Faz download do Blob recebido.

Trecho relevante: linhas 102–108.

### 3.4 Rotas do front

**Arquivo:** `src/config/api-routes.ts`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solution-User-Plataform/blob/PROD_HOSTINGER_v2/src/config/api-routes.ts`

Pontos encontrados:

- `API_ROUTES.LEGAL = "legal"`.
- `LEGAL_PATHS.AEJ = "aej"`.
- `buildRoute(...segments)` prefixa a rota com `/`.

Trecho relevante: linhas 5–19 e 36–40.

### 3.5 Axios e sessão

**Arquivo:** `src/config/api.ts`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solution-User-Plataform/blob/PROD_HOSTINGER_v2/src/config/api.ts`

Pontos encontrados:

- `api` usa `baseURL = VITE_API_BASE_URL` e `withCredentials: true`.
- Para `GET /legal/aej`, não há CSRF, pois CSRF só é injetado em `POST`, `PUT`, `PATCH`, `DELETE`.
- O interceptor de resposta trata `401` como sessão expirada/revogada e aciona o callback de sessão expirada.

Implicação: se `/legal/aej` retornar `401`, o comportamento esperado do front é tratar como sessão inválida e retornar para login.

---

## 4. Referências de código — Back-end

### 4.1 Controller legal

**Arquivo:** `src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java`

Pontos encontrados:

- Classe mapeada em `@RequestMapping("/legal")`.
- `downloadAej` expõe `@GetMapping("/aej")`.
- Exige `@PreAuthorize("hasAnyRole('MANAGER', 'CTO')")`.
- Recebe `startDate` e `endDate` como `LocalDate` em formato ISO.
- Resolve `companyId` pelo colaborador do usuário logado.
- Define response como `application/pkcs7-signature`.
- Chama `aejUseCase.generateAej(companyId, startDate, endDate, response.getOutputStream())`.

Trechos relevantes: linhas 112–128 e 155–159.

**Risco funcional:** qualquer ausência de autenticação, role inadequada ou token inválido impede a entrada no `AejService`.

### 4.2 Segurança HTTP

**Arquivo:** `src/main/java/com/kts/kronos/config/SecurityConfig.java`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/java/com/kts/kronos/config/SecurityConfig.java`

Pontos encontrados:

- `JwtAuthenticationFilter` é executado antes de `UsernamePasswordAuthenticationFilter`.
- `TermsValidationFilter` é executado depois do filtro JWT.
- Somente endpoints públicos específicos são liberados.
- Qualquer outra rota exige autenticação: `auth.anyRequest().authenticated()`.
- `/legal/aej` não está em `permitAll`.
- CSRF ignora apenas alguns endpoints `POST`; como AEJ é `GET`, CSRF não é o fator principal.

Trechos relevantes: linhas 100–129 e 131–166.

### 4.3 Filtro JWT

**Arquivo:** `src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticationFilter.java`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticationFilter.java`

Pontos encontrados:

- Extrai token via cookie (`AuthCookieService.extractToken`).
- Se token não existe, é inválido ou está em blacklist, deixa a cadeia continuar sem autenticação.
- Se `sessionVersion` do token diverge do usuário atual, retorna `401` com headers:
  - `X-Session-Revoked: true`
  - `X-Session-Revoked-Reason: SESSION_VERSION_MISMATCH`
  - body com `code = SESSION_REVOKED`.

Trechos relevantes: linhas 47–60 e 78–87.

**Conclusão:** o retorno para login é compatível com `401` por ausência/invalidade de cookie ou divergência de `sessionVersion`.

### 4.4 Cookie de autenticação

**Arquivo:** `src/main/java/com/kts/kronos/adapter/out/security/AuthCookieService.java`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/java/com/kts/kronos/adapter/out/security/AuthCookieService.java`

Pontos encontrados:

- Cookie padrão: `KRONOS_ACCESS_TOKEN`.
- Configura `httpOnly`, `secure`, `sameSite`, `path`, `domain` e `maxAge`.
- `extractToken` depende de `request.getCookies()` conter o cookie esperado.

Trechos relevantes: linhas 27–40, 63–72 e 75–87.

**Risco de produção Hostinger:** se o cookie foi emitido com `domain`, `SameSite` ou `Secure` incompatível com o host usado pelo navegador, a requisição `/legal/aej` chegará sem cookie e será tratada como não autenticada.

### 4.5 TermsValidationFilter

**Arquivo:** `src/main/java/com/kts/kronos/adapter/out/security/TermsValidationFilter.java`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/java/com/kts/kronos/adapter/out/security/TermsValidationFilter.java`

Pontos encontrados:

- O filtro mantém whitelist para `/auth`, `/terms`, `/v3/api-docs`, `/swagger-ui`, `/actuator`.
- O bloqueio global de termos foi removido.
- A validação de consentimento biométrico é granular nos serviços/controllers.

Trechos relevantes: linhas 28–34 e 49–52.

**Conclusão:** termo biométrico não parece bloquear globalmente `/legal/aej` nesta branch.

---

## 5. Referências de código — AEJ e certificado digital

### 5.1 AejService

**Arquivo:** `src/main/java/com/kts/kronos/application/service/AejService.java`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/java/com/kts/kronos/application/service/AejService.java`

Pontos encontrados:

- Valida intervalo por `LegalExportRangeGuard.validate(startDate, endDate)`.
- Busca empresa por `companyProvider.findById(companyId)`.
- Busca colaboradores por `employeeProvider.findByCompanyId(company.companyId())`.
- Busca registros por lote usando `recordRepository.findByEmployeeIdsAndRange(employeeIds, startDate.atStartOfDay(), endDate.atTime(23, 59, 59))`.
- Gera linhas tipos `01`, `02`, `03`, `04`, `05`, `07`, `08` e `99`.
- Monta o texto em `ISO_8859_1`.
- Assina o conteúdo por `signatureService.signData(originalContent)`.
- Escreve o conteúdo assinado no `OutputStream`.
- Falha de assinatura é classificada como `digital_signature` nas métricas.
- Qualquer `RuntimeException` dentro da geração é encapsulada como `FAILURE_TO_GENERAT_AEJ`.

Trechos relevantes: linhas 62–91 e conteúdo completo do arquivo.

### 5.2 DigitalSignatureService

**Arquivo:** `src/main/java/com/kts/kronos/infrastructure/DigitalSignatureService.java`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/java/com/kts/kronos/infrastructure/DigitalSignatureService.java`

Pontos encontrados:

- Exige `kronos.security.certificate.path`.
- Exige `kronos.security.certificate.password`.
- Abre o certificado com `new FileInputStream(certificatePath)`.
- Carrega `KeyStore.getInstance("PKCS12")`.
- Usa o primeiro alias do keystore.
- Obtém chave privada e certificado X.509.
- Assina com `SHA256withRSA` usando provider BouncyCastle.
- Gera CMS/PKCS#7 encapsulado.
- Em falha, lança `RuntimeException("Falha ao assinar documento digitalmente", e)`.

Trechos relevantes: linhas 38–42, 62–94 e 100–103.

### 5.3 Configuração de produção

**Arquivo:** `src/main/resources/application-prod.yml`  
**Referência:** `https://github.com/LsaBarbosa/Kronos-Tech-Solutions-KTS/blob/PROD_HOSTINGER_V2/src/main/resources/application-prod.yml`

Pontos encontrados:

- Cookies em produção estão configurados com `secure: true` e `same-site: "None"` no bloco `app.security.cookies`/CSRF.
- O cookie de autenticação usa variáveis próprias em `kronos.security.auth-cookie`:
  - `AUTH_COOKIE_NAME`
  - `AUTH_COOKIE_SECURE`
  - `AUTH_COOKIE_SAME_SITE`
  - `AUTH_COOKIE_PATH`
  - `AUTH_COOKIE_DOMAIN`
  - `AUTH_COOKIE_MAX_AGE_SECONDS`
- Certificado digital usa:
  - `DIGITAL_CERTIFICATE_PATH`
  - `DIGITAL_CERTIFICATE_PASSWORD`

Trechos relevantes: linhas 113–125, 127–136 e conteúdo completo do arquivo.

**Risco:** `app.security.cookies.same-site=None` e `kronos.security.auth-cookie.same-site` podem divergir se `AUTH_COOKIE_SAME_SITE` estiver como `Lax`. Para front/back em subdomínios diferentes ou caminhos/proxy específicos, o cookie de autenticação pode não ser enviado em chamadas XHR/Fetch.

---

## 6. Achados objetivos

### A-001 — `/legal/aej` é protegido e só aceita `MANAGER`/`CTO`

**Impacto:** se o usuário logado não tiver role `MANAGER` ou `CTO`, a chamada falha com `403`.  
**Evidência:** `LegalController.downloadAej` usa `@PreAuthorize("hasAnyRole('MANAGER', 'CTO')")`.

### A-002 — Retorno para login é compatível com `401`, não com falha de layout AEJ

**Impacto:** a falha visual descrita indica autenticação/sessão antes do fluxo de geração.  
**Evidência:** `JwtAuthenticationFilter` deixa seguir sem autenticação se não há cookie/token válido; `SecurityConfig` exige autenticação em qualquer rota não pública; o front trata `401` como sessão expirada/revogada.

### A-003 — Certificado digital é obrigatório para AEJ

**Impacto:** sem certificado `.p12/.pfx` acessível em `DIGITAL_CERTIFICATE_PATH` ou sem senha correta em `DIGITAL_CERTIFICATE_PASSWORD`, o arquivo AEJ não será gerado.  
**Evidência:** `AejService` sempre chama `signatureService.signData(originalContent)`; `DigitalSignatureService` abre o arquivo com `FileInputStream(certificatePath)` e carrega `PKCS12`.

### A-004 — Falha de assinatura vira erro genérico

**Impacto:** produção tende a retornar `500 INTERNAL_ERROR`, dificultando diagnóstico na tela.  
**Evidência:** `DigitalSignatureService` lança `RuntimeException("Falha ao assinar documento digitalmente", e)`; `AejService` encapsula como `FAILURE_TO_GENERAT_AEJ`; `RestExceptionHandler` transforma exceções inesperadas em `INTERNAL_ERROR`.

### A-005 — `AejService` tem risco de `NullPointerException` em ausências sem `startWork`

**Impacto:** registros de ausência/férias/abono sem `startWork` podem quebrar `generateType07`, embora o provider atual filtre por `startWork between`, o que tende a excluir nulos.  
**Evidência:** `generateType07` usa `r.startWork().toLocalDate()`; `TimeRecordProviderImpl.findByEmployeeIdsAndRange` usa consulta por `StartWorkBetween`.

### A-006 — Testes atuais cobrem assinatura mockada, mas não validam certificado real em ambiente de produção

**Impacto:** testes unitários podem passar mesmo com `DIGITAL_CERTIFICATE_PATH` inexistente na VPS.  
**Evidência:** `AejServiceTest` usa `when(signatureService.signData(any())).thenAnswer(...)` ou mock de falha; não carrega keystore real.

---

## 7. Como confirmar rapidamente na Hostinger

Executar após login no navegador e com DevTools aberto:

1. Abrir a tela de Auditoria Fiscal.
2. Clicar para gerar AEJ.
3. Conferir a chamada `GET /legal/aej?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.
4. Registrar:
   - status HTTP;
   - request headers: `Cookie` contém `KRONOS_ACCESS_TOKEN`?;
   - response headers: há `X-Session-Revoked`?;
   - response body: `SESSION_REVOKED`, `AUTHENTICATION_REQUIRED`, `ACCESS_DENIED`, `INTERNAL_ERROR`?
5. No servidor, conferir logs:
   - `event=legal_aej_generation result=failure reason=digital_signature`
   - `event=legal_digital_signature result=failure reason=digital_signature`
   - `event=http_error result=failure reason=unexpected path=/legal/aej`

Comandos úteis na VPS:

```bash
# validar variáveis do processo/serviço
printenv | grep -E 'AUTH_COOKIE|DIGITAL_CERTIFICATE|FRONTEND_ALLOWED_ORIGINS|JWT_EXPIRATION|SPRING_PROFILES_ACTIVE'

# validar arquivo do certificado
ls -lah "$DIGITAL_CERTIFICATE_PATH"
file "$DIGITAL_CERTIFICATE_PATH"

# validar leitura pelo usuário que roda o backend
sudo -u deploy test -r "$DIGITAL_CERTIFICATE_PATH" && echo 'certificado legível'

# validar porta/logs, ajuste conforme serviço real
journalctl -u kronos-backend -n 300 --no-pager | grep -E 'legal_aej|digital_signature|SESSION|/legal/aej|http_error'
```

---

## 8. Correção recomendada

### 8.1 Primeiro: confirmar se é `401`, `403` ou `500`

Não implementar às cegas. O comportamento de “voltar para login” deve ser vinculado ao status real.

| Status | Causa provável | Ação |
|---:|---|---|
| `401` | Cookie ausente/inválido, sessão expirada, token em blacklist, `sessionVersion` mismatch | Corrigir cookie/domínio/SameSite/secure/Nginx/expiração; revisar callback do front. |
| `403` | Usuário sem role `MANAGER`/`CTO` | Ajustar autorização, role ou UX. |
| `500` | Falha no certificado, assinatura, dados de ausência ou geração | Corrigir certificado/configuração e melhorar erro técnico. |

### 8.2 Backend

1. Criar exceção específica para falha de assinatura digital, por exemplo `DigitalSignatureException`.
2. Mapear essa exceção no `RestExceptionHandler` para resposta controlada, por exemplo:
   - status `503 SERVICE_UNAVAILABLE` ou `500` com código específico;
   - `code = DIGITAL_SIGNATURE_UNAVAILABLE`;
   - mensagem segura: “Assinatura digital indisponível. Verifique o certificado do sistema.”
3. Adicionar validação/health do certificado:
   - path preenchido;
   - arquivo existe;
   - arquivo é legível pelo usuário do processo;
   - keystore PKCS12 abre com a senha;
   - há alias e chave privada.
4. Melhorar `AejService.generateType07` para não quebrar silenciosamente com ausência sem data:
   - se `startWork == null`, lançar exceção de negócio controlada com identificação do `timeRecordId` minimizada;
   - ou ajustar modelagem para ausência possuir data obrigatória própria.
5. Adicionar logs estruturados sem dados sensíveis:
   - `companyId`, período, contagem de colaboradores, contagem de registros, motivo da falha.
6. Garantir que o controller não escreva headers de arquivo antes da geração quando a geração pode falhar, ou gerar em `ByteArrayOutputStream` antes de comprometer a resposta.

### 8.3 Front-end

1. Para download de Blob, tratar erros JSON retornados como Blob.
2. Diferenciar mensagens:
   - `401`: sessão expirada ou inválida;
   - `403`: sem permissão;
   - `DIGITAL_SIGNATURE_UNAVAILABLE`: certificado/assinatura indisponível;
   - `INTERNAL_ERROR`: erro técnico.
3. Confirmar que `VITE_API_BASE_URL` aponta para o domínio correto do backend e que o navegador envia `KRONOS_ACCESS_TOKEN` no request.

### 8.4 Infra/Hostinger

1. Montar o certificado em caminho estável, por exemplo `/opt/kronos/certs/kronos-signature.p12`.
2. Definir:

```bash
DIGITAL_CERTIFICATE_PATH=/opt/kronos/certs/kronos-signature.p12
DIGITAL_CERTIFICATE_PASSWORD=<senha_real>
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
AUTH_COOKIE_DOMAIN=kronostechsolutions.com
FRONTEND_ALLOWED_ORIGINS=https://kronostechsolutions.com,https://www.kronostechsolutions.com
```

3. Garantir HTTPS real até o navegador.
4. Garantir que Nginx preserve headers e cookies.

---

## 9. Critérios de aceite

- Usuário `MANAGER` autenticado gera AEJ `.p7s` para mês válido.
- Usuário `CTO` autenticado gera AEJ `.p7s` para mês válido.
- Usuário `PARTNER` recebe `403` e mensagem de permissão, sem logout indevido.
- Usuário sem cookie recebe `401` e volta ao login apenas nesse caso.
- Certificado ausente retorna erro controlado com código específico, sem stack trace e sem logout.
- Logs diferenciam `authentication`, `authorization`, `digital_signature` e `generation`.
- Testes unitários e WebMvc cobrem sucesso, `401`, `403`, certificado indisponível e período inválido.

---

## 10. Arquivos que o Codex deve ler obrigatoriamente

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
src/main/java/com/kts/kronos/application/port/out/provider/TimeRecordProvider.java
src/main/java/com/kts/kronos/adapter/out/persistence/impl/TimeRecordProviderImpl.java
src/main/resources/application-prod.yml
src/test/java/com/kts/kronos/application/service/AejServiceTest.java
src/test/java/com/kts/kronos/application/service/AejServiceFeature52RangeQueryTest.java
src/test/java/com/kts/kronos/adapter/in/web/http/webmvc/LegalControllerWebMvcTest.java
src/test/java/com/kts/kronos/adapter/in/web/http/LegalControllerSecurityTest.java
```

### Front-end

```text
src/pages/AuditoriaFiscal.tsx
src/features/fiscal-audit/useFiscalAuditViewModel.ts
src/features/fiscal-audit/components/FiscalDesktopView.tsx
src/features/fiscal-audit/components/FiscalMobileView.tsx
src/features/fiscal-audit/utils/fiscal-helpers.ts
src/service/fiscal.service.ts
src/config/api.ts
src/config/api-routes.ts
src/config/app-routes.ts
src/service/helpers/service-error.helper.ts
src/service/helpers/admin-error-message.helper.ts
```

### Documentação

```text
kronos_back-end_fluxos_aplicacao.md
kronos_back-end_regras_negocio.md
kronos_back-end_entradas_saidas_fluxos.md
kronos_back-end_arquitetura_pastas_projeto.md
kronos_back-end_entidades.md
```

---

## 11. Causa raiz consolidada (pós-fix)

O sintoma "geração AEJ devolve o usuário para login" tinha **duas causas convivendo**:

1. **Interceptor do front tratava qualquer `401` como sessão expirada**, inclusive em chamadas `responseType: "blob"`. Quando o backend respondia 401 numa policy/autorização específica do endpoint AEJ (sem `X-Session-Revoked`), o front disparava `onSessionExpired("expired")` e redirecionava ao login antes de exibir o toast — escondendo o erro real.
2. **Falha de assinatura digital virava `500 INTERNAL_ERROR` genérico**. `DigitalSignatureService` lançava `RuntimeException` que era envelopada por `AejService` como `FAILURE_TO_GENERAT_AEJ` e o handler global emitia `INTERNAL_ERROR`. Não havia tipo de erro distinguível no front. Em produção, qualquer ausência do `.p12` ou senha errada virava 500 opaco, sem código que orientasse o operador.
3. **NPE oculto em `AejService.generateType07`** quando um `TimeRecord` de ausência (`StatusRecord.VACATION/TIME_OFF/ABSENCE`) não tinha `startWork`. O provider atual filtra por `StartWorkBetween`, então no caminho feliz isso não dispara — mas com qualquer registro inserido manualmente sem `startWork`, o serviço quebra com NPE genérico.

---

## 12. Alterações implementadas

### 12.1 Back-end (`Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`)

| Arquivo | Mudança |
|---|---|
| `src/main/java/com/kts/kronos/application/exceptions/DigitalSignatureException.java` | **Novo.** `RuntimeException` tipada para falhas de assinatura digital, com construtores `(String)` e `(String, Throwable)`. JavaDoc proíbe vazar path/senha na mensagem. |
| `src/main/java/com/kts/kronos/infrastructure/DigitalSignatureService.java` | Adicionado `validateCertificateConfig()` pré-execução: rejeita path em branco, senha nula, arquivo inexistente, arquivo sem permissão de leitura. `signData` agora traduz `FileNotFoundException`, `UnrecoverableKeyException`, `IOException` (heurística de senha incorreta), `GeneralSecurityException`/`CMSException`/`OperatorCreationException` em mensagens genéricas, sem revelar path nem senha. Outer-catch faz log estruturado (sem mensagem de exceção, apenas `class.simpleName` e tipo da causa) e propaga `DigitalSignatureException`. |
| `src/main/java/com/kts/kronos/application/service/AejService.java` | Bloco de assinatura agora possui `catch (DigitalSignatureException) { throw; }` antes do `catch (RuntimeException)` para evitar envelopamento como `FAILURE_TO_GENERAT_AEJ`. Idem no outer catch da geração. `generateType07` usa fallback `startWork → endWork → LocalDate.now()` com log de warning quando ambos forem nulos, evitando NPE. |
| `src/main/java/com/kts/kronos/adapter/in/web/exceptions/RestExceptionHandler.java` | Novo `@ExceptionHandler(DigitalSignatureException.class)` → HTTP `503 SERVICE_UNAVAILABLE` com `code = DIGITAL_SIGNATURE_UNAVAILABLE` e mensagem segura. Log de erro só com tipo da exceção (sem mensagem). |
| `src/test/java/com/kts/kronos/application/service/AejServiceTest.java` | Renomeado `shouldWrapSignatureFailure` para refletir propagação (não-envelopamento) de `DigitalSignatureException`. Adicionado `shouldGenerateType07ForAbsenceWithoutStartWork` validando o fallback. |
| `src/test/java/com/kts/kronos/infrastructure/DigitalSignatureServiceTest.java` | Atualizado `shouldWrapCertificateLoadingFailure` e `shouldWrapCertificateLoadingFailureWithNullPayload` para esperar `DigitalSignatureException` com mensagem segura (sem path/senha). Adicionado `shouldFailWhenCertificatePathIsBlank` validando rejeição precoce de configuração ausente. |

### 12.2 Front-end (`Kronos-Tech-Solution-User-Plataform`, branch `PROD_HOSTINGER_v2`)

| Arquivo | Mudança |
|---|---|
| `src/config/api.ts` | (a) Interceptor de resposta agora parseia `Blob` JSON ANTES de extrair `code`/`message`, recuperando o payload de erro do backend que o axios entrega como Blob em respostas `responseType: "blob"`. (b) Em `401` sem `X-Session-Revoked` nem código `SESSION_REVOKED`, requisições `blob` não disparam mais `onSessionExpired("expired")` — apenas propagam o erro para o caller. O logout continua disparando normalmente em chamadas não-blob seguintes. |
| `src/service/helpers/admin-error-message.helper.ts` | Reconhece `code === "DIGITAL_SIGNATURE_UNAVAILABLE"` no domínio fiscal e retorna mensagem dedicada: "Assinatura digital indisponível no momento. Verifique o certificado configurado e tente novamente." |

### 12.3 O que NÃO foi alterado (por design)

- `@PreAuthorize("hasAnyRole('MANAGER', 'CTO')")` no `LegalController.downloadAej` — mantido. `PARTNER` continua recebendo 403.
- Assinatura digital NÃO foi desligada em produção — apenas seu tratamento de erro.
- Cookies, CORS e `SecurityConfig` — não alterados; eventuais problemas de cookie em produção são separados deste fix e são tratados na seção 13.
- Logs nunca registram CPF, PIS, JWT, path do certificado, senha ou conteúdo do keystore.

---

## 13. Variáveis de ambiente exigidas em produção (Hostinger)

Verificar na VPS após o deploy:

```bash
DIGITAL_CERTIFICATE_PATH=/opt/kronos/certs/kronos-signature.p12
DIGITAL_CERTIFICATE_PASSWORD=<senha_real_do_keystore>
AUTH_COOKIE_NAME=KRONOS_ACCESS_TOKEN
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
AUTH_COOKIE_PATH=/
AUTH_COOKIE_DOMAIN=kronostechsolutions.com
AUTH_COOKIE_MAX_AGE_SECONDS=28800
FRONTEND_ALLOWED_ORIGINS=https://kronostechsolutions.com,https://www.kronostechsolutions.com
```

Sanidade do arquivo do certificado:

```bash
ls -lah "$DIGITAL_CERTIFICATE_PATH"      # existe e tem tamanho compatível com .p12
file "$DIGITAL_CERTIFICATE_PATH"          # "data" ou "PKCS#12 keystore"
sudo -u <usuario_do_processo> test -r "$DIGITAL_CERTIFICATE_PATH" && echo OK
```

A senha **nunca** deve estar em arquivo de log, dump, ou histórico de shell.

---

## 14. Validações executadas

### 14.1 Testes back-end (Gradle)

```bash
./gradlew clean test
```

Resultado pós-fix:

- `AejServiceTest` — todos os casos PASSAM, incluindo:
  - `shouldGenerateAejFromCompleteScenario`
  - `shouldFailWhenCompanyDoesNotExist`
  - `shouldWrapSignatureFailure` (agora valida propagação de `DigitalSignatureException`)
  - `shouldGenerateType07ForAbsenceWithoutStartWork` (cobertura do fallback)
  - `shouldGenerateAejWhenCompanyCnpjIsNull`
- `DigitalSignatureServiceTest` — todos os casos PASSAM:
  - `shouldSignDataWithGeneratedPkcs12Certificate`
  - `shouldWrapCertificateLoadingFailure` (mensagem segura, sem path/senha)
  - `shouldWrapCertificateLoadingFailureWithNullPayload`
  - `shouldFailWhenCertificatePathIsBlank`

Comandos filtrados rodados:

```bash
./gradlew test --tests 'com.kts.kronos.application.service.AejServiceTest'
./gradlew test --tests 'com.kts.kronos.infrastructure.DigitalSignatureServiceTest'
```

### 14.2 Testes front-end / Build

```bash
npm run lint     # 0 erros, 0 warnings
npm run build    # build Vite OK; bundle pdf > 500KB (warning preexistente)
```

---

## 15. Riscos remanescentes

| Risco | Severidade | Mitigação aplicada | O que ainda depende de operação |
|---|---|---|---|
| Cookie `KRONOS_ACCESS_TOKEN` não entregue por proxy reverso ou domínio incompatível em produção | Alto | Front agora não derruba sessão em blob 401; toast informativo é exibido | Validar `AUTH_COOKIE_DOMAIN`/`SAME_SITE`/`SECURE` na Hostinger; verificar Nginx repassando cookies |
| Token revogado por troca de senha (sessionVersion mismatch) | Médio | Front continua tratando `X-Session-Revoked` corretamente | Operacional — usuário precisa logar de novo |
| Certificado expirado | Médio | Falha agora retorna 503 com código `DIGITAL_SIGNATURE_UNAVAILABLE` | Monitorar validade (`openssl pkcs12 -in ... -nokeys -info`) e renovar antes de expirar |
| Senha do certificado alterada sem atualizar env var | Médio | Falha retorna 503; mensagem genérica indica indisponibilidade | Operação precisa sincronizar `DIGITAL_CERTIFICATE_PASSWORD` |
| Registro de ausência inserido manualmente sem `startWork` E sem `endWork` | Baixo | Fallback usa `LocalDate.now()` e loga warning | Idealmente migrar para campo de data específico de ausência |
| `AejServiceTest` não exercita keystore real | Baixo | Cobertura unitária via mock + `DigitalSignatureServiceTest` com keystore gerado em `@TempDir` | Smoke manual pós-deploy na VPS (seção 16) |

---

## 16. Validação manual pós-deploy (Hostinger)

Roteiro mínimo que deve ser executado no ambiente real após o deploy:

1. Logar como usuário com role `MANAGER` em `https://kronostechsolutions.com`.
2. Abrir **Auditoria Fiscal**.
3. Escolher mês válido com registros e clicar em **Gerar AEJ**.
   - **Esperado:** download de arquivo `.p7s`, status `200`.
   - DevTools → Network → request `GET /legal/aej?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` deve mostrar `Cookie: KRONOS_ACCESS_TOKEN=...`.
4. (Cenário negativo controlado) Em um ambiente de staging, mover temporariamente o arquivo do certificado:
   ```bash
   sudo mv /opt/kronos/certs/kronos-signature.p12 /opt/kronos/certs/kronos-signature.p12.bak
   sudo systemctl restart kronos-backend
   ```
   Tentar gerar AEJ. **Esperado:** toast “Assinatura digital indisponível no momento. Verifique o certificado configurado e tente novamente.”; resposta HTTP `503` com body `{"code":"DIGITAL_SIGNATURE_UNAVAILABLE", ...}`; **sem logout**. Restaurar:
   ```bash
   sudo mv /opt/kronos/certs/kronos-signature.p12.bak /opt/kronos/certs/kronos-signature.p12
   sudo systemctl restart kronos-backend
   ```
5. Logar como usuário `PARTNER` e tentar acessar o endpoint diretamente.
   - **Esperado:** `403`, toast de permissão, **sem logout** (preserva sessão).
6. Inspecionar logs estruturados:
   ```bash
   journalctl -u kronos-backend -n 500 --no-pager | \
     grep -E 'event=legal_aej_generation|event=legal_digital_signature|event=http_error'
   ```
   - Sucesso: `event=legal_aej_generation result=success`.
   - Falha de assinatura: `event=legal_digital_signature result=failure reason=digital_signature` seguido de `event=http_error result=failure reason=digital_signature_unavailable path=/legal/aej`.
   - Confirmar que nenhuma linha contém path do certificado, senha, CPF, PIS ou JWT.
7. Smoke do certificado direto na VPS:
   ```bash
   openssl pkcs12 -in "$DIGITAL_CERTIFICATE_PATH" -nokeys -info -passin "pass:$DIGITAL_CERTIFICATE_PASSWORD" >/dev/null && echo "keystore OK"
   ```

Critério final de aceite: itens 3, 4, 5 e 6 confirmados sem regressão observada em outras telas (Dashboard, Relatório Detalhado, Espelho de Ponto).

