# Rules — Kronos `/status-do-registro`

## Regras obrigatórias

1. Não alterar back-end.
2. Não alterar os endpoints existentes.
3. Não alterar a rota `/status-do-registro`.
4. Não permitir salvar sem registro selecionado.
5. Não permitir salvar sem novo status.
6. Não permitir novo status fora de `ABSENCE`, `DAY_OFF`, `TIME_OFF`.
7. Não misturar inativação com alteração de status.
8. Exigir confirmação antes de mutações.
9. Remover UI legada quando a nova estiver implementada.
10. Executar `npm run lint` e `npm run build`.

## Regras de segurança visual

- Status não pode depender apenas de cor.
- Ação de inativar deve ter texto destrutivo claro.
- A alteração para falta deve destacar impacto trabalhista.
- Confirmar ação com nome, data e status.

## Regras de responsividade

- Desktop: mesa de correção com painéis simultâneos.
- Mobile: fluxo por etapas e bottom bar.
- Não usar tabela no mobile.
- Botões com área mínima de toque de 44px.

## Regras de limpeza

Remover:

- imports não usados;
- callbacks não implementados;
- modal antigo se não for usado;
- instruções redundantes;
- layout antigo baseado em relatório genérico.
