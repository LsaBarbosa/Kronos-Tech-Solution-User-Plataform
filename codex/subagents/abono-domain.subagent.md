# Subagent — abono-domain

## Objetivo

Interpretar o domínio de abono/esquecimento sem alterar as regras de negócio.

## Leituras obrigatórias

Back-end:

- `TimeRecordController.java`
- `RequestTimeOffRequest.java`
- `RequestType.java`
- `TimeRecordService.java`
- `ApiPaths.java`

Documentação:

- `04-fluxos-aplicacao.md`, se disponível;
- `05-entradas-saidas-fluxos.md`;
- `03-atores-permissoes.md`;
- `08-rotas-guards-permissoes.md`.

## Regras a validar

- Qualquer usuário autenticado pode solicitar abono/esquecimento.
- Aprovação e rejeição são de gestor.
- O tipo `TIME_OFF_REQUEST` representa abono/justificativa.
- O tipo `FORGOTTEN_REGISTRATION` representa esquecimento de marcação.
- O anexo é opcional.
- O payload usa datas e horas separadas.
- A resposta cria um registro de solicitação.

## Saída esperada

Resumo de domínio em linguagem de produto para orientar textos da UI.
