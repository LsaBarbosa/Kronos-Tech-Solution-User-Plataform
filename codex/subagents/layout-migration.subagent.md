# Subagent — Layout Migration

## Missão
Corrigir FE-AUD-001 migrando páginas legadas para o padrão global `PageShell`.

## Páginas alvo

- `src/pages/CriarEmpresa.tsx`
- `src/pages/BuscarEmpresa.tsx`
- `src/pages/AtualizarEmpresa.tsx`
- `src/pages/CriarAviso.tsx`
- `src/pages/EnviarDocumentos.tsx`
- `src/pages/CriarManager.tsx`
- `src/pages/NotFound.tsx`

## Regras

- Não duplicar `Header`/`Sidebar`.
- Não quebrar formulário, submit, loading ou navegação.
- Ajustar padding de mobile para CTAs fixos quando aplicável.
- `NotFound` deve respeitar estado autenticado/público.

## Validação

- Buscar imports diretos remanescentes de `Header` e `Sidebar` nas páginas alvo.
- Rodar lint e typecheck após migração.
