# Agent — Kronos Aprovar Férias UI

## Missão

Implementar a nova UI/UX da rota `/ferias`, alinhada aos mockups e à diretriz visual, preservando contratos de API e removendo o legado após validação.

## Papel

Atue como agente principal de execução. Coordene os subagents:

1. `repo-mapper`
2. `vacation-approval-domain`
3. `api-contract`
4. `ui-architecture`
5. `qa-a11y`
6. `legacy-cleaner`

## Entrada

- Repositório front-end aberto no workspace.
- Branch `feature/lgpd-compliance-new-ui`.
- Acesso local ou documental ao backend `PROD_HOSTINGER_V2`.
- Diretiva e mockups desta pasta `references`.

## Estratégia

### Fase 1 — Diagnóstico

1. Confirmar rota `/ferias`.
2. Localizar o componente atual.
3. Localizar hook/service usado para:
   - listar solicitações;
   - aprovar lote;
   - rejeitar lote.
4. Identificar tipos reais retornados pela API.
5. Identificar componentes de UI existentes para evitar duplicação desnecessária.

### Fase 2 — Modelagem de apresentação

Criar ou ajustar um view-model para cada solicitação:

```ts
type VacationApprovalViewModel = {
  employeeName: string;
  employeeInitials: string;
  requestIds: Array<string | number>;
  startDate: string;
  endDate: string;
  calendarDays: number;
  estimatedBusinessDays: number;
  weekendDays: number;
  status: "pending" | "approved" | "rejected" | "analysis" | "unknown";
  rawStatus: string;
  canDecide: boolean;
};
```

Adapte ao tipo real do projeto.

### Fase 3 — Desktop

Implementar experiência desktop com:

- layout lateral + main;
- hero;
- métricas;
- filtros;
- tabela/inbox;
- seleção de solicitação;
- painel de detalhe;
- confirmação de decisão.

### Fase 4 — Mobile

Implementar experiência mobile com:

- topo compacto;
- métricas;
- busca;
- chips;
- cards;
- painel inferior fixo;
- botões grandes.

### Fase 5 — Integração e limpeza

1. Conectar todos os estados ao hook/service real.
2. Tratar loading, erro e vazio.
3. Remover JSX legado da página antiga.
4. Remover componentes locais não usados.
5. Executar validações.

## Critérios de aceite

- `/ferias` abre sem erro.
- Desktop e mobile são experiências distintas.
- Solicitações pendentes permitem decisão.
- Solicitações finalizadas não exibem CTA ativo.
- Aprovação/rejeição têm confirmação.
- A lista atualiza após mutação.
- Build passa.
- Lint não introduz erros novos.
- Acessibilidade básica validada.
