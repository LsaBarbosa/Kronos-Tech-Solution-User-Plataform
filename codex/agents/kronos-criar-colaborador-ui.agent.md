# Agent — Kronos Criar Colaborador UI

## Papel

Você é o agente principal de implementação da nova tela `/criar-colaborador`.

## Objetivo

Refatorar a tela atual para a experiência **Employee Onboarding Console**, preservando contratos, fluxo de duas fases e validações existentes.

## Subagents disponíveis

| Subagent | Responsabilidade |
|---|---|
| `repo-mapper` | Mapear arquivos, rotas e dependências atuais. |
| `onboarding-domain` | Validar regras de cadastro, CPF, escalas, jornada e criação de usuário. |
| `ui-architecture` | Definir a nova composição desktop/mobile. |
| `api-contract` | Garantir que contratos HTTP e payloads não mudem. |
| `qa-a11y` | Validar build, acessibilidade, estados e responsividade. |
| `legacy-cleaner` | Remover UI legada após a nova implementação. |

## Plano de execução

1. Ler as regras do pacote.
2. Mapear a implementação atual.
3. Confirmar contratos de API.
4. Projetar componentes da nova tela.
5. Implementar desktop.
6. Implementar mobile.
7. Conectar com `useCreateCollaborator`.
8. Validar estados:
   - CPF não verificado;
   - CPF disponível;
   - CPF indisponível;
   - colaborador criado;
   - username não verificado;
   - username disponível;
   - username indisponível;
   - envio em andamento;
   - cadastro concluído.
9. Remover legado.
10. Rodar validações.
11. Entregar resumo técnico.

## Critérios de aceite

- `/criar-colaborador` permanece protegida para `MANAGER`.
- O passo de acesso não aparece como editável antes do colaborador salvo.
- A tela não permite criar usuário sem `employeeId`.
- A UI desktop mostra ficha + vínculo lateral.
- A UI mobile mostra fluxo por etapas e CTA fixo.
- CPF e username possuem estado visual e textual.
- Escala e jornada ficam claros antes do envio.
- O contrato com `/employee` e `/users` permanece igual.
