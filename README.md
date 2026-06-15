# Kronos — Pacote Codex CLI para refatoração da tela de avisos

## Escopo

Refatorar a tela de comunicação interna atualmente implementada em:

- `src/pages/Avisos.tsx`
- hook relacionado: `src/hooks/useMessages.ts`
- serviço relacionado: `src/service/message.service.ts`
- tipos relacionados: `src/types/message.ts`
- criação de aviso: `src/pages/CriarAviso.tsx`

## Rota

Pedido do usuário: `/aviso`.

Constatação na branch `feature/lgpd-compliance-new-ui`:

- `APP_PATHS.avisos = "/avisos"`;
- `App.tsx` renderiza `Avisos` em `APP_PATHS.avisos`;
- a diretriz visual enviada também referencia `/avisos`.

Regra para o Codex:

1. Refatorar a rota real usada pelo produto: `/avisos`.
2. Não criar uma rota paralela sem necessidade.
3. Se o workspace local realmente possuir `/aviso`, adaptar para o padrão local.
4. Se for necessária compatibilidade, criar redirect explícito `/aviso -> /avisos`, sem duplicar a tela.

## Objetivo de produto

Transformar a tela em uma **central de comunicação interna** com experiências distintas:

- **Desktop**: mural corporativo com lista à esquerda, detalhe à direita, métricas superiores, busca, filtros e ações administrativas por permissão.
- **Mobile**: leitura rápida por cards, busca, chips de prioridade, detalhe em modal/tela dedicada e rodapé com permissão atual.

## Referências incluídas

```text
references/
├── docs/
│   └── kronos_avisos_diretriz_visual.md
└── mockups/
    ├── kronos_avisos_desktop.png
    └── kronos_avisos_mobile.png
```

## Arquivos de coordenação do Codex

```text
codex/
├── skills/
│   └── kronos-avisos-ui.skill.md
├── agents/
│   └── kronos-avisos-ui.agent.md
├── rules/
│   └── kronos-avisos-ui.rules.md
└── subagents/
    ├── repo-mapper.subagent.md
    ├── notice-domain.subagent.md
    ├── ui-architecture.subagent.md
    ├── api-contract.subagent.md
    ├── qa-a11y.subagent.md
    └── legacy-cleaner.subagent.md
```

## Comando sugerido

Copie o conteúdo de `prompt-codex-avisos-ui.md` e execute no Codex CLI dentro do repositório front-end.

## Resultado esperado

- Nova tela `/avisos` com identidade visual baseada nos mockups.
- Desktop e mobile com experiências diferentes, não apenas redimensionadas.
- Contratos HTTP preservados.
- Regras de permissão por `CTO`, `MANAGER` e `PARTNER` respeitadas.
- Legado removido após validação.
