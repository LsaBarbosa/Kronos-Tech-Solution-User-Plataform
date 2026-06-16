---
name: backend-signature-subagent
summary: Implementa backend Java/Spring para assinatura eletrônica do espelho de ponto mensal.
tools: Read, Grep, Glob, Bash, Edit, MultiEdit, Write
---

# Subagent — Backend Signature

## Objetivo

Criar o módulo backend de assinatura eletrônica do espelho de ponto do mês anterior.

## Arquivos que deve ler primeiro

```text
README.md
build.gradle
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java
src/main/java/com/kts/kronos/application/port/in/usecase/TimeRecordUseCase.java
src/main/java/com/kts/kronos/application/service/TimeRecordService.java
src/main/java/com/kts/kronos/application/service/PointMirrorPdfService.java
src/main/java/com/kts/kronos/application/service/DocumentService.java
src/main/java/com/kts/kronos/application/service/AfdService.java
src/main/java/com/kts/kronos/application/service/AejService.java
src/main/java/com/kts/kronos/application/service/AuditService.java
src/main/java/com/kts/kronos/application/security/DomainAuthorizationService.java
src/main/java/com/kts/kronos/application/security/ClientIpResolver.java
src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticatedUser.java
src/main/java/com/kts/kronos/domain/model/TimeRecord.java
src/main/java/com/kts/kronos/domain/model/enuns/StatusRecord.java
src/main/java/com/kts/kronos/domain/model/enuns/DocumentType.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/TimeRecordEntity.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/DocumentEntity.java
src/main/java/com/kts/kronos/application/port/out/provider/TimeRecordProvider.java
src/main/resources/db/migration/*
src/test/java/com/kts/kronos/**/*TimeRecord*Test.java
```

Se algum arquivo não existir com esse nome, usar `find`, `grep` e `rg` para localizar equivalente.

## Implementação esperada

### 1. Domínio

Criar:

```text
domain/model/TimesheetSignature.java
domain/model/enuns/TimesheetSignatureStatus.java
domain/model/enuns/TimesheetSignatureType.java
domain/model/enuns/TimesheetSignatureMethod.java
```

Estados mínimos:

- `ACTIVE`
- `VOIDED`
- `SUPERSEDED`

Tipos/métodos mínimos:

- `INTERNAL_ADVANCED`
- `PASSWORD_REAUTH`

### 2. Persistência

Criar:

```text
adapter/out/persistence/entity/TimesheetSignatureEntity.java
adapter/out/persistence/TimesheetSignatureRepository.java
adapter/out/persistence/mapper/TimesheetSignatureMapper.java
adapter/out/persistence/impl/TimesheetSignatureProviderImpl.java
application/port/out/provider/TimesheetSignatureProvider.java
```

Migration sugerida:

```sql
CREATE TABLE tb_timesheet_signature (
    signature_id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    company_id UUID NOT NULL,
    signer_user_id UUID NOT NULL,
    reference_year INTEGER NOT NULL,
    reference_month INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    signed_at_zone VARCHAR(64) NOT NULL,
    signature_type VARCHAR(40) NOT NULL,
    signature_method VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL,
    point_mirror_document_id UUID,
    point_mirror_hash_sha256 VARCHAR(64) NOT NULL,
    records_snapshot_hash_sha256 VARCHAR(64) NOT NULL,
    declaration_version VARCHAR(40) NOT NULL,
    declaration_hash_sha256 VARCHAR(64) NOT NULL,
    declaration_text TEXT NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    evidence_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    voided_at TIMESTAMP WITH TIME ZONE,
    voided_by_user_id UUID,
    void_reason TEXT,
    CONSTRAINT uk_timesheet_signature_active UNIQUE (employee_id, reference_year, reference_month, status)
);

CREATE INDEX idx_timesheet_signature_company_period ON tb_timesheet_signature(company_id, reference_year, reference_month);
CREATE INDEX idx_timesheet_signature_employee_period ON tb_timesheet_signature(employee_id, reference_year, reference_month);
```

