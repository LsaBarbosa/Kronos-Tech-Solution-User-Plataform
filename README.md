# Kronos — Pacote Codex CLI — Refatoração `/solicitar-abono`

Este pacote orienta o Codex CLI a refatorar a tela de solicitação de abono/esquecimento de ponto da plataforma Kronos.

## Escopo

- Repositório back-end: `Kronos-Tech-Solutions-KTS`
- Branch back-end: `PROD_HOSTINGER_V2`
- Repositório front-end: `Kronos-Tech-Solution-User-Plataform`
- Branch front-end: `feature/lgpd-compliance-new-ui`
- Repositório de documentação: `kronos-business`
- Branch documentação: `main`
- Rota alvo: `/solicitar-abono`
- Tela atual: `RequestManualRegistration`
- Objetivo de produto: transformar a tela em um fluxo guiado de justificativa de jornada, com UX distinta para desktop e mobile.

## Arquivos do pacote

```text
codex/
├── skills/
│   └── kronos-solicitar-abono-ui.skill.md
├── agents/
│   └── kronos-solicitar-abono-ui.agent.md
├── rules/
│   └── kronos-solicitar-abono-ui.rules.md
└── subagents/
    ├── repo-mapper.subagent.md
    ├── abono-domain.subagent.md
    ├── ui-architecture.subagent.md
    ├── api-contract.subagent.md
    ├── qa-a11y.subagent.md
    └── legacy-cleaner.subagent.md

plano-acao-solicitar-abono-ui.md
prompt-codex-solicitar-abono-ui.md
checklist-validacao-solicitar-abono-ui.md
references/
└── mockups/
    ├── kronos_solicitar_abono_desktop.png
    └── kronos_solicitar_abono_mobile.png
```

## Observações sobre os anexos recebidos

Os mockups disponíveis neste pacote são:

- `references/mockups/kronos_solicitar_abono_desktop.png`
- `references/mockups/kronos_solicitar_abono_mobile.png`

Também foi recebido um arquivo markdown chamado localmente como `kronos_usuario_diretriz_visual.md`. O conteúdo desse markdown descreve a rota `/usuario`, não `/solicitar-abono`. Por isso, ele foi preservado apenas como referência de identidade visual geral da plataforma, mas **não deve substituir uma diretriz específica de abono**.

O Codex deve procurar no workspace por `kronos_solicitar_abono_diretriz_visual.md`. Caso esse arquivo exista, ele deve ter prioridade sobre a referência de `/usuario`.

## Resultado esperado

A implementação deve entregar uma tela nova para `/solicitar-abono` com:

- desktop em formato de painel operacional;
- mobile em formato de fluxo guiado por etapas;
- reaproveitamento do contrato HTTP existente;
- preservação dos fluxos de validação;
- upload de evidência opcional e seguro;
- seleção explícita entre `TIME_OFF_REQUEST` e `FORGOTTEN_REGISTRATION`;
- resumo antes do envio;
- remoção do legado visual após validação.
