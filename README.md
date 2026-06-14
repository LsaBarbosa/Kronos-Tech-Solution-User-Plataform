# Kronos — Pacote Codex para refatoração da rota `/usuario`

## Objetivo

Este pacote orienta o Codex CLI a refatorar a tela `/usuario` do front-end Kronos para uma nova central de identidade, segurança e privacidade do usuário autenticado.

A entrega esperada no repositório `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, é:

- nova experiência desktop;
- nova experiência mobile;
- mesma rota `/usuario`;
- mesmos contratos HTTP existentes;
- remoção do legado após validação;
- testes, lint e build executados.

## Repositórios alvo

| Repositório | Branch | Uso |
|---|---|---|
| `Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` | Validar contratos HTTP reais do back-end. |
| `Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` | Implementar a nova tela. |
| `kronos-business` | `main` | Usar como documentação norteadora de negócio, regras e fluxos. |

## Arquivos deste pacote

| Arquivo | Finalidade |
|---|---|
| `codex/skills/kronos-usuario-ui.skill.md` | Skill principal para execução da refatoração. |
| `codex/agents/kronos-usuario-ui.agent.md` | Agente orquestrador da tarefa. |
| `codex/subagents/*.md` | Subagentes especializados por frente técnica. |
| `codex/rules/kronos-usuario-ui.rules.md` | Regras obrigatórias de implementação. |
| `plano-acao-usuario-ui.md` | Plano cronológico com tasks. |
| `prompt-codex-usuario-ui.md` | Prompt final para colar no Codex CLI. |
| `checklist-validacao-usuario-ui.md` | Checklist de aceite técnico e visual. |

## Como usar

1. Copie a pasta `codex/` para um local acessível pelo Codex CLI ou mantenha-a como referência.
2. Abra o arquivo `prompt-codex-usuario-ui.md`.
3. Ajuste os caminhos locais dos três repositórios, se necessário.
4. Cole o prompt no Codex CLI.
5. Execute por fases, validando ao fim de cada bloco.

## Observação

Este pacote não implementa o código diretamente. Ele fornece a especificação operacional para que o Codex CLI execute a implementação, revisão e validação.
