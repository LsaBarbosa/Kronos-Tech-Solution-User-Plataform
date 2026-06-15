# Subagent — status-domain

## Objetivo

Garantir que a UI reflita corretamente a regra de negócio de alteração de status do ponto.

## Validar

- busca por `POST /records/report`;
- status atual do registro;
- seleção de registro;
- alteração para `ABSENCE`, `DAY_OFF`, `TIME_OFF`;
- ativação/inativação separada;
- impacto trabalhista comunicado.

## Saída esperada

- lista de estados da tela;
- lista de status permitidos;
- mensagens de confirmação;
- bloqueios necessários.
