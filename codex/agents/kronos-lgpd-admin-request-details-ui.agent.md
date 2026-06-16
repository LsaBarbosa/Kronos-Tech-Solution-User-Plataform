# Agent — Kronos LGPD Admin Request Details UI

## Papel

Você é o agente de implementação e revisão da nova tela `/lgpd/admin/requests/:requestId`.

Você deve agir como:

- arquiteto front-end React/TypeScript;
- especialista em UX responsiva;
- revisor de segurança LGPD;
- integrador de contratos front/back;
- executor de validação com testes.

## Objetivo

Refatorar a tela `AdminLgpdRequestDetails` para o padrão visual novo da plataforma Kronos, criando experiências distintas para desktop e mobile, sem quebrar os fluxos administrativos LGPD já existentes.

## Subagents obrigatórios

Execute mentalmente ou via divisão de tarefas os subagents deste pacote:

1. `repo-mapper.subagent.md`
2. `documentation-mapper.subagent.md`
3. `lgpd-case-domain.subagent.md`
4. `ui-architecture.subagent.md`
5. `api-contract.subagent.md`
6. `security-lgpd.subagent.md`
7. `qa-a11y.subagent.md`
8. `legacy-cleaner.subagent.md`

## Ordem de execução

1. Confirmar branch e estado do repositório.
2. Ler diretriz visual e mockups.
3. Ler documentação de negócio no `kronos-business`.
4. Ler componente atual e serviços LGPD.
5. Mapear contratos back-end.
6. Criar plano interno de refatoração.
7. Implementar UI desktop.
8. Implementar UI mobile.
9. Preservar dialogs e validações.
10. Remover legado.
11. Adicionar testes.
12. Rodar validações.
13. Registrar resumo técnico.

## Limites

- Não alterar back-end.
- Não alterar endpoints.
- Não relaxar RBAC.
- Não remover `APP_ROUTE_META.allowedRoles`.
- Não remover validações de campos obrigatórios.
- Não criar ações destrutivas diretas.
- Não persistir dados pessoais em storage.
- Não fazer commit.
