# Kronos — Pacote Codex CLI para `/criar-colaborador`

## Objetivo

Refatorar a rota `/criar-colaborador` do front-end **Kronos-Tech-Solution-User-Plataform** na branch `feature/lgpd-compliance-new-ui`.

A tela deve deixar de ser um formulário longo e passar a funcionar como um **onboarding formal de colaborador**, com:

- criação do colaborador;
- validação de CPF;
- dados pessoais e profissionais;
- endereço;
- home office/geolocalização;
- escala;
- jornada;
- criação posterior do usuário de acesso;
- validação de username;
- vínculo de perfil `MANAGER` ou `PARTNER`.

## Repositórios observados

| Camada | Repositório | Branch |
|---|---|---|
| Back-end | `LsaBarbosa/Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` |
| Front-end | `LsaBarbosa/Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` |
| Documentação | `LsaBarbosa/kronos-business` | `main` |

## Arquivos de referência incluídos

```text
references/
├── docs/
│   └── kronos_criar_colaborador_diretriz_visual.md
└── mockups/
    ├── kronos_criar_colaborador_desktop.png
    └── kronos_criar_colaborador_mobile.png
```

## Arquivos de execução incluídos

```text
codex/
├── skills/
│   └── kronos-criar-colaborador-ui.skill.md
├── agents/
│   └── kronos-criar-colaborador-ui.agent.md
├── rules/
│   └── kronos-criar-colaborador-ui.rules.md
└── subagents/
    ├── repo-mapper.subagent.md
    ├── onboarding-domain.subagent.md
    ├── ui-architecture.subagent.md
    ├── api-contract.subagent.md
    ├── qa-a11y.subagent.md
    └── legacy-cleaner.subagent.md
```

## Ordem recomendada de uso no Codex CLI

1. Copie este pacote para a raiz do workspace local.
2. Garanta que os três repositórios estejam disponíveis localmente.
3. Abra o arquivo `prompt-codex-criar-colaborador-ui.md`.
4. Cole o prompt no Codex CLI.
5. Use o plano em `plano-acao-criar-colaborador-ui.md` como backlog de execução.
6. Use `checklist-validacao-criar-colaborador-ui.md` antes de aceitar a entrega.

## Restrições críticas

- Não alterar contratos HTTP.
- Não alterar endpoints do back-end.
- Não recriar a rota sem reaproveitar a lógica validada.
- Preservar o fluxo em duas fases:
  1. criar colaborador;
  2. criar usuário vinculado.
- `CPF` precisa ser validado antes de salvar o colaborador.
- `username` precisa ser validado antes de criar usuário.
- O passo de acesso fica bloqueado até o colaborador existir.
- `role` do usuário vinculado deve ficar restrito a `MANAGER` e `PARTNER`.
- Desktop e mobile devem ser experiências diferentes, não apenas o mesmo layout redimensionado.
- Após implementação e testes, remover a implementação visual legada da rota `/criar-colaborador`.

## Observação de nomenclatura

O pedido citou `kronos_enviar_documentos_diretriz_visual.md`, mas o arquivo recebido e usado neste pacote é `kronos_criar_colaborador_diretriz_visual.md`, correspondente à rota `/criar-colaborador`.
