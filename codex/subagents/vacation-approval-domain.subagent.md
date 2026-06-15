# Subagent — Vacation Approval Domain

## Objetivo

Garantir que a UI represente corretamente o domínio de aprovação de férias.

## Tarefas

1. Ler documentação do `kronos-business`.
2. Ler contratos backend da branch `PROD_HOSTINGER_V2`.
3. Mapear status:
   - `REQUEST_VACATION`;
   - `VACATION`;
   - `VACATION_REJECTED`.
4. Mapear como o front atual agrupa registros diários em uma solicitação/lote.
5. Validar payload de aprovação/rejeição.
6. Definir view-model de apresentação.

## Regras

- O usuário da tela é gestor.
- A ação é gerencial e auditável.
- A decisão afeta lote de registros.
- O front não inventa status que o backend não retorna; apenas traduz para UI.
