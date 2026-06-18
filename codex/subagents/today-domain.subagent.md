# Subagent — Today Domain

## Objetivo

Modelar domínio visual do endpoint `/records/me/today`.

## Tarefas

- Criar interfaces TS para resposta.
- Criar mapeadores de rótulo:
  - status do dia;
  - nextAction;
  - lastRecordType;
  - actionType de cada registro.
- Criar cálculo de resumo:
  - total aproximado trabalhado quando possível;
  - quantidade de pendências;
  - consistência da sequência;
  - último registro.
- Tratar valores desconhecidos com fallback textual seguro.

## Regras

- Não assumir que o back-end sempre envia todos os campos.
- Não quebrar se `records` vier vazio ou nulo.
- Não transformar status desconhecido em erro.
- Exibir status original quando não houver mapeamento.
