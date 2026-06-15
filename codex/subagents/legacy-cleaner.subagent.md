# Subagent — Legacy Cleaner

## Objetivo

Remover a implementação visual antiga sem quebrar a rota ou os contratos.

## Remover/substituir

- tabela mobile reaproveitada como card legado;
- hook `useIsDesktop` manual baseado em `window.innerWidth`, se substituído por solução existente do projeto;
- JSX monolítico antigo dentro de `ManualRegisterApprovals.tsx`;
- comentários obsoletos;
- imports não usados.

## Preservar

- rota `/aprovacoes-abono`;
- `ManualRegisterApprovals` como page exportada;
- `useTimeOffApprovals` ou suas responsabilidades;
- download de evidência;
- toast de sucesso/erro;
- paginação.

## Saída

- Lista de código removido.
- Confirmação de ausência de legado renderizado.
