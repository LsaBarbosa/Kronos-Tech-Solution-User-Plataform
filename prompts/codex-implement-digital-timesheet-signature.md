# Prompt para Claude Code / Codex — Implementar Assinatura Digital do Ponto Kronos

Você é o agente executor de implementação e revisão do projeto Kronos.

## Objetivo

Implementar a funcionalidade de assinatura eletrônica do espelho de ponto do mês anterior.

O colaborador autenticado deve conseguir assinar o próprio ponto do mês imediatamente anterior, com evidência jurídica/técnica adequada ao Brasil, sem alterar registros fiscais originais.

## Repositórios e branches

Use exatamente:

```text
Backend:       LsaBarbosa/Kronos-Tech-Solutions-KTS              branch PROD_HOSTINGER_V2
Frontend:      LsaBarbosa/Kronos-Tech-Solution-User-Plataform    branch PROD_HOSTINGER_v2
Documentação:  LsaBarbosa/kronos-business                       branch main
```

Antes de alterar qualquer arquivo, execute:

```bash
git status
git branch --show-current
```

Se a branch estiver errada, faça checkout da branch correta.

## Leitura obrigatória antes de implementar

### Backend

Leia os arquivos abaixo. Se algum não existir, localize o equivalente com `find`, `grep` ou `rg`.

```text
README.md
build.gradle
settings.gradle
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/constants/Messages.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java
src/main/java/com/kts/kronos/adapter/in/web/http/DocumentController.java
src/main/java/com/kts/kronos/application/port/in/usecase/TimeRecordUseCase.java
src/main/java/com/kts/kronos/application/port/in/usecase/PointMirrorPdfUseCase.java
src/main/java/com/kts/kronos/application/port/in/usecase/DocumentUseCase.java
src/main/java/com/kts/kronos/application/service/TimeRecordService.java
src/main/java/com/kts/kronos/application/service/PointMirrorPdfService.java
src/main/java/com/kts/kronos/application/service/DocumentService.java
src/main/java/com/kts/kronos/application/service/ReceiptPdfService.java
src/main/java/com/kts/kronos/application/service/AfdService.java
src/main/java/com/kts/kronos/application/service/AejService.java
src/main/java/com/kts/kronos/application/service/AuditService.java
src/main/java/com/kts/kronos/application/security/DomainAuthorizationService.java
src/main/java/com/kts/kronos/application/security/ClientIpResolver.java
src/main/java/com/kts/kronos/application/security/PrivacyLogReferenceService.java
src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticatedUser.java
src/main/java/com/kts/kronos/domain/model/TimeRecord.java
src/main/java/com/kts/kronos/domain/model/Document.java
src/main/java/com/kts/kronos/domain/model/AuditLog.java
src/main/java/com/kts/kronos/domain/model/enuns/StatusRecord.java
src/main/java/com/kts/kronos/domain/model/enuns/DocumentType.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/TimeRecordEntity.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/DocumentEntity.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/AuditLogEntity.java
src/main/java/com/kts/kronos/application/port/out/provider/TimeRecordProvider.java
src/main/java/com/kts/kronos/application/port/out/provider/DocumentProvider.java
src/main/java/com/kts/kronos/application/port/out/provider/UserProvider.java
src/main/resources/db/migration/*
src/test/java/com/kts/kronos/**/*TimeRecord*Test.java
src/test/java/com/kts/kronos/**/*Document*Test.java
```

Também rode buscas:

```bash
rg "espelho|PointMirror|AEJ|AFD|DocumentType|AuditService|ClientIpResolver|PasswordEncoder|csrf|CSRF" src/main src/test
rg "PENDING_APPROVAL|TIME_OFF_REQUEST|WORK_TIME_REQUEST|REQUEST_VACATION|VACATION" src/main/java
```

### Frontend

Leia:

```text
package.json
src/App.tsx
src/config/app-routes.ts
src/pages/EspelhoPonto.tsx
src/pages/RelatorioDetalhado.tsx
src/pages/PrivacyCenter.tsx
src/context/AuthContext.tsx
src/components/ProtectedRoute.tsx
src/components/RoleRoute.tsx
src/services/**/*
src/lib/**/*
src/hooks/**/*
```

Rode:

```bash
rg "espelho-ponto|EspelhoPonto|records|legal|axios|csrf|api" src
```

### Documentação

Leia:

```text
README.md
04-mapa-modulos-telas.md
05-fluxos-front-end.md
06-contratos-api.md
08-rotas-guards-permissoes.md
09-estado-cache-requisicoes.md
13-models-dtos.md
14-seguranca-lgpd-front.md
20-adrs/*
```

Se algum arquivo não existir, localize equivalente.

