---
name: kronos-digital-timesheet-signature
summary: Implementar assinatura eletrônica do espelho mensal de ponto do mês anterior no Kronos, respeitando arquitetura Java/Spring, React/Vite, LGPD, Portaria MTP 671/2021 e evidência jurídica.
allowed-tools: Read, Grep, Glob, Bash, Edit, MultiEdit, Write
---

# Skill — Assinatura Digital do Ponto Mensal Kronos

## Objetivo

Implementar no Kronos a funcionalidade para que o colaborador autenticado assine eletronicamente o espelho de ponto do mês anterior.

A assinatura deve:

- confirmar ciência/conferência do espelho do mês anterior;
- preservar registros originais de ponto, NSR, AFD e AEJ;
- gerar evidência técnica auditável;
- impedir assinatura duplicada ativa para o mesmo colaborador/período;
- impedir assinatura de mês atual, futuro ou período arbitrário;
- bloquear assinatura se o período tiver pendências operacionais relevantes;
- permitir consulta/download posterior do documento assinado;
- respeitar isolamento por tenant, autenticação, CSRF, LGPD, retenção e logs minimizados.

## Base legal e regulatória a considerar

1. **CLT, art. 74** — base geral do controle de jornada.
2. **Decreto nº 10.854/2021** — regulamenta o registro eletrônico de controle de jornada.
3. **Portaria MTP nº 671/2021** — classifica REP-C, REP-A e REP-P, define AFD/AEJ, espelho de ponto eletrônico, atestado técnico e requisitos de segurança do registro eletrônico.
4. **MP nº 2.200-2/2001** — ICP-Brasil garante autenticidade, integridade e validade jurídica de documentos eletrônicos e admite outros meios de comprovação quando aceitos pelas partes.
5. **Lei nº 14.063/2020** — classifica assinatura eletrônica simples, avançada e qualificada em interações com entes públicos; usar como referência técnica de níveis de assinatura, sem declarar ICP-Brasil quando a implementação for interna.
6. **LGPD** — assinatura de ponto trata dados pessoais trabalhistas; aplicar finalidade, minimização, retenção e segurança.

## Decisão técnica recomendada

Implementar inicialmente uma **assinatura eletrônica avançada interna por evidência**, não uma assinatura qualificada ICP-Brasil.

A assinatura interna deve combinar:

- usuário autenticado via cookie HttpOnly/JWT;
- CSRF nas chamadas mutáveis;
- confirmação expressa do conteúdo;
- reautenticação por senha no ato de assinar;
- hash SHA-256 do PDF do espelho do ponto;
- hash SHA-256 do snapshot canônico dos registros do período;
- IP e User-Agent resolvidos no backend;
- data/hora do servidor em `America/Sao_Paulo` e `Instant` UTC;
- versão/hash do texto de declaração aceito;
- trilha de auditoria.

Não rotular como `ICP-BRASIL`, `PAdES`, `CAdES` ou assinatura qualificada, salvo se houver integração real com certificado ICP-Brasil.

## Regras de negócio obrigatórias

### RB-ASS-001 — Período elegível

O colaborador só pode assinar o **mês imediatamente anterior** à data atual do servidor em `America/Sao_Paulo`.

Exemplo: se hoje é 2026-06-16, o período elegível é 2026-05-01 00:00:00 até 2026-05-31 23:59:59.999999999.

### RB-ASS-002 — Assinatura é pessoal

PARTNER, MANAGER e CTO podem assinar apenas o próprio espelho de ponto como colaborador autenticado.

MANAGER/CTO podem consultar relatórios gerenciais de assinatura do tenant, mas não podem assinar em nome de outro colaborador.

### RB-ASS-003 — Pendências bloqueiam assinatura

Bloquear assinatura quando o período possuir qualquer uma das condições abaixo:

- registro aberto sem `endWork`, exceto ausência/folga/férias que não exigem fechamento;
- solicitação de ajuste pendente;
- abono/esquecimento pendente;
- férias pendente;
- marcações inativas relevantes ao período sem decisão clara;
- divergência técnica detectada pelo serviço de apuração.

A mensagem deve orientar o colaborador a procurar o gestor ou concluir as pendências.

### RB-ASS-004 — Assinatura não altera marcações

A assinatura não pode alterar:

- `TimeRecord` original;
- NSR;
- AFD;
- AEJ;
- comprovantes de marcação;
- status fiscal dos registros.

Ela cria uma evidência separada apontando para o snapshot assinado.

### RB-ASS-005 — Assinatura única ativa

Para cada `employeeId + referenceYear + referenceMonth`, permitir somente uma assinatura ativa.

Se houver necessidade futura de retificação, criar status `SUPERSEDED` ou `VOIDED` com motivo e auditoria, nunca sobrescrever evidência anterior.

### RB-ASS-006 — Conteúdo da declaração

A declaração mínima deve ser versionada e seu hash persistido:

> Declaro que conferi o espelho de ponto referente ao mês de {MM/YYYY}, reconheço que esta assinatura eletrônica registra minha ciência sobre as marcações exibidas neste documento e estou ciente de que posso solicitar correção ou contestação pelos canais internos aplicáveis quando identificar divergência.

Não usar texto que renuncie direitos trabalhistas.
Não usar texto que impeça contestação futura.

### RB-ASS-007 — Evidência mínima

Persistir evidência com:

