# Kronos — Pacote Codex CLI — UI `/privacidade`

## Objetivo

Este pacote orienta o Codex CLI a refatorar a rota `/privacidade` do front-end Kronos para uma nova experiência visual e funcional.

A tela deve deixar de parecer uma página longa com seções empilhadas e passar a funcionar como um **centro de direitos do titular LGPD**, com duas experiências reais:

- **Desktop:** painel de privacidade e governança, com cards de ações principais, solicitações recentes e painel lateral de transparência.
- **Mobile:** fluxo de autoatendimento por cards, com ações grandes, leitura rápida e CTA fixo.

## Repositórios e branches

| Camada | Repositório | Branch |
|---|---|---|
| Back-end | `LsaBarbosa/Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` |
| Front-end | `LsaBarbosa/Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` |
| Documentação | `LsaBarbosa/kronos-business` | `main` |

## Arquivos de referência incluídos

```text
references/
├── docs/
│   └── kronos_privacidade_diretriz_visual.md
└── mockups/
    ├── kronos_privacidade_desktop.png
    └── kronos_privacidade_mobile.png
```

## Arquivos a instalar ou consultar no projeto

```text
codex/
├── skills/
│   └── kronos-privacidade-ui.skill.md
├── agents/
│   └── kronos-privacidade-ui.agent.md
├── rules/
│   └── kronos-privacidade-ui.rules.md
└── subagents/
    ├── repo-mapper.subagent.md
    ├── privacy-domain.subagent.md
    ├── ui-architecture.subagent.md
    ├── api-contract.subagent.md
    ├── qa-a11y.subagent.md
    └── legacy-cleaner.subagent.md
```

## Arquivos de execução

| Arquivo | Função |
|---|---|
| `plano-acao-privacidade-ui.md` | Sequência cronológica de implementação. |
| `prompt-codex-privacidade-ui.md` | Prompt principal para colar no Codex CLI. |
| `checklist-validacao-privacidade-ui.md` | Critérios de validação final. |
| `manifest.json` | Mapa do pacote. |

## Regra central

Preservar os contratos HTTP existentes. A tarefa é de **refatoração de UI/UX**, não de mudança de back-end.

A implementação deve reaproveitar os serviços e componentes existentes sempre que possível:

- `src/pages/PrivacyCenter.tsx`
- `src/service/lgpd.service.ts`
- `src/config/api-routes.ts`
- `src/components/privacy/*`
- `src/context/AuthContext.tsx`

Após implementar e validar, remover o legado visual antigo da rota `/privacidade`, deixando somente a nova experiência.
