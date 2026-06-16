# Skill — Auditoria de vínculo colaborador-conta no Kronos

## Nome

`kronos-collaborator-account-contract-audit`

## Objetivo

Capacitar o Codex CLI a auditar e corrigir divergências entre colaboradores (`Employee`) e usuários (`User`) no Kronos, especialmente quando a UI indica “Sem usuário” ou “Conta ausente” mesmo existindo usuários retornados por `/users/search`.

## Contexto obrigatório

Repositórios e branches:

```text
Back-end:  LsaBarbosa/Kronos-Tech-Solutions-KTS                  branch PROD_HOSTINGER_V2
Front-end: LsaBarbosa/Kronos-Tech-Solution-User-Plataform        branch PROD_HOSTINGER_v2
Docs:      LsaBarbosa/kronos-business                            branch main
```

## Conhecimentos necessários

### Fluxo funcional

- O gestor acessa `/lista-colaboradores`.
- O front carrega `GET /employee` e `GET /users/search`.
- O front cruza as duas listas por `employeeId`.
- O usuário deve ser considerado vinculado somente quando o `user.employeeId` corresponde ao `employee.employeeId`.

### Arquivos críticos

Back-end:

```text
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserResponse.java
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserListResponse.java
src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
src/main/java/com/kts/kronos/application/service/UserService.java
src/main/java/com/kts/kronos/domain/model/User.java
```

Front-end:

```text
src/pages/ListaColaboradores.tsx
src/features/collaborators/components/CollaboratorCommandCenter.tsx
src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts
src/features/collaborators/utils/collaborator-view.helpers.ts
src/types/user.ts
src/service/user.service.ts
src/service/collaborator-management.service.ts
```

Docs:

```text
04-fluxos-aplicacao.md
05-fluxos-front-end.md
05-entradas-saidas-fluxos.md
09-estado-cache-requisicoes.md
```

## Diagnóstico padrão

Quando `/users/search` retorna usuários sem `employeeId`, a função `mergeCollaborators` não consegue preencher `usersByEmployeeId`. Isso gera:

```text
matchedUser = undefined
hasAccount = false
userId = null
accountLabel = Sem usuário
```

## Correção preferencial

Alterar o contrato do back-end para que `UserSearchItemResponse` inclua `employeeId`.

## Não fazer

- Não cruzar colaborador e usuário por nome.
- Não cruzar por CPF mascarado.
- Não inferir vínculo por username.
- Não alterar a regra de merge para aceitar aproximações textuais.
- Não expor senha, token, cookie ou CPF integral em logs/testes.

## Critérios de pronto

- `/users/search` retorna `employeeId` por item.
- Teste backend cobre serialização do DTO/listagem.
- Teste frontend cobre `mergeCollaborators` com `employeeId` correspondente.
- UI deixa de exibir falso “Sem usuário”.
- Filtro “Sem usuário” mostra apenas colaboradores realmente sem conta.
