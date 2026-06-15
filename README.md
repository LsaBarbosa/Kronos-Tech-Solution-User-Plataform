# Kronos — Pacote Codex CLI para `/relatorio-detalhado`

Este pacote orienta o Codex CLI na refatoração da tela de **relatório detalhado de ponto** da rota `/relatorio-detalhado` no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.

## Objetivo

Transformar a rota `/relatorio-detalhado` em uma **central de solicitação e geração de relatório de ponto**, com experiência diferente para desktop e mobile:

- **Desktop:** construtor avançado de relatório em duas colunas, com filtros, governança por ROLE, prévia e área de resultados.
- **Mobile:** fluxo guiado em etapas, com escopo atual, datas, referência/status, explicação por ROLE e CTA fixo inferior.

## Referências obrigatórias

Use estes arquivos antes de implementar:

```text
references/docs/kronos_relatorio_detalhado_diretriz_visual.md
references/mockups/kronos_relatorio_detalhado_desktop.png
references/mockups/kronos_relatorio_detalhado_mobile.png
```

## Repositórios e branches

```text
Back-end:  LsaBarbosa/Kronos-Tech-Solutions-KTS            branch PROD_HOSTINGER_V2
Front-end: LsaBarbosa/Kronos-Tech-Solution-User-Plataform  branch feature/lgpd-compliance-new-ui
Docs:      LsaBarbosa/kronos-business                      branch main
```

## Contrato HTTP que não deve ser alterado

A tela deve continuar usando o contrato já existente:

```http
POST /records/report?employeeId={uuid opcional}
```

Body:

```json
{
  "reference": "08:00",
  "active": true,
  "dates": ["13-06-2026", "14-06-2026"],
  "statuses": ["CREATED", "ABSENCE"]
}
```

Regras:

- `reference` deve ser `HH:mm`.
- `dates` deve ter pelo menos uma data.
- `employeeId` só deve ser enviado quando houver colaborador selecionado/permitido.
- Para `PARTNER`, o colaborador fica bloqueado na sessão.
- Para `MANAGER`, usar colaboradores do tenant/equipe.
- Para `CTO`, comunicar escopo administrativo ampliado e preservar capacidade de seleção quando disponível no produto.

## Arquivos de orientação

```text
codex/skills/kronos-relatorio-detalhado-ui.skill.md
codex/agents/kronos-relatorio-detalhado-ui.agent.md
codex/subagents/repo-mapper.subagent.md
codex/subagents/report-domain.subagent.md
codex/subagents/ui-architecture.subagent.md
codex/subagents/api-contract.subagent.md
codex/subagents/qa-a11y.subagent.md
codex/subagents/legacy-cleaner.subagent.md
codex/rules/kronos-relatorio-detalhado-ui.rules.md
docs/flag-redis-adherence.md
docs/api-contract-map.md
plano-acao-relatorio-detalhado-ui.md
prompt-codex-relatorio-detalhado-ui.md
checklist-validacao-relatorio-detalhado-ui.md
```

## Resultado esperado

Ao final, a rota `/relatorio-detalhado` deve:

- preservar os dados e ações existentes;
- remover visual legado da tela, mantendo apenas a nova implementação;
- ter UX distinta em desktop e mobile;
- respeitar permissões por ROLE;
- mostrar exportação apenas após resultado;
- manter acessibilidade, feedbacks de erro e estados de loading.
