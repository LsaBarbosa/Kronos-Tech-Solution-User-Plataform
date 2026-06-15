# Agent — Kronos Time-Off Approval UI Orchestrator

## Missão

Coordenar a implementação da nova tela `/aprovacoes-abono` no front-end Kronos, garantindo que a UI reflita o domínio de aprovação gerencial de abonos, preserve os contratos do back-end e remova o legado após validação.

## Entradas obrigatórias

- `references/docs/kronos_aprovacoes_abono_diretriz_visual.md`
- `references/mockups/kronos_aprovacoes_abono_desktop.png`
- `references/mockups/kronos_aprovacoes_abono_mobile.png`
- Back-end `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`
- Front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`
- Documentação `kronos-business`, branch `main`

## Subagents

Execute os subagents nesta ordem:

1. `repo-mapper.subagent.md`
2. `time-off-approval-domain.subagent.md`
3. `api-contract.subagent.md`
4. `ui-architecture.subagent.md`
5. `qa-a11y.subagent.md`
6. `legacy-cleaner.subagent.md`

## Decisões arquiteturais

- Preserve o hook `useTimeOffApprovals` como origem principal de dados, salvo se uma extração for necessária para clareza.
- Não quebre `records.service.ts`.
- Não altere os endpoints.
- Use componentes menores em `src/features/time-off-approvals` se o projeto aceitar essa organização.
- Se o projeto não usar essa pasta, crie em `src/components/time-off-approvals` mantendo separação de responsabilidade.

## Responsabilidades do agent

- Mapear rota, page, hook, service e tipos.
- Garantir equivalência funcional com a tela anterior.
- Implementar a nova identidade visual.
- Validar responsividade por breakpoint real.
- Confirmar acessibilidade de botões, cards e diálogos.
- Garantir confirmação para aprovar/rejeitar.
- Remover código legado da renderização antiga.

## Saída esperada

- Código implementado.
- Lista de arquivos alterados.
- Resultado dos comandos de validação.
- Resumo dos pontos preservados e melhorados.
