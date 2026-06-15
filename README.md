# Kronos — Pacote Codex CLI para `/aprovacoes-abono`

## Objetivo

Este pacote orienta o **Codex CLI** a refatorar a tela de aprovação de abonos da rota `/aprovacoes-abono`, no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.

A nova tela deve deixar de ser uma tabela/formulário legado e passar a funcionar como uma **mesa de aprovação gerencial de abonos**, com fila de solicitações, filtros, detalhe contextual, evidência/anexo, impacto em horas/registros e decisão explícita de aprovar ou rejeitar.

## Repositórios e branches obrigatórios

| Área | Repositório | Branch |
|---|---|---|
| Back-end | `Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` |
| Front-end | `Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` |
| Documentação | `kronos-business` | `main` |

## Arquivos de referência incluídos

```text
references/
├── docs/
│   └── kronos_aprovacoes_abono_diretriz_visual.md
└── mockups/
    ├── kronos_aprovacoes_abono_desktop.png
    └── kronos_aprovacoes_abono_mobile.png
```

## Arquivos do Codex

```text
codex/
├── skills/
│   └── kronos-aprovacoes-abono-ui.skill.md
├── agents/
│   └── kronos-aprovacoes-abono-ui.agent.md
├── rules/
│   └── kronos-aprovacoes-abono-ui.rules.md
└── subagents/
    ├── repo-mapper.subagent.md
    ├── time-off-approval-domain.subagent.md
    ├── ui-architecture.subagent.md
    ├── api-contract.subagent.md
    ├── qa-a11y.subagent.md
    └── legacy-cleaner.subagent.md
```

## Ordem recomendada

1. Leia `prompt-codex-aprovacoes-abono-ui.md`.
2. Carregue a skill principal.
3. Use o agent principal para coordenar os subagents.
4. Execute o plano em `plano-acao-aprovacoes-abono-ui.md`.
5. Valide com `checklist-validacao-aprovacoes-abono-ui.md`.

## Resultado esperado

- `/aprovacoes-abono` com **desktop e mobile realmente distintos**.
- Desktop com hero, métricas, fila, filtro, detalhe lateral e ações separadas.
- Mobile com inbox por cards, chips de status e painel fixo inferior de decisão.
- Contratos atuais preservados:
  - `GET /records/time-off/requests`
  - `PATCH /records/time-off/approve/{timeRecordId}`
  - `PATCH /records/time-off/reject/{timeRecordId}`
  - download de evidência por documento quando disponível.
- Legado removido após teste.
