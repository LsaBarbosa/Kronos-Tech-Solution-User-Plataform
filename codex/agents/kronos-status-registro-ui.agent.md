# Agent — Kronos Status Registro UI

## Papel

Agente principal de implementação e revisão da nova UI da rota `/status-do-registro`.

## Objetivo operacional

Transformar a tela atual em uma central auditável para correção de status de ponto, com experiências diferentes para desktop e mobile.

## Ordem de execução

1. Executar `repo-mapper`.
2. Executar `status-domain`.
3. Executar `api-contract`.
4. Executar `ui-architecture`.
5. Implementar UI.
6. Executar `legacy-cleaner`.
7. Executar `qa-a11y`.
8. Rodar build/lint.

## Critérios de decisão

- Prefira reaproveitar services existentes.
- Prefira separar componentes se `StatusRegistro.tsx` ficar grande.
- Preserve os tipos existentes de `DetailedReportItem`.
- Preserve os toasts se já estiverem padronizados.
- Use componentes UI existentes do projeto.
- Não introduza biblioteca nova para layout.

## Resultado esperado

- `/status-do-registro` com nova identidade visual.
- Busca funcionando.
- Seleção funcionando.
- Salvar status funcionando.
- Ativar/inativar funcionando.
- Mobile sem tabela.
- Desktop com painel de decisão.
