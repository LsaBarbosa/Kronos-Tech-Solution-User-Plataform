# Subagent — Repo Mapper

## Objetivo

Mapear a estrutura real do front-end e confirmar os arquivos afetados.

## Ler obrigatoriamente

- `package.json`
- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/pages/Avisos.tsx`
- `src/pages/CriarAviso.tsx`
- `src/hooks/useMessages.ts`
- `src/service/message.service.ts`
- `src/types/message.ts`
- componentes UI em `src/components/ui/*`
- `src/components/Sidebar.tsx`
- `src/components/Header.tsx`

## Saída

Gerar um resumo com:

- rota real (`/avisos` ou `/aviso`);
- página renderizada;
- hook usado;
- serviço usado;
- componentes que serão criados/removidos;
- riscos de compatibilidade.
