# Kronos — Pacote Codex CLI para `/lista-colaboradores`

## Objetivo

Refatorar a rota `/lista-colaboradores` no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, substituindo a tela legada por uma **central de pessoas e contas de acesso**.

A nova tela deve ter duas experiências reais:

- **Desktop:** painel gerencial denso, com hero, métricas, filtros, tabela operacional e painel lateral de detalhes.
- **Mobile:** lista operacional por cards, com busca, chips, menu contextual, bottom sheet e rodapé de ações.

## Repositórios

| Repositório | Branch | Finalidade |
|---|---|---|
| `Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` | Implementação React/Vite. |
| `Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` | Contratos HTTP, controllers, permissões e DTOs. |
| `kronos-business` | `main` | Regras funcionais e documentação norteadora. |

## Como usar no Codex CLI

```bash
unzip kronos_codex_lista_colaboradores_ui.zip -d ./kronos-codex-work
cd <repo-front-end>
codex
```

Cole no Codex o conteúdo de:

```text
kronos-codex-work/kronos_codex_lista_colaboradores_ui/prompt-codex-lista-colaboradores-ui.md
```

## Estrutura

```text
kronos_codex_lista_colaboradores_ui/
├── README.md
├── manifest.json
├── plano-acao-lista-colaboradores-ui.md
├── prompt-codex-lista-colaboradores-ui.md
├── checklist-validacao-lista-colaboradores-ui.md
├── references/
│   ├── docs/kronos_lista_colaboradores_diretriz_visual.md
│   └── mockups/
│       ├── kronos_lista_colaboradores_desktop.png
│       └── kronos_lista_colaboradores_mobile.png
└── codex/
    ├── skills/kronos-lista-colaboradores-ui.skill.md
    ├── agents/kronos-lista-colaboradores-ui.agent.md
    ├── rules/kronos-lista-colaboradores-ui.rules.md
    └── subagents/
```

## Resultado esperado

- Rota `/lista-colaboradores` com UI nova.
- Desktop e mobile com navegação distinta.
- Contratos HTTP preservados.
- Ações sensíveis confirmadas.
- Biometria separada da edição comum.
- Legado visual removido.
- `npm run lint` e `npm run build` executados.

## Documentação complementar

- `docs/flag-redis-adherence.md`
- `docs/api-contract-map.md`
