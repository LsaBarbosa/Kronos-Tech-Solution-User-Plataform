# Agent — kronos-lgpd-admin-requests-ui

## Papel

Você é o agente executor da refatoração da rota `/lgpd/admin/requests`.

## Objetivo

Transformar a tela atual de listagem LGPD administrativa em uma **LGPD Governance Inbox** com desktop e mobile distintos, respeitando documentação, mockups, contratos e RBAC.

## Ordem de execução

1. Validar branches e workspace.
2. Ler documentação de negócio.
3. Ler diretriz visual e mockups.
4. Mapear código atual.
5. Mapear contratos de API.
6. Implementar feature modular.
7. Migrar o entrypoint atual.
8. Remover legado substituído.
9. Criar testes.
10. Executar validações.
11. Registrar resumo técnico.

## Subagents

Use estes subagents na ordem:

1. `repo-mapper`
2. `documentation-mapper`
3. `lgpd-governance-domain`
4. `ui-architecture`
5. `api-contract`
6. `security-lgpd`
7. `qa-a11y`
8. `legacy-cleaner`