## Base legal e decisão de assinatura

Considere:

- CLT art. 74.
- Decreto nº 10.854/2021.
- Portaria MTP nº 671/2021.
- MP nº 2.200-2/2001.
- Lei nº 14.063/2020.
- LGPD.

Implemente como **assinatura eletrônica avançada interna por evidência**, não como assinatura qualificada ICP-Brasil.

Use `signatureType = INTERNAL_ADVANCED` e `signatureMethod = PASSWORD_REAUTH`.

Não use termos `ICP-BRASIL`, `PAdES`, `CAdES`, `QUALIFIED` ou `assinatura qualificada`, salvo se houver integração real com certificado digital ICP-Brasil.

## Regras de negócio obrigatórias

1. O backend calcula o mês anterior usando `America/Sao_Paulo`.
2. O cliente não envia período livre para assinatura própria.
3. O colaborador assina apenas o próprio ponto.
4. MANAGER/CTO não assinam em nome de colaborador.
5. Bloquear assinatura quando houver pendência no período:
   - ajuste pendente;
   - abono/esquecimento pendente;
   - férias pendente;
   - registro aberto indevido;
   - inconsistência operacional.
6. Assinatura não altera `TimeRecord`, NSR, AFD, AEJ ou comprovantes originais.
7. Assinatura salva evidência separada.
8. Exigir confirmação explícita e senha atual.
9. Impedir duplicidade ativa por colaborador/mês/ano.
10. Persistir hash do PDF e hash canônico dos registros.
11. Registrar IP/User-Agent no backend.
12. Registrar audit log.
13. Consulta posterior deve detectar divergência se os registros do mês forem alterados após assinatura.
14. Não armazenar senha, token, CSRF token ou imagem facial.
15. Não logar CPF completo, senha, token ou imagem facial.

## Texto de declaração v1

Use texto versionado:

```text
Declaro que conferi o espelho de ponto referente ao mês de {MM/YYYY}, reconheço que esta assinatura eletrônica registra minha ciência sobre as marcações exibidas neste documento e estou ciente de que posso solicitar correção ou contestação pelos canais internos aplicáveis quando identificar divergência.
```

Persistir:

- `declarationVersion = "1.0"`;
- `declarationText`;
- `declarationHashSha256`.

## Backend — Implementação esperada

### Criar estrutura

```text
src/main/java/com/kts/kronos/adapter/in/web/http/TimesheetSignatureController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timesheetsignature/*
src/main/java/com/kts/kronos/application/port/in/usecase/TimesheetSignatureUseCase.java
src/main/java/com/kts/kronos/application/port/out/provider/TimesheetSignatureProvider.java
src/main/java/com/kts/kronos/application/service/TimesheetSignatureService.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/TimesheetSignatureEntity.java
src/main/java/com/kts/kronos/adapter/out/persistence/TimesheetSignatureRepository.java
src/main/java/com/kts/kronos/adapter/out/persistence/mapper/TimesheetSignatureMapper.java
src/main/java/com/kts/kronos/adapter/out/persistence/impl/TimesheetSignatureProviderImpl.java
src/main/java/com/kts/kronos/domain/model/TimesheetSignature.java
src/main/java/com/kts/kronos/domain/model/enuns/TimesheetSignatureStatus.java
src/main/java/com/kts/kronos/domain/model/enuns/TimesheetSignatureType.java
src/main/java/com/kts/kronos/domain/model/enuns/TimesheetSignatureMethod.java
```

Atualizar:

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/domain/model/enuns/DocumentType.java
src/main/resources/db/migration/V<next>__create_timesheet_signature.sql
```

### Endpoints

Base: `/records/timesheet-signatures`

```http
GET  /records/timesheet-signatures/previous-month/status
GET  /records/timesheet-signatures/previous-month/preview
POST /records/timesheet-signatures/previous-month/sign
GET  /records/timesheet-signatures/{signatureId}/document
GET  /records/timesheet-signatures/admin?year=&month=&status=&employeeName=&page=&size=
```

### DTOs mínimos

Crie DTOs equivalentes:

```java
record PreviousMonthSignatureStatusResponse(
    int referenceYear,
    int referenceMonth,
    LocalDate periodStart,
    LocalDate periodEnd,
    String status,
    boolean eligible,
    boolean alreadySigned,
    UUID signatureId,
    Instant signedAt,
    String pointMirrorHashSha256,
    String recordsSnapshotHashSha256,
    List<String> blockers
) {}

record SignPreviousMonthTimesheetRequest(
    boolean confirmed,
    String declarationVersion,
    String declarationHashSha256,
    String pointMirrorHashSha256,
    String password
) {}

