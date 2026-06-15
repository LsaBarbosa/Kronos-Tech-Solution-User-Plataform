# Kronos Codex Package — Aprovação de Férias `/ferias`

Este pacote orienta o **Codex CLI** na refatoração completa da tela `/ferias` no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.

A tela deve deixar de ser uma listagem simples e passar a funcionar como uma **mesa de aprovação gerencial de férias**.

## Escopo

- Repositório front-end: `LsaBarbosa/Kronos-Tech-Solution-User-Plataform`
- Branch front-end: `feature/lgpd-compliance-new-ui`
- Repositório back-end: `LsaBarbosa/Kronos-Tech-Solutions-KTS`
- Branch back-end: `PROD_HOSTINGER_V2`
- Repositório de documentação: `LsaBarbosa/kronos-business`
- Branch de documentação: `main`
- Rota alvo: `/ferias`

## Referências incluídas

```text
references/
├── docs/
│   └── kronos_aprovar_ferias_diretriz_visual.md
└── mockups/
    ├── kronos_aprovar_ferias_desktop.png
    └── kronos_aprovar_ferias_mobile.png
```

## Resultado esperado

### Desktop

Experiência de **mesa de aprovação**:

- sidebar persistente;
- header de contexto;
- hero institucional;
- métricas superiores;
- filtros horizontais;
- inbox/tabela de solicitações;
- detalhe lateral da solicitação selecionada;
- ações separadas de aprovar e rejeitar lote;
- confirmação antes de mutações sensíveis.

### Mobile

Experiência de **inbox de decisões**:

- topo compacto;
- métricas curtas;
- busca simples;
- chips de status;
- cards de solicitação;
- seleção contextual;
- painel fixo inferior;
- botões grandes de aprovar/rejeitar.

## Arquivos de execução

```text
codex/
├── skills/
│   └── kronos-aprovar-ferias-ui.skill.md
├── agents/
│   └── kronos-aprovar-ferias-ui.agent.md
├── rules/
│   └── kronos-aprovar-ferias-ui.rules.md
└── subagents/
    ├── repo-mapper.subagent.md
    ├── vacation-approval-domain.subagent.md
    ├── ui-architecture.subagent.md
    ├── api-contract.subagent.md
    ├── qa-a11y.subagent.md
    └── legacy-cleaner.subagent.md
```

## Ordem recomendada

1. Ler `prompt-codex-aprovar-ferias-ui.md`.
2. Aplicar `codex/rules/kronos-aprovar-ferias-ui.rules.md`.
3. Executar o plano em `plano-acao-aprovar-ferias-ui.md`.
4. Validar com `checklist-validacao-aprovar-ferias-ui.md`.

## Observações críticas

- A rota `/ferias` é gerencial e deve ser usada por `MANAGER`.
- O fluxo aprova/rejeita **lotes de registros diários** criados pela solicitação de férias.
- `REQUEST_VACATION` deve ser entendido como status pendente.
- Aprovação deve converter registros para `VACATION`.
- Rejeição deve converter registros para `VACATION_REJECTED`.
- Estados finalizados não devem exibir CTA ativo de aprovação/rejeição.
- As decisões são sensíveis e precisam de confirmação explícita.
