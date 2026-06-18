# Subagent — Repo Mapper

## Objetivo

Mapear os arquivos reais que serão lidos e alterados.

## Ler obrigatoriamente

Back-end `prod-redis`:

- `src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java`
- `src/main/java/com/kts/kronos/constants/ApiPaths.java`
- `src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TodayTimeRecordStatusResponse.java`
- `src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TodayTimeRecordItemResponse.java`

Front-end:

- `src/pages/Dashboard.tsx`
- `src/components/dashboard-command-center/DashboardDesktop.tsx`
- `src/components/dashboard-command-center/DashboardMobile.tsx`
- `src/components/dashboard-command-center/dashboard-command-center.types.ts`
- `src/components/checkin/CheckinDashboardCard.tsx`
- `src/hooks/useDashboardData.ts`
- `src/service/records.service.ts`
- `src/context/CheckinContext.tsx`
- `src/context/CheckinContextDef.ts`

Documentação:

- `kronos-business` mapas de módulos, contratos e estado atual.
- `references/docs/kronos_dashboard_today_diretriz_visual.md`
