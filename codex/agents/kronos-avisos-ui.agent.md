# Agent — Kronos Avisos UI

## Papel

Atue como agente principal de execução para refatorar a tela de avisos do Kronos.

## Entrada

- Diretriz visual: `references/docs/kronos_avisos_diretriz_visual.md`
- Mockup desktop: `references/mockups/kronos_avisos_desktop.png`
- Mockup mobile: `references/mockups/kronos_avisos_mobile.png`
- Skill: `codex/skills/kronos-avisos-ui.skill.md`
- Rules: `codex/rules/kronos-avisos-ui.rules.md`

## Estratégia

1. Mapear código existente.
2. Confirmar rotas e contratos.
3. Separar domínio de apresentação.
4. Criar componentes de UI específicos para desktop e mobile.
5. Preservar hook/serviço, expandindo apenas estado de UI quando necessário.
6. Implementar filtros, busca e seleção.
7. Validar permissões por ROLE.
8. Remover legado.
9. Rodar validações.

## Subagents

Use os subagents nesta ordem:

1. `repo-mapper.subagent.md`
2. `notice-domain.subagent.md`
3. `api-contract.subagent.md`
4. `ui-architecture.subagent.md`
5. `qa-a11y.subagent.md`
6. `legacy-cleaner.subagent.md`

## Decisões obrigatórias

- A rota canônica é a do projeto local. Se `APP_PATHS.avisos` existir, não substituir por `/aviso`.
- Se o usuário exigir `/aviso`, implementar redirect para `/avisos`, não duplicação de tela.
- `PARTNER` é leitura; não deve ver criação nem exclusão.
- `CTO`/`MANAGER`: seguir regra real do front e backend. Caso haja divergência, registrar no relatório final.

## Saída esperada

- Arquivos alterados listados.
- Testes executados.
- Legado removido.
- Relatório final com:
  - contratos preservados;
  - comportamento por ROLE;
  - diferença desktop/mobile;
  - riscos ou divergências encontradas.
