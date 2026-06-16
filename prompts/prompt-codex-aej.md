# Prompt para CODEX CLI — Auditoria e correção AEJ Kronos

Você é o agente de execução do projeto Kronos. Trabalhe com foco técnico, rastreabilidade e segurança.

## Contexto

Repositórios e branches:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `PROD_HOSTINGER_v2`.
- Documentação: `kronos-business`, branch `main`.

Fluxo com problema:

- Tela: Auditoria Fiscal.
- Ação: gerar AEJ — Arquivo Eletrônico de Jornada.
- Endpoint esperado: `GET /legal/aej?startDate=&endDate=`.
- Sintoma: arquivo não é gerado e o sistema retorna para login.
- Investigar também certificado digital, porque AEJ é assinado digitalmente.

## Documentos de negócio/arquitetura que você deve ler primeiro

Leia no repositório/documentação do projeto:

```text
kronos_back-end_fluxos_aplicacao.md
kronos_back-end_regras_negocio.md
kronos_back-end_entradas_saidas_fluxos.md
kronos_back-end_arquitetura_pastas_projeto.md
kronos_back-end_entidades.md
```

Pontos esperados da documentação:

- `GET /legal/aej?startDate=&endDate=` retorna `.p7s`.
- Autorização: `MANAGER`/`CTO`.
- AEJ usa período informado.
- AEJ inclui colaboradores, jornadas, marcações e ausências.
- AEJ deve ser assinado digitalmente.
- Arquitetura segue controller → usecase/service → provider → infraestrutura.

## Arquivos obrigatórios para leitura — Back-end

```text
src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java
src/main/java/com/kts/kronos/application/port/in/usecase/AejUseCase.java
src/main/java/com/kts/kronos/application/service/AejService.java
src/main/java/com/kts/kronos/application/service/LegalExportRangeGuard.java
src/main/java/com/kts/kronos/infrastructure/DigitalSignatureService.java
src/main/java/com/kts/kronos/config/SecurityConfig.java
src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticationFilter.java
src/main/java/com/kts/kronos/adapter/out/security/AuthCookieService.java
src/main/java/com/kts/kronos/adapter/out/security/JwtUtils.java
src/main/java/com/kts/kronos/adapter/out/security/TermsValidationFilter.java
src/main/java/com/kts/kronos/adapter/in/web/exceptions/RestExceptionHandler.java
src/main/java/com/kts/kronos/application/port/out/provider/TimeRecordProvider.java
src/main/java/com/kts/kronos/adapter/out/persistence/impl/TimeRecordProviderImpl.java
src/main/java/com/kts/kronos/adapter/out/persistence/TimeRecordRepository.java
src/main/resources/application-prod.yml
src/test/java/com/kts/kronos/application/service/AejServiceTest.java
src/test/java/com/kts/kronos/application/service/AejServiceFeature52RangeQueryTest.java
src/test/java/com/kts/kronos/adapter/in/web/http/webmvc/LegalControllerWebMvcTest.java
src/test/java/com/kts/kronos/adapter/in/web/http/LegalControllerSecurityTest.java
```

## Arquivos obrigatórios para leitura — Front-end

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

## Auditoria obrigatória antes de alterar código

Determine o status real da chamada:

```text
GET /legal/aej?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

Classifique:

```text
401 = autenticação/sessão/cookie/JWT
403 = role/autorização
500/503 = certificado digital ou geração AEJ
outro = investigar separadamente
```

Registre no arquivo `auditoria-aej.md`:

- status HTTP;
- endpoint chamado;
- usuário/role usado, sem dados sensíveis;
- se request tinha cookie `KRONOS_ACCESS_TOKEN`;
- se response tinha `X-Session-Revoked`;
- logs relevantes;
- causa raiz confirmada.

## Hipóteses iniciais

### Hipótese 1 — Sessão/cookie

O retorno para login indica provável `401`.

Investigue:

- cookie ausente no request;
- `AUTH_COOKIE_DOMAIN` incorreto;
- `AUTH_COOKIE_SAME_SITE` incompatível;
- `AUTH_COOKIE_SECURE=true` sem HTTPS correto;
- token expirado;
- token em blacklist;
- `sessionVersion` mismatch;
- CORS sem credentials.

### Hipótese 2 — Certificado digital

O AEJ exige assinatura digital.

Investigue:

- `DIGITAL_CERTIFICATE_PATH` definido;
- arquivo existe;
- usuário do processo consegue ler;
- `DIGITAL_CERTIFICATE_PASSWORD` correto;
- arquivo é PKCS12 (`.p12`/`.pfx`);
- keystore possui alias com chave privada;
- logs `legal_digital_signature result=failure`.

### Hipótese 3 — Dados AEJ

Investigue:

- intervalo inválido;
- ausência/férias/abono sem data;
- registros fora do range;
- colaboradores sem jornada;
- conversões de `TimeRecord`.

## Implementação esperada

Faça a menor correção segura, conforme causa confirmada.

### Se for `401`

- Corrigir configuração de cookie/CORS/proxy se estiver no repositório.
- Se for somente ambiente, documentar variáveis corretas em `.env.example`/deploy docs.
- Garantir que front não chama `publicApi` para endpoint autenticado.
- Manter `withCredentials: true`.

### Se for `403`

- Não liberar para `PARTNER`.
- Melhorar mensagem do front para permissão insuficiente.

### Se for certificado

- Criar exceção específica, por exemplo `DigitalSignatureException`.
- Alterar `DigitalSignatureService` para lançar essa exceção.
- Mapear no `RestExceptionHandler` com código `DIGITAL_SIGNATURE_UNAVAILABLE`.
- Não expor senha, path sensível ou stack trace para o usuário.
- Adicionar teste específico.
- Atualizar `.env.example` com `DIGITAL_CERTIFICATE_PATH` e `DIGITAL_CERTIFICATE_PASSWORD` se necessário.

### Se for geração AEJ

- Validar dados antes de gerar linha.
- Tratar ausência sem `startWork` com erro controlado.
- Não gerar arquivo fiscal silenciosamente incompleto.
- Adicionar teste.

### No front-end

- Em download com `responseType: "blob"`, se a resposta de erro for JSON em Blob, converter para objeto de erro antes de gerar mensagem.
- Garantir que `401` continua acionando sessão expirada.
- Garantir que `500/503` não redireciona para login.

## Regras de segurança

- Não remover `@PreAuthorize` do AEJ.
- Não expor AEJ para `PARTNER`.
- Não desabilitar assinatura digital em produção.
- Não logar CPF, PIS, JWT, senha, imagem, certificado ou conteúdo do arquivo.
- Não commitar certificado digital.
- Não colocar senha real em arquivo versionado.

## Testes obrigatórios

Back-end:

```bash
./gradlew clean test
./gradlew test --tests '*AejService*'
./gradlew test --tests '*LegalController*'
```

Front-end:

```bash
npm run lint
npm run build
```

## Saída final obrigatória

Atualize/crie `auditoria-aej.md` com:

1. Resumo da causa raiz.
2. Evidências com arquivos e linhas.
3. Alterações feitas.
4. Testes executados.
5. Riscos remanescentes.
6. Variáveis de produção exigidas.
7. Passos de validação manual na Hostinger.
