# Prompt para Codex CLI — Refatorar `/aprovacoes-abono`

Você é o agente de implementação do Kronos. Execute a refatoração visual e funcional da tela `/aprovacoes-abono` no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.

## Objetivo

Transformar `/aprovacoes-abono` em uma **mesa de aprovação gerencial de abonos**, com duas experiências reais:

- **Desktop:** fila + filtros + métricas + detalhe lateral + decisão contextual.
- **Mobile:** inbox por cards + chips de status + painel fixo inferior + ações grandes.

A nova tela deve seguir:

```text
references/docs/kronos_aprovacoes_abono_diretriz_visual.md
references/mockups/kronos_aprovacoes_abono_desktop.png
references/mockups/kronos_aprovacoes_abono_mobile.png
```

## Repositórios e branches

Antes de alterar código, confirme:

```bash
git -C Kronos-Tech-Solution-User-Plataform branch --show-current
git -C Kronos-Tech-Solutions-KTS branch --show-current
git -C kronos-business branch --show-current
```

Esperado:

- front-end: `feature/lgpd-compliance-new-ui`
- back-end: `PROD_HOSTINGER_V2`
- documentação: `main`

## Leia obrigatoriamente

### Documentação

```text
kronos-business/04-mapa-modulos-telas.md
references/docs/kronos_aprovacoes_abono_diretriz_visual.md
```

### Front-end

```text
src/App.tsx
src/config/app-routes.ts
src/pages/ManualRegisterApprovals.tsx
src/hooks/useTimeOffApprovals.ts
src/service/records.service.ts
src/service/document.service.ts
src/types/recordApproval.ts
src/utils/document-resolution.ts
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/*
```

### Back-end

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/application/service/TimeRecordService.java
```

## Contratos que você NÃO deve alterar

Preserve:

```ts
listTimeOffRequests({ page, size, employeeName, status })
approveTimeOff(timeRecordId)
rejectTimeOff(timeRecordId)
downloadDocument(documentId, fileName, employeeId)
```

Preserve no back-end:

```http
GET /records/time-off/requests?page=&size=&status=&employeeName=
PATCH /records/time-off/approve/{timeRecordId}
PATCH /records/time-off/reject/{timeRecordId}
```

Não altere método HTTP, path, parâmetros, payload ou DTO.

## Implementação esperada

### 1. Reorganize a página

`src/pages/ManualRegisterApprovals.tsx` deve se tornar uma composição limpa. Crie componentes em uma feature dedicada, preferencialmente:

```text
src/features/time-off-approvals/
├── components/
│   ├── TimeOffApprovalDesktop.tsx
│   ├── TimeOffApprovalMobile.tsx
│   ├── TimeOffApprovalHero.tsx
│   ├── TimeOffApprovalMetrics.tsx
│   ├── TimeOffApprovalFilters.tsx
│   ├── TimeOffApprovalQueue.tsx
│   ├── TimeOffApprovalCard.tsx
│   ├── TimeOffApprovalDetailPanel.tsx
│   ├── TimeOffApprovalDecisionBar.tsx
│   ├── TimeOffApprovalStatusBadge.tsx
│   └── TimeOffApprovalConfirmDialog.tsx
├── hooks/
│   └── useTimeOffApprovalViewModel.ts
├── utils/
│   └── timeOffApprovalFormatters.ts
└── types.ts
```

Se o projeto já tiver outro padrão, siga o padrão local mantendo a separação.

### 2. Desktop

A experiência desktop deve seguir o mockup:

- sidebar à esquerda;
- header superior;
- hero escuro com métricas;
- card `Fila de solicitações`;
- busca por colaborador;
- chips `PENDING`, `APPROVED`, `REJECTED`;
- lista selecionável;
- painel lateral `Solicitação selecionada`;
- destaque de evidência/anexo;
- cards de impacto: horas, registros, documento;
- regra de decisão;
- botões separados:
  - `Rejeitar abono`
  - `Aprovar abono`

### 3. Mobile

A experiência mobile deve seguir o mockup:

- sem tabela;
- topo compacto;
- métricas resumidas;
- busca;
- chips;
- cards de solicitações;
- painel fixo inferior com seleção atual;
- botão `Rejeitar`;
- botão `Aprovar abono`;
- detalhe/evidência em modal, drawer ou bottom sheet.

### 4. Status e elegibilidade

Use mapeamento claro:

```ts
const isPending = statusRecord === 'TIME_OFF_REQUEST' || statusRecord === 'WORK_TIME_REQUEST';
const isApproved = statusRecord === 'TIME_OFF' || statusRecord === 'UPDATED';
const isRejected = statusRecord === 'TIME_OFF_REJECTED' || statusRecord === 'WORK_TIME_REJECTED' || statusRecord === 'UPDATE_REJECTED';
```

Ações de aprovar/rejeitar só aparecem para pendentes.

### 5. Confirmação obrigatória

Antes de chamar `approveTimeOff` ou `rejectTimeOff`, exiba confirmação com:

- nome;
- período/data;
- horas;
- registro afetado;
- efeito da decisão.

### 6. Download de evidência

Preserve o fluxo atual:

- usar `resolveDocumentId(record)`;
- se houver documento, exibir chip/card de anexo;
- permitir download com `downloadDocument(documentId, fileName, employeeId)`.

### 7. Remova o legado

Após implementar e testar:

- remova tabela/renderização antiga;
- remova `useIsDesktop` local se substituído;
- remova imports não usados;
- remova comentários obsoletos.

## Validação obrigatória

Execute:

```bash
npm run lint
npm run build
```

Depois valide manualmente:

- `/aprovacoes-abono` desktop;
- `/aprovacoes-abono` mobile;
- busca por colaborador;
- filtros de status;
- seleção;
- download de anexo;
- aprovar com confirmação;
- rejeitar com confirmação;
- estado vazio;
- loading/mutação.

## Saída final esperada do Codex

Informe:

- arquivos alterados;
- componentes criados;
- contratos preservados;
- comandos executados e resultado;
- qualquer pendência técnica.
