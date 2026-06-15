# Skill — Kronos `/aprovacoes-abono` UI Refactor

## Papel da skill

Você é uma skill especializada em refatorar a tela `/aprovacoes-abono` do Kronos para uma experiência de **mesa de aprovação gerencial de abonos**.

O foco é implementar uma nova UI/UX preservando o contrato existente, as regras de negócio e a rastreabilidade da decisão gerencial.

## Contexto de negócio

A tela `/aprovacoes-abono` pertence ao módulo de jornada/ponto e é usada por `MANAGER` para analisar solicitações de abono ou esquecimento de ponto.

A tela deve permitir:

- listar solicitações paginadas;
- filtrar por colaborador;
- filtrar por status;
- selecionar solicitação;
- visualizar evidência/anexo quando existir;
- entender horas abonadas e registros afetados;
- aprovar ou rejeitar;
- evitar decisão sem contexto;
- deixar claro que a decisão afeta ponto e possui impacto trabalhista.

## Fonte visual obrigatória

Leia antes de implementar:

- `references/docs/kronos_aprovacoes_abono_diretriz_visual.md`
- `references/mockups/kronos_aprovacoes_abono_desktop.png`
- `references/mockups/kronos_aprovacoes_abono_mobile.png`

## Contratos que devem ser preservados

No front-end:

- `src/pages/ManualRegisterApprovals.tsx`
- `src/hooks/useTimeOffApprovals.ts`
- `src/service/records.service.ts`
- `src/types/recordApproval.ts`
- `src/service/document.service.ts`
- `src/utils/document-resolution.ts`

No back-end:

- `GET /records/time-off/requests`
- `PATCH /records/time-off/approve/{timeRecordId}`
- `PATCH /records/time-off/reject/{timeRecordId}`

Não altere assinatura, rota, método HTTP, nomes de parâmetros ou payload.

## Experiência desktop

Implemente desktop como **Time-Off Approval Desk**:

- sidebar e header preservados;
- hero institucional com métricas: pendentes, aprovados, rejeitados, com anexo;
- fila de solicitações com busca e chips de status;
- seleção explícita de uma solicitação;
- painel lateral com:
  - colaborador;
  - data/período;
  - status;
  - evidência/anexo;
  - horas abonadas;
  - registros afetados;
  - regra de decisão;
  - botões separados: `Rejeitar abono` e `Aprovar abono`;
- confirmações antes de aprovar/rejeitar;
- estados de loading, vazio, erro e mutação.

## Experiência mobile

Implemente mobile como **Inbox de abonos**:

- topo compacto sem tabela;
- métricas resumidas;
- busca e chips de status;
- cards por solicitação;
- card selecionável;
- painel fixo inferior com resumo da solicitação selecionada;
- botões grandes de rejeitar/aprovar;
- abrir detalhe/evidência em modal, drawer ou bottom sheet;
- não usar a tabela desktop reduzida.

## Regras visuais obrigatórias

- `PENDING`/`TIME_OFF_REQUEST`/`WORK_TIME_REQUEST`: amarelo.
- Aprovado: verde.
- Rejeitado: vermelho.
- Evidência/anexo: roxo.
- Botões de aprovar e rejeitar devem ser separados visualmente.
- Evidência deve ficar visível antes da decisão quando houver documento.
- Solicitação finalizada não deve exibir CTA de aprovar/rejeitar.
- Mutação em andamento deve bloquear os botões apenas no contexto afetado.

## Arquitetura sugerida

Crie uma arquitetura por feature, por exemplo:

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

`src/pages/ManualRegisterApprovals.tsx` deve virar composição limpa da nova feature.

## Critério de conclusão

A implementação só está completa quando:

- `npm run build` passa;
- `npm run lint` passa ou os problemas existentes ficam explicitamente separados;
- os fluxos de busca, filtro, download, aprovação e rejeição continuam operando;
- o legado visual antigo foi removido;
- desktop e mobile têm experiências distintas;
- a tela respeita a diretriz visual e os mockups.
