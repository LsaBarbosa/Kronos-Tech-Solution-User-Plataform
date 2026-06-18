# Plano de ação — Dashboard Today `/records/me/today`

## Fase 0 — Preparação

### Task 0.1 — Confirmar branches

- Back-end: `prod-redis`.
- Front-end: `feature/lgpd-compliance-new-ui`.
- Documentação: `main`.

Critério de aceite:
- O Codex deve parar se estiver em branch incorreta.

### Task 0.2 — Ler diretriz visual

Ler:

```text
references/docs/kronos_dashboard_today_diretriz_visual.md
references/mockups/kronos_dashboard_today_mobile.png
references/project-context/contexto-confirmado.md
```

Critério de aceite:
- O Codex deve entender que o mockup disponível é mobile.
- Para desktop, deve usar diretriz + estrutura atual do dashboard.

---

## Fase 1 — Mapeamento técnico

### Task 1.1 — Confirmar contrato backend

Ler no back-end:

```text
TimeRecordController.java
ApiPaths.java
TodayTimeRecordStatusResponse.java
TodayTimeRecordItemResponse.java
```

Validar:

- `GET /records/me/today`
- `ANY_EMPLOYEE`
- campos do DTO.

### Task 1.2 — Mapear dashboard atual

Ler no front-end:

```text
src/pages/Dashboard.tsx
src/components/dashboard-command-center/DashboardDesktop.tsx
src/components/dashboard-command-center/DashboardMobile.tsx
src/components/dashboard-command-center/dashboard-command-center.types.ts
src/hooks/useDashboardData.ts
src/service/records.service.ts
src/components/checkin/CheckinDashboardCard.tsx
src/context/CheckinContext.tsx
```

Identificar o melhor ponto de inserção sem reescrever a página.

---

## Fase 2 — Contrato front-end

### Task 2.1 — Criar tipos

Criar ou adicionar tipos:

```ts
export interface TodayTimeRecordStatusResponse {
  date: string;
  status: string;
  nextAction: string;
  lastRecordAt: string | null;
  lastRecordType: string | null;
  records: TodayTimeRecordItemResponse[];
  source: string;
  timezone: string;
}

export interface TodayTimeRecordItemResponse {
  id: number;
  actionType: string;
  recordedAt: string;
  status: string;
  source: string;
}
```

### Task 2.2 — Criar service

Adicionar função:

```ts
fetchTodayTimeRecordStatus(): Promise<TodayTimeRecordStatusResponse>
```

Endpoint:

```http
GET /records/me/today
```

Usar normalização defensiva conforme padrão do projeto.

---

## Fase 3 — Domínio visual

### Task 3.1 — Criar formatadores

Criar utilitários para:

- formatar data;
- formatar horário;
- mapear `status`;
- mapear `nextAction`;
- mapear `lastRecordType`;
- mapear `actionType`;
- mapear `source`;
- contar pendências;
- indicar consistência da sequência.

### Task 3.2 — Mapear estados obrigatórios

Estados:

- sem registro hoje;
- entrada registrada;
- almoço iniciado;
- almoço finalizado;
- dia completo;
- registro pendente;
- sequência inconsistente;
- carregando;
- erro.

---

## Fase 4 — Hook

### Task 4.1 — Criar hook

Criar:

```text
src/hooks/useTodayTimeRecordStatus.ts
```

O hook deve retornar:

- `todayStatus`;
- `isLoadingToday`;
- `todayError`;
- `refreshToday`.

### Task 4.2 — Atualizar após check-in

Integrar com o fluxo atual de check-in.

Opções aceitáveis:

- refetch após sucesso do `CheckinContext`;
- refetch ao fechar modal quando `lastAttemptAt` mudou;
- refetch em foco da janela.

Não duplicar fluxo de check-in.

---

## Fase 5 — Componentes UI

### Task 5.1 — Criar componente desktop

Criar painel desktop com:

- status do dia;
- próxima ação;
- último registro;
- timeline;
- resumo;
- source/timezone.

### Task 5.2 — Criar componente mobile

Criar painel mobile com:

- status principal;
- CTA forte;
- timeline em cards;
- resumo rápido;
- origem/confiança;
- CTA fixo ou destaque equivalente.

### Task 5.3 — Integrar em `DashboardDesktop`

Adicionar o novo painel na área do controle de ponto, sem quebrar layout.

### Task 5.4 — Integrar em `DashboardMobile`

Adicionar a experiência mobile do Today, preferencialmente substituindo o card genérico de check-in para evitar duplicidade.

---

## Fase 6 — Testes

### Task 6.1 — Testes de formatadores

Cobrir:

- status conhecido/desconhecido;
- nextAction conhecido/desconhecido;
- records vazios;
- pending count;
- source/timezone fallback;
- sequência OK/inconsistente quando possível.

### Task 6.2 — Testes de renderização

Cobrir:

- loading;
- erro;
- sem registros;
- com registros;
- CTA chamando `openCheckin`.

---

## Fase 7 — Validação

Executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Validação manual:

- `/dashboard` desktop.
- `/dashboard` mobile.
- check-in abre normalmente.
- após check-in, status diário atualiza.
- sem regressão em avisos, perfil, pendências e atalhos.

---

## Fase 8 — Limpeza

Remover apenas código legado substituído e comprovadamente sem uso.

Não remover:

- `CheckinContext`;
- `CheckinModal`;
- `CheckinDashboardCard`, se houver qualquer consumidor;
- áreas existentes da dashboard.