record SignPreviousMonthTimesheetResponse(
    UUID signatureId,
    int referenceYear,
    int referenceMonth,
    Instant signedAt,
    String signatureType,
    String signatureMethod,
    String pointMirrorHashSha256,
    String recordsSnapshotHashSha256,
    UUID pointMirrorDocumentId
) {}
```

### Tabela sugerida

Crie migration PostgreSQL compatível com Flyway.

Campos mínimos:

```text
signature_id UUID PK
employee_id UUID NOT NULL
company_id UUID NOT NULL
signer_user_id UUID NOT NULL
reference_year INTEGER NOT NULL
reference_month INTEGER NOT NULL
period_start DATE NOT NULL
period_end DATE NOT NULL
signed_at TIMESTAMP WITH TIME ZONE NOT NULL
signed_at_zone VARCHAR(64) NOT NULL
signature_type VARCHAR(40) NOT NULL
signature_method VARCHAR(40) NOT NULL
status VARCHAR(30) NOT NULL
point_mirror_document_id UUID NULL
point_mirror_hash_sha256 VARCHAR(64) NOT NULL
records_snapshot_hash_sha256 VARCHAR(64) NOT NULL
declaration_version VARCHAR(40) NOT NULL
declaration_hash_sha256 VARCHAR(64) NOT NULL
declaration_text TEXT NOT NULL
ip_address VARCHAR(100) NULL
user_agent TEXT NULL
evidence_json TEXT NULL
created_at TIMESTAMP WITH TIME ZONE NOT NULL
updated_at TIMESTAMP WITH TIME ZONE NULL
voided_at TIMESTAMP WITH TIME ZONE NULL
voided_by_user_id UUID NULL
void_reason TEXT NULL
```

Criar índice único parcial para assinatura ativa:

```sql
CREATE UNIQUE INDEX uk_timesheet_signature_active_period
ON tb_timesheet_signature(employee_id, reference_year, reference_month)
WHERE status = 'ACTIVE';
```

Se o padrão de migrations do projeto evitar índice parcial, use alternativa compatível e explique.

## Frontend — Implementação esperada

Criar:

```text
src/pages/AssinaturaPonto.tsx
src/services/timesheetSignatureService.ts
src/types/timesheet-signature.ts
src/components/timesheet-signature/SignatureStatusCard.tsx
src/components/timesheet-signature/SignatureDeclarationBox.tsx
src/components/timesheet-signature/SignaturePendingBlockers.tsx
```

Atualizar:

```text
src/App.tsx
src/config/app-routes.ts
```

Rota sugerida:

```text
/assinatura-ponto
```

Label:

```text
Assinatura do Ponto
```

Acesso: qualquer usuário autenticado.

A tela deve:

1. Buscar status ao carregar.
2. Exibir período do mês anterior.
3. Permitir visualizar/baixar espelho quando disponível.
4. Exibir declaração.
5. Exigir checkbox e senha.
6. Chamar endpoint de assinatura.
7. Limpar senha após tentativa.
8. Exibir sucesso com assinatura, data e hash.
9. Exibir bloqueios quando backend retornar pendências.

## Documentação — Implementação esperada

Atualizar `kronos-business`:

```text
04-mapa-modulos-telas.md
05-fluxos-front-end.md
06-contratos-api.md
08-rotas-guards-permissoes.md
09-estado-cache-requisicoes.md
13-models-dtos.md
14-seguranca-lgpd-front.md
20-adrs/ADR-005-assinatura-eletronica-ponto.md
CHANGELOG.md
```

Se o número da ADR já existir, use próximo número livre.

## Testes obrigatórios

Backend:

- sucesso ao assinar mês anterior;
- erro ao assinar duplicado;
- erro com senha inválida;
- erro sem confirmação;
- erro com pendências;
- hash determinístico;
- divergência posterior detectada;
- admin respeita tenant;
- download respeita autorização.

Frontend:

- status renderizado;
- submit bloqueado sem checkbox;
- submit bloqueado sem senha;
- lista bloqueios;
- sucesso renderiza hash/protocolo;
- senha limpa após tentativa.

## Comandos finais

Backend:

```bash
./gradlew clean test
./gradlew clean build
```

Frontend:

```bash
npm run lint
npm run test
npm run build
```

Documentação:

```bash
grep -R "Assinatura do Ponto\|timesheet-signatures\|assinatura eletrônica" -n .
```

## Relatório final obrigatório

Ao terminar, entregue:

1. Resumo técnico.
2. Arquivos alterados/criados.
3. Endpoints adicionados.
4. Migration criada.
5. Testes executados e resultado.
6. Itens que precisam de validação jurídica humana.
7. Riscos conhecidos.