Observação: se PostgreSQL não aceitar a unicidade como desejado para status, usar índice único parcial para `status = 'ACTIVE'`.

### 3. Use case e service

Criar:

```text
application/port/in/usecase/TimesheetSignatureUseCase.java
application/service/TimesheetSignatureService.java
```

Métodos mínimos:

```java
PreviousMonthSignatureStatusResponse getPreviousMonthStatus();
TimesheetSignaturePreviewResponse getPreviousMonthPreview();
SignPreviousMonthTimesheetResponse signPreviousMonth(SignPreviousMonthTimesheetRequest request, HttpServletRequest httpRequest);
TimesheetSignatureDocumentResponse getDocument(UUID signatureId);
TimesheetSignatureAdminPageResponse listAdmin(...);
```

### 4. Controller

Criar:

```text
adapter/in/web/http/TimesheetSignatureController.java
adapter/in/web/dto/timesheetsignature/*
```

Endpoints:

```http
GET  /records/timesheet-signatures/previous-month/status
GET  /records/timesheet-signatures/previous-month/preview
POST /records/timesheet-signatures/previous-month/sign
GET  /records/timesheet-signatures/{signatureId}/document
GET  /records/timesheet-signatures/admin?year=&month=&status=&employeeName=&page=&size=
```

Atualizar `ApiPaths.java`.

### 5. Hash canônico dos registros

Implementar serviço privado ou componente dedicado que:

- busca registros do colaborador no período;
- ordena por `startWork`, `timeRecordId`;
- serializa apenas campos determinísticos;
- normaliza datas em ISO-8601;
- inclui `timeRecordId`, `startWork`, `endWork`, `statusRecord`, `active`, `edited`, `nsrCheckin`, `nsrCheckout`, `originalStartWork`, `originalEndWork`;
- calcula SHA-256.

Não incluir campos voláteis como ordem de consulta, timezone local da JVM, mensagens de UI.

### 6. Geração do documento

Reutilizar `PointMirrorPdfService` para gerar o PDF do período.

Depois:

- calcular `pointMirrorHashSha256`;
- preferencialmente adicionar página/rodapé de evidência ao PDF assinado;
- salvar documento assinado via `DocumentService`/provider;
- criar ou reutilizar `DocumentType.TIMESHEET_MIRROR_SIGNED`.

Se não for possível editar o PDF sem grande risco, salvar evidência separada e manter o hash do PDF original na assinatura.

### 7. Reautenticação

Validar senha atual usando provider de usuário e `PasswordEncoder` já configurado.

- Não logar senha.
- Não persistir senha.
- Mensagem genérica para senha inválida.

### 8. Auditoria

Registrar sucesso/falha com `AuditService` ou provider equivalente:

- action: `TIMESHEET_SIGNATURE_CREATED`, `TIMESHEET_SIGNATURE_FAILED`, `TIMESHEET_SIGNATURE_VIEWED`, `TIMESHEET_SIGNATURE_DOCUMENT_DOWNLOADED`;
- resourceType: `TIMESHEET_SIGNATURE`;
- resourceId: `signatureId` ou `employeeId:year-month`;
- targetEmployeeId;
- companyId;
- IP/User-Agent minimizados conforme padrão existente.

### 9. Testes

Criar testes unitários e, se o projeto já usar, integração:

```text
TimesheetSignatureServiceTest.java
TimesheetSignatureControllerTest.java
TimesheetSignatureProviderImplTest.java
```

Cobrir casos definidos na Skill.

## Proibições

- Não alterar sem necessidade `TimeRecordService.registerTime`.
- Não mudar regra de NSR.
- Não regerar AFD retroativamente ao assinar.
- Não permitir assinatura por gestor para outro colaborador.
- Não aceitar `employeeId` no body da assinatura do colaborador.
- Não declarar assinatura ICP-Brasil sem integração real.
