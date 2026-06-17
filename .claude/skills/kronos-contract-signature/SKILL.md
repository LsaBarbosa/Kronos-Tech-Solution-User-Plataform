---
name: kronos-contract-signature
description: Implementar assinatura eletrônica de contratos no Kronos usando o fluxo de assinatura do espelho de ponto como referência.
---

# Skill — Kronos Contract Signature

## Quando usar

Use esta skill quando a tarefa envolver:

- upload de contrato PDF por `MANAGER`;
- atribuição de contrato a um ou mais colaboradores;
- assinatura eletrônica de contrato por colaborador autenticado;
- reaproveitamento do modelo de assinatura do espelho de ponto;
- persistência de PDF no bucket com `DocumentType.SERVICE_CONTRACT_TERMS`;
- criação de páginas no front-end para envio e assinatura de contratos.

## Contexto obrigatório

### Back-end

Repositório:

```text
LsaBarbosa/Kronos-Tech-Solutions-KTS
branch: PROD_HOSTINGER_V2
```

Arquivos que devem ser lidos antes de implementar:

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/domain/model/enuns/DocumentType.java

src/main/java/com/kts/kronos/adapter/in/web/http/TimesheetSignatureController.java
src/main/java/com/kts/kronos/application/port/in/usecase/TimesheetSignatureUseCase.java
src/main/java/com/kts/kronos/application/service/TimesheetSignatureService.java
src/main/java/com/kts/kronos/domain/model/TimesheetSignature.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/TimesheetSignatureEntity.java
src/main/java/com/kts/kronos/adapter/out/persistence/TimesheetSignatureRepository.java
src/main/java/com/kts/kronos/application/port/out/provider/TimesheetSignatureProvider.java
src/main/java/com/kts/kronos/adapter/out/persistence/impl/TimesheetSignatureProviderImpl.java
src/main/java/com/kts/kronos/adapter/out/persistence/mapper/TimesheetSignatureMapper.java

src/main/java/com/kts/kronos/application/port/in/usecase/PointMirrorPdfUseCase.java
src/main/java/com/kts/kronos/application/service/PointMirrorPdfService.java
src/main/java/com/kts/kronos/infrastructure/DigitalSignatureService.java

src/main/java/com/kts/kronos/application/port/in/usecase/DocumentUseCase.java
src/main/java/com/kts/kronos/application/service/DocumentService.java
src/main/java/com/kts/kronos/adapter/in/web/http/DocumentController.java
src/main/java/com/kts/kronos/adapter/out/persistence/entity/DocumentEntity.java
src/main/java/com/kts/kronos/application/security/DomainAuthorizationService.java
src/main/java/com/kts/kronos/adapter/out/security/JwtAuthenticatedUser.java
src/main/java/com/kts/kronos/application/service/AuditService.java
```

### Front-end

Repositório:

```text
LsaBarbosa/Kronos-Tech-Solution-User-Plataform
branch: PROD_HOSTINGER_v2
```

Arquivos que devem ser lidos antes de implementar:

```text
src/config/api-routes.ts
src/config/app-routes.ts
src/App.tsx

src/pages/AssinaturaPonto.tsx
src/features/timesheet-signature/useTimesheetSignatureViewModel.ts
src/service/timesheetSignature.service.ts
src/types/timesheet-signature.ts
src/components/timesheet-signature/SignaturePendingBlockers.tsx
src/components/timesheet-signature/SignatureDeclarationBox.tsx
src/components/timesheet-signature/SignatureStatusCard.tsx

src/pages/EnviarDocumentos.tsx
src/pages/DocumentoColaborador.tsx
src/service/document.service.ts
src/service/employee.service.ts
src/context/AuthContext.tsx
src/components/PageShell.tsx
```

### Documentação

Repositório:

```text
LsaBarbosa/kronos-business
branch: main
```

Arquivos que devem ser atualizados ou criados:

```text
README.md
05-fluxos-front-end.md
06-contratos-api.md
08-rotas-guards-permissoes.md
13-models-dtos.md
14-seguranca-lgpd-front.md
CHANGELOG.md
20-adrs/ADR-005-assinatura-contrato-servico.md
```

## Resultado esperado

### Back-end

Criar um módulo de contrato semelhante ao módulo `TimesheetSignature`, com:

```text
ServiceContractController
ServiceContractUseCase
ServiceContractService
ServiceContractProvider
ServiceContractAssignmentProvider
ServiceContractSignatureProvider
ServiceContractEntity
ServiceContractAssignmentEntity
ServiceContractSignatureEntity
Repositories
Mappers
DTOs
Flyway migration
Testes
```

### Front-end

Criar:

```text
src/pages/EnviarContrato.tsx
src/pages/AssinaturaContrato.tsx
src/features/service-contract-signature/useServiceContractSignatureViewModel.ts
src/service/serviceContractSignature.service.ts
src/types/service-contract-signature.ts
src/components/service-contract-signature/*
```

### Regras obrigatórias

- `MANAGER` pode criar contratos apenas para colaboradores do próprio tenant.
- `PARTNER` ou qualquer usuário autenticado só visualiza contratos atribuídos ao próprio `employeeId`.
- Contrato já assinado não aparece novamente como pendente.
- O PDF original deve ser salvo no bucket com `DocumentType.SERVICE_CONTRACT_TERMS`.
- A assinatura deve exigir:
  - visualização prévia do PDF;
  - confirmação explícita;
  - senha atual do usuário;
  - hash SHA-256 do PDF original;
  - hash SHA-256 da declaração.
- Toda assinatura deve registrar IP, User-Agent, data/hora, usuário, colaborador, empresa, hash e documento de evidência.
- Não registrar senha, CPF, conteúdo do PDF, token ou dados sensíveis em log.
- Toda alteração de schema deve ser via Flyway.
- Controllers não devem conter regra de negócio.

## Design de endpoints sugerido

```text
POST /service-contracts/admin
GET  /service-contracts/admin
GET  /service-contracts/admin/{contractId}
GET  /service-contracts/me/pending
GET  /service-contracts/{contractId}/preview
POST /service-contracts/{contractId}/sign
GET  /service-contracts/signatures/{signatureId}/document
GET  /service-contracts/admin/signatures
```

## Padrão de assinatura a copiar do espelho de ponto

Copiar os conceitos, não duplicar código sem necessidade:

- `status` / elegibilidade;
- `preview`;
- `sign`;
- `document`;
- `admin`;
- reautenticação por senha;
- declaração versionada;
- hash canônico;
- prevenção de duplicidade;
- PAdES via `DigitalSignatureService.signPdf`;
- evidência via documento salvo no bucket;
- auditoria via `AuditService`.

## Critério de pronto

- Build back-end passa.
- Testes back-end relevantes passam.
- Build front-end passa.
- Testes front-end relevantes passam.
- Documentação atualizada.
- Fluxo manual validado:
  1. manager envia contrato;
  2. colaborador vê pendência;
  3. colaborador abre PDF;
  4. colaborador assina com senha;
  5. contrato desaparece dos pendentes;
  6. documento assinado pode ser baixado;
  7. manager visualiza status no painel administrativo.
