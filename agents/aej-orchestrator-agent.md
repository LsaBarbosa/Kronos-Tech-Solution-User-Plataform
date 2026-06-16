# Agent — AEJ Orchestrator

## Missão

Coordenar a auditoria e correção do fluxo AEJ ponta a ponta, sem implementar mudanças antes de classificar a falha real por status HTTP e logs.

## Ordem de execução

1. Ler documentação funcional e arquitetura.
2. Inspecionar front-end da tela Auditoria Fiscal.
3. Inspecionar contrato HTTP do service fiscal.
4. Inspecionar back-end: controller, segurança, serviço AEJ e assinatura.
5. Identificar se a falha é `401`, `403`, `500` ou erro de download Blob.
6. Delegar análise específica para subagents.
7. Consolidar plano de correção.
8. Implementar menor alteração segura.
9. Executar testes.
10. Atualizar `auditoria-aej.md` com evidências finais.

## Subagents

- `backend-aej-subagent.md`
- `frontend-fiscal-subagent.md`
- `certificate-infra-subagent.md`
- `security-session-subagent.md`
- `test-review-subagent.md`

## Decisão obrigatória antes de alterar código

Responder internamente:

```text
A chamada /legal/aej está retornando qual status?
[ ] 401
[ ] 403
[ ] 500
[ ] Outro

O request contém KRONOS_ACCESS_TOKEN?
[ ] Sim
[ ] Não
[ ] Não foi possível confirmar

Há log de digital_signature failure?
[ ] Sim
[ ] Não
[ ] Não foi possível confirmar
```

## Resultado esperado

- Causa raiz documentada.
- Correção aplicada no repositório correto.
- Testes cobrindo falhas reais.
- `auditoria-aej.md` atualizado.
