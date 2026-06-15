# Agent — Kronos Relatório Detalhado UI

## Missão

Executar a refatoração da rota `/relatorio-detalhado` no front-end Kronos, criando uma experiência visual moderna e funcionalmente equivalente ao fluxo atual.

## Branches obrigatórias

```bash
git -C Kronos-Tech-Solutions-KTS checkout PROD_HOSTINGER_V2
git -C Kronos-Tech-Solution-User-Plataform checkout feature/lgpd-compliance-new-ui
git -C kronos-business checkout main
```

## Subagents

Usar os subagents deste pacote na ordem:

1. `repo-mapper.subagent.md`
2. `report-domain.subagent.md`
3. `api-contract.subagent.md`
4. `ui-architecture.subagent.md`
5. `qa-a11y.subagent.md`
6. `legacy-cleaner.subagent.md`

## Critérios de aceite

- `/relatorio-detalhado` abre com a nova experiência.
- Desktop e mobile têm navegação e hierarquia diferentes.
- `PARTNER` não troca colaborador.
- `MANAGER` mantém seleção de colaborador permitido.
- `CTO` recebe comunicação de escopo administrativo.
- `reference` segue `HH:mm`.
- Sem data, `Gerar relatório` fica bloqueado.
- Sem resultado, exibe estado vazio.
- Com resultado, habilita PDF e visualização de resultados.
- Build e lint passam.
- Imports mortos removidos.
- Legado da rota removido sem quebrar `StatusRegistro`.

## Restrições

- Não reescrever o projeto todo.
- Não trocar biblioteca de UI.
- Não alterar back-end.
- Não criar mocks permanentes substituindo API real.
- Não usar imagens dos mockups dentro da tela; elas são referência visual.
