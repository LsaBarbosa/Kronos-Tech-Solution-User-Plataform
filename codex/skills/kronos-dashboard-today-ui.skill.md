# Skill — Kronos Dashboard Today UI

## Missão

Refatorar incrementalmente a dashboard do Kronos para incluir uma área operacional baseada em `GET /records/me/today`.

## Escopo obrigatório

- Ler back-end `Kronos-Tech-Solutions-KTS` branch `prod-redis`.
- Ler front-end `Kronos-Tech-Solution-User-Plataform` branch `feature/lgpd-compliance-new-ui`.
- Ler documentação `kronos-business` branch `main`.
- Ler `references/docs/kronos_dashboard_today_diretriz_visual.md`.
- Ler `references/mockups/kronos_dashboard_today_mobile.png`.

## Entrega esperada

Criar uma experiência “Today Workday Command Center” dentro da dashboard existente.

## Backend contract

Preservar o contrato:

```http
GET /records/me/today
```

Resposta esperada:

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

## Regras de implementação

- Não recriar a dashboard do zero.
- Não remover as áreas já funcionais de avisos, perfil, pendências e atalhos.
- Substituir ou enriquecer apenas a área de ponto/check-in atual.
- Preservar `PageShell`, `DashboardDesktop`, `DashboardMobile` e o switch responsivo atual.
- Criar componentes específicos para o Today Card/Timeline.
- Reutilizar `openCheckin` do `CheckinContext`.
- Atualizar dados após check-in com refetch seguro.
- Tratar loading, erro, vazio e sequência inconsistente.
- Não usar dados mockados em produção.
- Não expor dados sensíveis em log.
- Manter TypeScript estrito e testes.