- `signatureId` UUID;
- `employeeId`;
- `companyId`;
- `signerUserId`;
- `referenceYear`;
- `referenceMonth`;
- `periodStart`;
- `periodEnd`;
- `signedAt` em `Instant`;
- `signedAtLocal` ou timezone `America/Sao_Paulo`;
- `signatureType = INTERNAL_ADVANCED`;
- `signatureMethod = PASSWORD_REAUTH`;
- `pointMirrorDocumentId`;
- `pointMirrorHashSha256`;
- `recordsSnapshotHashSha256`;
- `declarationVersion`;
- `declarationHashSha256`;
- `ipAddress`;
- `userAgent`;
- `status = ACTIVE`;
- `evidenceJson` sem senha, token, imagem facial ou dado desnecessário.

### RB-ASS-008 — Segurança

- Nunca armazenar senha, token JWT, CSRF token ou imagem facial na evidência.
- Nunca logar CPF, token, senha, imagem, IP completo em logs de aplicação quando não necessário.
- Operações mutáveis exigem cookie autenticado + CSRF + reautenticação por senha.
- Toda falha de assinatura deve retornar erro padronizado.

### RB-ASS-009 — LGPD e retenção

Atualizar inventário de tratamento com finalidade específica:

- processo: assinatura eletrônica do espelho de ponto;
- categoria de dados: identificação, vínculo laboral, jornada, IP, User-Agent, assinatura eletrônica/evidência;
- base legal sugerida: obrigação legal/regulatória trabalhista e exercício regular de direitos, conforme avaliação jurídica final;
- retenção: preservar como dado trabalhista/fiscal conforme política do Kronos.

### RB-ASS-010 — Integridade pós-assinatura

Ao consultar status, recomputar ou validar o hash do snapshot atual do período. Se diferente do hash assinado, retornar status derivado:

- `SIGNED_VALID` quando o snapshot atual bate com o assinado;
- `SIGNED_WITH_CURRENT_DIVERGENCE` quando houve alteração posterior;
- `NOT_SIGNED` quando não houver assinatura;
- `NOT_ELIGIBLE` quando o período não for o mês anterior;
- `BLOCKED_BY_PENDING_ISSUES` quando houver pendências.

Não apagar ou alterar assinatura ativa por divergência posterior sem fluxo explícito de retificação.

## Arquitetura esperada

### Backend

Criar módulo preferencialmente separado do `TimeRecordService` principal:

```text
src/main/java/com/kts/kronos/
├── adapter/in/web/http/TimesheetSignatureController.java
├── adapter/in/web/dto/timesheetsignature/
├── application/port/in/usecase/TimesheetSignatureUseCase.java
├── application/port/out/provider/TimesheetSignatureProvider.java
├── application/service/TimesheetSignatureService.java
├── adapter/out/persistence/entity/TimesheetSignatureEntity.java
├── adapter/out/persistence/TimesheetSignatureRepository.java
├── adapter/out/persistence/impl/TimesheetSignatureProviderImpl.java
├── domain/model/TimesheetSignature.java
└── domain/model/enuns/TimesheetSignatureStatus.java
```

Adicionar migration Flyway em `src/main/resources/db/migration`.

### Frontend

Criar rota/tela ou integrar em `EspelhoPonto`:

```text
src/pages/AssinaturaPonto.tsx
src/services/timesheetSignatureService.ts
src/types/timesheet-signature.ts
src/components/timesheet-signature/*
src/config/app-routes.ts
src/App.tsx
```

Fluxo de UI:

1. Buscar status do mês anterior.
2. Exibir mês elegível, resumo e botão para baixar/visualizar espelho.
3. Exibir declaração versionada.
4. Coletar confirmação explícita e senha.
5. Enviar assinatura.
6. Exibir comprovante, hash e opção de download.

## Endpoints recomendados

Base: `/records/timesheet-signatures`

```http
GET  /records/timesheet-signatures/previous-month/status
GET  /records/timesheet-signatures/previous-month/preview
POST /records/timesheet-signatures/previous-month/sign
GET  /records/timesheet-signatures/{signatureId}/document
GET  /records/timesheet-signatures/admin?year=&month=&status=&employeeName=&page=&size=
```

### DTOs recomendados

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

## Testes mínimos

### Backend

- assina mês anterior com sucesso;
- rejeita mês atual/futuro;
- rejeita quando já existe assinatura ativa;
- rejeita senha incorreta;
- rejeita confirmação falsa;
- rejeita com pendência de ajuste/abono/férias;
- rejeita cross-tenant no endpoint admin;
- gera hash determinístico do snapshot;
- salva documento e checksum;
- audita sucesso e falha sem vazar senha;
- valida migration com PostgreSQL/Testcontainers quando disponível.

### Frontend

- renderiza status pendente;
- bloqueia botão sem checkbox e senha;
- mostra assinado quando backend retorna assinatura;
- mostra pendências quando bloqueado;
- chama endpoint com CSRF via cliente HTTP existente;
- teste de rota protegida.

## Definition of Done

- Build backend passa.
- Testes backend passam.
- Build frontend passa.
- Testes frontend passam.
- Documentação `kronos-business` atualizada.
- Sem logs de senha/token/face/CPF.
- Sem alteração de AFD/AEJ/NSR existente.
- Evidência de assinatura contém hashes, IP/User-Agent, data/hora e texto versionado.
- Usuário assina apenas o próprio mês anterior.
