# Plano de ação — Refatoração `/aprovacoes-abono`

## Fase 0 — Preparação

### Task 0.1 — Confirmar branchs

```bash
git -C Kronos-Tech-Solution-User-Plataform status
git -C Kronos-Tech-Solution-User-Plataform branch --show-current
git -C Kronos-Tech-Solutions-KTS branch --show-current
git -C kronos-business branch --show-current
```

Critério:

- front-end em `feature/lgpd-compliance-new-ui`;
- back-end em `PROD_HOSTINGER_V2`;
- documentação em `main`.

### Task 0.2 — Criar checkpoint

```bash
git -C Kronos-Tech-Solution-User-Plataform status --short
git -C Kronos-Tech-Solution-User-Plataform diff -- src/pages/ManualRegisterApprovals.tsx
```

Não sobrescrever alterações locais sem revisão.

---

## Fase 1 — Leitura obrigatória

### Task 1.1 — Ler diretriz visual

Leia:

```text
references/docs/kronos_aprovacoes_abono_diretriz_visual.md
references/mockups/kronos_aprovacoes_abono_desktop.png
references/mockups/kronos_aprovacoes_abono_mobile.png
```

Extrair:

- objetivo de negócio;
- diferenças desktop/mobile;
- paleta;
- estados obrigatórios;
- regras de UX.

### Task 1.2 — Ler documentação de rotas

No `kronos-business`:

```text
04-mapa-modulos-telas.md
```

Confirmar:

- `/aprovacoes-abono`;
- componente `ManualRegisterApprovals`;
- papel `MANAGER`.

### Task 1.3 — Ler front-end legado

No front-end:

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
```

Mapear:

- rota;
- hook;
- service;
- tipos;
- paginação;
- download de documento;
- mutações de aprovar/rejeitar.

### Task 1.4 — Ler backend

No back-end:

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/application/service/TimeRecordService.java
```

Confirmar:

- `GET /records/time-off/requests`;
- `PATCH /records/time-off/approve/{timeRecordId}`;
- `PATCH /records/time-off/reject/{timeRecordId}`;
- permissão `MANAGER`.

---

## Fase 2 — Modelagem da nova UI

### Task 2.1 — Criar ViewModel

Criar ou adaptar uma camada de ViewModel para:

- métricas derivadas;
- status normalizado;
- solicitação selecionada;
- elegibilidade de ação;
- filtros;
- paginação;
- estado de confirmação.

Não duplicar chamada HTTP fora do hook atual sem necessidade.

### Task 2.2 — Criar componentes de domínio

Estrutura sugerida:

```text
src/features/time-off-approvals/
├── components/
├── hooks/
├── utils/
└── types.ts
```

Componentes mínimos:

- `TimeOffApprovalDesktop`
- `TimeOffApprovalMobile`
- `TimeOffApprovalMetrics`
- `TimeOffApprovalFilters`
- `TimeOffApprovalQueue`
- `TimeOffApprovalCard`
- `TimeOffApprovalDetailPanel`
- `TimeOffApprovalDecisionBar`
- `TimeOffApprovalConfirmDialog`
- `TimeOffApprovalStatusBadge`

### Task 2.3 — Definir status visual

Mapear:

| Status | Label | Cor | Ação? |
|---|---|---|---|
| `TIME_OFF_REQUEST` | Pendente | amarelo | sim |
| `WORK_TIME_REQUEST` | Pendente | amarelo/azul operacional | sim |
| `TIME_OFF` | Aprovado | verde | não |
| `UPDATED` | Aprovado | verde | não |
| `TIME_OFF_REJECTED` | Rejeitado | vermelho | não |
| `WORK_TIME_REJECTED` | Rejeitado | vermelho | não |
| `UPDATE_REJECTED` | Rejeitado | vermelho | não |

---

## Fase 3 — Implementação desktop

### Task 3.1 — Hero e métricas

Implementar hero conforme mockup desktop:

- título: `Decida abonos com evidência, período e contexto`;
- subtítulo: `Filtre solicitações, analise documentos anexos e aprove ou rejeite registros de abono.`;
- métricas:
  - pendentes;
  - aprovados;
  - rejeitados;
  - com anexo.

### Task 3.2 — Fila de solicitações

Implementar card `Fila de solicitações`:

- busca por colaborador;
- chips de status: `PENDING`, `APPROVED`, `REJECTED`;
- paginação;
- linha selecionável;
- não depender apenas de cor para seleção.

### Task 3.3 — Painel lateral

Implementar `Solicitação selecionada`:

- nome;
- data/período;
- status;
- anexo/evidência;
- horas abonadas;
- registros afetados;
- regra de decisão;
- ações separadas.

### Task 3.4 — Confirmação

Antes de aprovar/rejeitar, abrir confirmação com:

- nome do colaborador;
- período;
- horas;
- registro afetado;
- efeito da decisão.

---

## Fase 4 — Implementação mobile

### Task 4.1 — Inbox mobile

Implementar mobile sem tabela:

- topo compacto;
- métricas;
- busca;
- chips;
- cards empilhados.

### Task 4.2 — Painel fixo inferior

Implementar painel inferior com:

- colaborador selecionado;
- data/período;
- horas;
- status;
- registros;
- botão `Rejeitar`;
- botão `Aprovar abono`.

### Task 4.3 — Detalhe/evidência

Abrir detalhe por drawer/modal/bottom sheet com:

- texto de impacto;
- anexo e download quando existir;
- status e metadados.

---

## Fase 5 — Estados e segurança visual

### Task 5.1 — Estados obrigatórios

Implementar:

- carregando;
- vazio;
- erro;
- mutação;
- sucesso;
- sem seleção;
- finalizado sem ação.

### Task 5.2 — Acessibilidade

Validar:

- labels;
- teclado;
- foco;
- contraste;
- texto em status;
- aria-labels para ícones isolados.

---

## Fase 6 — Remoção do legado

### Task 6.1 — Remover renderização antiga

Substituir o JSX monolítico da página por composição nova.

### Task 6.2 — Limpar imports e utilitários mortos

Remover:

- imports não usados;
- `useIsDesktop` antigo se não for mais usado;
- comentários obsoletos;
- componentes locais antigos que viraram feature.

---

## Fase 7 — Validação

### Task 7.1 — Build e lint

```bash
npm run lint
npm run build
```

### Task 7.2 — Testes manuais

Validar como `MANAGER`:

- abrir `/aprovacoes-abono`;
- buscar colaborador;
- filtrar `PENDING`, `APPROVED`, `REJECTED`;
- selecionar solicitação;
- baixar evidência;
- aprovar com confirmação;
- rejeitar com confirmação;
- abrir em viewport desktop;
- abrir em viewport mobile.

### Task 7.3 — Relatório final

Registrar:

- arquivos alterados;
- contratos preservados;
- comandos executados;
- pendências, se houver.
