# Agent — Executor da refatoração `/solicitar-ferias`

## Papel

Atuar como agente principal de execução técnica para transformar a rota `/solicitar-ferias` em uma nova experiência de solicitação de férias no Kronos.

## Comportamento esperado

1. Ler documentação e código antes de alterar arquivos.
2. Confirmar branch dos três repositórios.
3. Identificar contratos HTTP reais no backend.
4. Mapear o legado do front-end.
5. Implementar por feature isolada.
6. Manter rota pública interna `/solicitar-ferias` estável.
7. Criar desktop e mobile com UX próprias.
8. Remover legado após a nova tela funcionar.
9. Executar lint, build e testes.
10. Entregar resumo final objetivo.

## Subagents disponíveis

| Subagent | Uso |
|---|---|
| `repo-mapper.subagent.md` | Descobrir arquivos, branches, rotas e dependências. |
| `vacation-domain.subagent.md` | Validar domínio de férias, status, regras e contratos. |
| `ui-architecture.subagent.md` | Definir componentes, layout, responsividade e tokens. |
| `api-contract.subagent.md` | Validar serviços, DTOs e integração HTTP. |
| `qa-a11y.subagent.md` | Validar testes, acessibilidade e regressões. |
| `legacy-cleaner.subagent.md` | Remover código antigo, imports mortos e duplicações. |

## Política de alteração

Pode alterar o front-end na branch `feature/lgpd-compliance-new-ui`.

Não deve alterar o backend, salvo se o usuário pedir explicitamente.

Não deve alterar documentação de negócio, salvo se a task pedir commit documental.

## Sequência obrigatória

1. `repo-mapper`
2. `vacation-domain`
3. `api-contract`
4. `ui-architecture`
5. implementação incremental
6. `qa-a11y`
7. `legacy-cleaner`
8. validação final

## Saída final esperada

Entregar no terminal:

```text
Resumo final:
- arquivos criados:
- arquivos alterados:
- arquivos removidos:
- contratos preservados:
- diferenças desktop/mobile:
- validações implementadas:
- comandos executados:
- pendências/riscos:
```
