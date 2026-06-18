# Prompt para Codex CLI — Implementar Dashboard Today `/records/me/today`

Você é o agente de implementação do projeto Kronos.

## Contexto

Trabalhe com os repositórios:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `prod-redis`.
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Documentação: `kronos-business`, branch `main`.

## Objetivo

Adicionar à dashboard existente uma nova área operacional orientada ao endpoint:

```http
GET /records/me/today
```

A dashboard deve passar a priorizar a resposta desse endpoint na área de ponto do dia, sem recriar toda a página.

## Restrições fundamentais

- Não reescreva a dashboard do zero.
- Não remova perfil, avisos, pendências, atalhos, métricas ou navegação já existentes.
- Não crie outro fluxo de check-in.
- Não altere o back-end, salvo se encontrar divergência crítica de contrato que impeça o build.
- Não use mock em runtime.
- Não invente campos que não existem no DTO.
- Não exponha payloads sensíveis em logs.
- Preserve `PageShell`.
- Preserve a separação desktop/mobile já existente.

## Arquivos que você deve ler primeiro

### Referências deste pacote

```text
references/docs/kronos_dashboard_today_diretriz_visual.md
references/mockups/kronos_dashboard_today_mobile.png
references/project-context/contexto-confirmado.md
```

### Back-end

```text
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TodayTimeRecordStatusResponse.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TodayTimeRecordItemResponse.java
```

Confirmar:

```java
@PreAuthorize(ANY_EMPLOYEE)
@GetMapping(ME_TODAY)
public ResponseEntity<TodayTimeRecordStatusResponse> getTodayStatus()
```

### Front-end

```text
src/pages/Dashboard.tsx
src/components/dashboard-command-center/DashboardDesktop.tsx
src/components/dashboard-command-center/DashboardMobile.tsx
src/components/dashboard-command-center/dashboard-command-center.types.ts
src/components/checkin/CheckinDashboardCard.tsx
src/hooks/useDashboardData.ts
src/service/records.service.ts
src/config/api-routes.ts
src/context/CheckinContext.tsx
src/context/CheckinContextDef.ts
```

### Documentação

No `kronos-business`, ler:

```text
04-mapa-modulos-telas.md
00-estado-atual-prod-hostinger-v2.md
```

Procurar também por:

```text
records/me/today
Dashboard
Ponto
Check-in
```

## Implementação obrigatória

### 1. Tipos

Criar tipos front-end para:

```ts
interface TodayTimeRecordStatusResponse {
  date: string;
  status: string;
  nextAction: string;
  lastRecordAt: string | null;
  lastRecordType: string | null;
  records: TodayTimeRecordItemResponse[];
  source: string;
  timezone: string;
}

interface TodayTimeRecordItemResponse {
  id: number;
  actionType: string;
  recordedAt: string;
  status: string;
  source: string;
}
```

Ajustar nullability de forma defensiva se o front já possuir padrão específico.

### 2. Service

Adicionar em `src/service/records.service.ts` ou service equivalente:

```ts
export const fetchTodayTimeRecordStatus = async (): Promise<TodayTimeRecordStatusResponse> => {
  const response = await api.get<unknown>(`${RECORDS_BASE_URL}/me/today`);
  return normalize...
};
```

Usar helpers do projeto, como `extractObject`, quando aplicável.

### 3. Hook

Criar hook dedicado:

```ts
useTodayTimeRecordStatus()
```

Deve fornecer:

```ts
{
  todayStatus,
  isLoadingToday,
  todayError,
  refreshToday
}
```

O hook deve:

- carregar no mount;
- permitir retry;
- tratar erro;
- normalizar `records` vazio;
- refetch após check-in bem-sucedido, se possível.

### 4. Formatadores

Criar utilitário de domínio para:

- rótulo de `status`;
- tom visual de `status`;
- rótulo de `nextAction`;
- rótulo de `actionType`;
- rótulo de `lastRecordType`;
- formatação de `recordedAt`;
- contagem de pendências;
- consistência de sequência;
- fallback para source/timezone.

Não quebre se o back-end enviar valores novos.

### 5. UI desktop

No desktop, adicionar painel Today sem refazer a página inteira.

O painel deve exibir:

- data atual;
- timezone;
- source;
- status atual;
- próxima ação;
- último registro;
- tipo do último registro;
- timeline do dia;
- resumo de pendências/consistência;
- CTA para abrir o check-in;
- CTA secundário para espelho/relatório, conforme ações já existentes.

A experiência desktop pode ser mais densa e comparativa.

### 6. UI mobile

No mobile, adicionar experiência orientada à próxima ação:

- topo/card com próxima ação;
- status do dia;
- último registro;
- timeline em cards;
- resumo rápido;
- source/timezone;
- CTA forte e acessível.

Não usar tabela no mobile.

### 7. Check-in

O botão principal deve chamar o fluxo atual:

```ts
openCheckin()
```

Não crie nova captura de câmera/geolocalização.

Após sucesso no check-in, atualize a consulta do `/records/me/today`.

### 8. Testes

Adicionar testes para:

- service/hook, se houver padrão;
- formatadores;
- componente com estado carregando;
- componente com erro;
- componente sem registros;
- componente com registros;
- CTA chamando `openCheckin`.

### 9. Validação

Executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Corrigir todos os erros gerados pela implementação.

## Critério de conclusão

A tarefa está concluída quando:

- `/dashboard` continua funcionando;
- o novo painel Today aparece no desktop;
- o novo painel Today aparece no mobile;
- o painel consome `/records/me/today`;
- o CTA de ponto usa o fluxo atual de check-in;
- dados de `source` e `timezone` são visíveis;
- timeline usa `records[]`;
- os estados obrigatórios foram tratados;
- testes passam;
- build passa.

## Relatório final esperado

Ao final, gere um resumo objetivo com:

- arquivos alterados;
- componentes criados;
- contrato consumido;
- testes criados;
- comandos executados;
- pendências não resolvidas, se houver.
