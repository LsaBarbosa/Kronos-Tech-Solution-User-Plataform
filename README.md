# Kronos — Pacote Codex CLI para `/documentos`

Este pacote contém instruções, skills, agents, subagents, rules, plano de ação e prompt para refatorar a tela de busca documental da rota `/documentos`.

## Objetivo

Transformar `/documentos` em uma **central de busca documental segura**, com duas experiências distintas:

- **Desktop:** console documental com filtros, escopo por role e resultados lado a lado.
- **Mobile:** busca guiada por etapas, com CTA fixo e cards de documentos.

## Repositórios alvo

| Repositório | Branch |
|---|---|
| `Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` |
| `Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` |
| `kronos-business` | `main` |

## Arquivos de referência

```txt
references/docs/kronos_documentos_diretriz_visual.md
references/mockups/kronos_documentos_desktop.png
references/mockups/kronos_documentos_mobile.png
```

## Arquivos principais do pacote

```txt
codex/skills/kronos-documentos-ui.skill.md
codex/agents/kronos-documentos-ui.agent.md
codex/rules/kronos-documentos-ui.rules.md
plano-acao-documentos-ui.md
prompt-codex-documentos-ui.md
checklist-validacao-documentos-ui.md
```

## Como usar

1. Extraia este pacote no workspace.
2. Abra o arquivo `prompt-codex-documentos-ui.md`.
3. Cole o prompt no Codex CLI.
4. Garanta que o Codex tenha acesso aos três repositórios e aos arquivos de referência.
5. Execute o plano de ação.
6. Valide com o checklist.

## Observações importantes

- A refatoração deve preservar os contratos HTTP atuais.
- A tela deve respeitar `CTO`, `MANAGER` e `PARTNER`.
- `PARTNER` não pode selecionar outro colaborador.
- Exclusão é ação destrutiva e deve exigir confirmação.
- A nova versão deve remover o legado visual da tela antiga.
