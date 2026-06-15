# Kronos Codex Pack — `/status-do-registro`

Pacote de instruções para o **Codex CLI** implementar a nova UI/UX da tela **Status do Registro** no front-end Kronos.

## Escopo

Refatorar a rota:

```text
/status-do-registro
```

A tela deve deixar de ser uma composição genérica de relatório + modal e passar a funcionar como uma **central de correção auditável de registros de ponto**.

## Repositórios alvo

```text
Back-end:
Kronos-Tech-Solutions-KTS
branch: PROD_HOSTINGER_V2

Front-end:
Kronos-Tech-Solution-User-Plataform
branch: feature/lgpd-compliance-new-ui

Documentação:
kronos-business
branch: main
```

## Referências incluídas

```text
references/docs/kronos_status_registro_diretriz_visual.md
references/mockups/kronos_status_registro_desktop.png
references/mockups/kronos_status_registro_mobile.png
```

## Entregáveis do pacote

```text
codex/skills/kronos-status-registro-ui.skill.md
codex/agents/kronos-status-registro-ui.agent.md
codex/rules/kronos-status-registro-ui.rules.md
codex/subagents/*.subagent.md
plano-acao-status-registro-ui.md
prompt-codex-status-registro-ui.md
checklist-validacao-status-registro-ui.md
```

## Contratos que não devem ser alterados

```http
POST /records/report?employeeId=<uuid opcional>
PUT  /records/update/status/{employeeId}/{timeRecordId}
PUT  /records/toggle-activate/{employeeId}/{timeRecordId}
```

## Arquivo principal esperado no front-end

```text
src/pages/StatusRegistro.tsx
```

O Codex deve preservar o funcionamento de busca, seleção, alteração de status e ativação/inativação, mas substituir a experiência visual antiga pela nova arquitetura.
