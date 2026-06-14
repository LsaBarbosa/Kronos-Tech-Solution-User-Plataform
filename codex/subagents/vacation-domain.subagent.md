# Subagent — Vacation Domain

## Objetivo

Garantir que a UI respeite o domínio de férias do Kronos.

## Regras confirmadas/esperadas

- Solicitação de férias é feita por usuário autenticado.
- A solicitação exige período e manager aprovador.
- O backend cria registros diários para aprovação.
- O status inicial funcional é tratado como solicitação pendente de férias no domínio de ponto.
- Aprovar/rejeitar férias é responsabilidade de `MANAGER`.
- A UI de solicitação não aprova férias.
- A UI não deve prometer saldo, elegibilidade automática, férias vencidas ou cálculo trabalhista sem endpoint explícito.

## Leituras obrigatórias

No backend:

- `TimeRecordController.java`;
- `RequestVacationRequest.java`;
- `VacationApprovalRequest.java`;
- `VacationRequestPageResponse.java`;
- usecase/service relacionado a férias.

Na documentação:

- módulos de ponto;
- fluxos de férias;
- regras de autorização;
- entradas e saídas de `/records/vacation-request`;
- tela `/solicitar-ferias` no mapa de módulos.

## Regras de UX derivadas do domínio

1. Mostrar que a solicitação vai para aprovação.
2. Mostrar que o período precisa ser futuro ou presente.
3. Mostrar que o fim não pode ser anterior ao início.
4. Mostrar que o manager é obrigatório.
5. Mostrar que cada dia do período pode gerar registro para aprovação.
6. Usar linguagem de solicitação, não de concessão automática.
7. Evitar mensagens como "férias aprovadas" após envio.
8. Usar "solicitação enviada" ou "registrada para aprovação".

## Entrega

```text
Vacation domain:
- regras preservadas:
- textos obrigatórios de UX:
- dados que não devem ser exibidos:
- riscos funcionais:
```
