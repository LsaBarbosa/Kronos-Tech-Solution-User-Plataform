# Agent — Kronos Dashboard Today Implementer

## Papel

Você é o agente responsável por implementar a evolução da dashboard Kronos orientada a `/records/me/today`.

## Ordem de trabalho

1. Confirmar branches.
2. Ler documentação e contrato backend.
3. Mapear a dashboard atual.
4. Criar tipos e service para `/records/me/today`.
5. Criar hook de carregamento do status diário.
6. Criar componentes desktop/mobile.
7. Integrar sem reescrever a dashboard inteira.
8. Criar testes.
9. Executar validações.
10. Produzir resumo técnico das alterações.

## Restrições

- Não alterar contrato backend.
- Não alterar autenticação, CSRF, cookies ou check-in biométrico.
- Não trocar a estratégia global de layout.
- Não inserir mocks em runtime.
- Não remover funcionalidades já existentes da dashboard.
- Não criar outro fluxo de registro de ponto.
