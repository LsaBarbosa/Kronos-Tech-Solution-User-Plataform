# Kronos — Pacote Codex CLI para Dashboard Today

## Objetivo

Implementar, no front-end `Kronos-Tech-Solution-User-Plataform` branch `feature/lgpd-compliance-new-ui`, a evolução da dashboard para priorizar os dados do endpoint:

```http
GET /records/me/today
```

A implementação deve adicionar uma área operacional de ponto do dia na dashboard existente, sem recriar a página inteira.

## Alvo técnico

- Rota: `/dashboard`
- Página atual: `src/pages/Dashboard.tsx`
- Service provável: `src/service/records.service.ts`
- Componentes atuais:
  - `src/components/dashboard-command-center/DashboardDesktop.tsx`
  - `src/components/dashboard-command-center/DashboardMobile.tsx`
  - `src/components/checkin/CheckinDashboardCard.tsx`

## Diretrizes

- Não recriar toda a dashboard.
- Inserir o novo elemento de modo eficaz e orientado a UX/UI.
- Desktop e mobile devem ser experiências diferentes.
- Mobile deve responder rapidamente: “o que faço agora?”.
- Desktop deve mostrar contexto, timeline e metadados com maior densidade.
- O CTA principal deve ser controlado por `nextAction`.
- O fluxo de registro de ponto deve continuar usando o fluxo atual de check-in/biometria/geolocalização.
- Não inventar dados que o back-end não fornece.

## Arquivos do pacote

```text
codex/
  skills/
  agents/
  rules/
  subagents/
references/
  docs/
  mockups/
  project-context/
plano-acao-dashboard-today-ui.md
prompt-codex-dashboard-today-ui.md
checklist-validacao-dashboard-today-ui.md
```

## Execução recomendada

1. Copiar este pacote para a raiz do workspace local.
2. Abrir o front-end na branch correta.
3. Colar o conteúdo de `prompt-codex-dashboard-today-ui.md` no Codex CLI.
4. Validar com:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
   - `npx vitest run`
5. Testar visualmente mobile e desktop.

## Referências de aderência existentes no repositório

- `docs/flag-redis-adherence.md`
- `docs/api-contract-map.md`
