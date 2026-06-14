# Subagent — repo-mapper

## Objetivo

Mapear a implementação atual de `/solicitar-abono` antes de qualquer alteração.

## Leituras obrigatórias

Front-end:

- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/pages/RequestManualRegistration.tsx`
- `src/hooks/useManualRegister.ts`
- `src/service/records.service.ts`
- `src/types/vacation.ts`
- `src/types/document.ts`
- `src/components/PageShell.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Header.tsx`

Documentação:

- `kronos-business/04-mapa-modulos-telas.md`
- `kronos-business/05-entradas-saidas-fluxos.md`
- `kronos-business/08-rotas-guards-permissoes.md`

## Saída esperada

Produzir um mapa com:

- rota;
- componente de página;
- hook;
- serviço HTTP;
- tipos TypeScript;
- componentes UI disponíveis;
- pontos de legado visual;
- riscos de alteração.
