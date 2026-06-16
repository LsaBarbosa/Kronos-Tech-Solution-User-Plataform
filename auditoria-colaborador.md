# Auditoria — colaborador aparecendo como "sem conta vinculada" em `/lista-colaboradores`

## 1. Sumário executivo

**Status final:** `CORRIGIDO`

O sintoma "Esse colaborador ainda não possui conta vinculada" no `/lista-colaboradores` (e o filtro "Sem usuário" exibindo colaboradores que tinham conta) era consequência de o endpoint `GET /users/search` retornar um DTO resumido **sem o campo `employeeId`**, impedindo o front-end de cruzar `User` ↔ `Employee` pela chave funcional definida na documentação (`kronos-business/04-fluxos-aplicacao.md` linhas 95-103, `05-fluxos-front-end.md` linhas 214-236, `05-entradas-saidas-fluxos.md` linhas 77-86, `09-estado-cache-requisicoes.md` linhas 39-47).

A correção mínima foi feita no back-end (`UserSearchItemResponse` agora expõe `employeeId`). O front-end permaneceu coerente com o contrato `UserSearchListItem` (chave `employeeId`), sem fallback por nome ou CPF (proibidos pelas regras de governança).

## 2. Fluxo esperado (documentação)

| Documento | Trecho |
|---|---|
| `kronos-business/04-fluxos-aplicacao.md:95-103` | Criação cria colaborador via `POST /employee` e usuário via `POST /users` em fluxo separado. |
| `kronos-business/05-fluxos-front-end.md:214-236` | F-012 `CriarColaborador` e F-013 `ListaColaboradores` operam sobre `/employee` e `/users`; o front correlaciona pelo `employeeId`. |
| `kronos-business/05-entradas-saidas-fluxos.md:77-86` | `Listar usuários → UserSearchListItem[]`; `Criar usuário → { username, role, employeeId }`. |
| `kronos-business/09-estado-cache-requisicoes.md:39-47` | Origem dos dados de conta e perfil; vínculo se dá via `employeeId`. |

## 3. Payload observado (antes)

`GET /users/search` retornava:

```json
{
  "users": [
    {
      "userId": "559b5017-2f8a-4c79-aa72-6dbc3de7b5f8",
      "username": "maria.silva",
      "role": "MANAGER",
      "active": true
    }
  ]
}
```

Sem `employeeId`. O front em `src/features/collaborators/utils/collaborator-view.helpers.ts` constrói `usersByEmployeeId` lendo `user.employeeId` — quando o campo está ausente, nenhum colaborador encontra um match → todos os registros caem em `hasAccount=false, userId=null`. A função `requestToggle` em `src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts:337-345` aborta com o toast "Esse colaborador ainda não possui conta vinculada" porque `!record.userId`.

## 4. Contrato esperado (depois)

`GET /users/search` agora retorna:

```json
{
  "users": [
    {
      "userId": "559b5017-2f8a-4c79-aa72-6dbc3de7b5f8",
      "employeeId": "f9d6e2c1-43a1-4d50-b3e4-8e7f9a0b1234",
      "username": "maria.silva",
      "role": "MANAGER",
      "active": true
    }
  ]
}
```

`employeeId` é UUID interno; já existe em `/employee` (acessível para a mesma role) e em `UserResponse` detalhado. Não é PII e não habilita enumeração nova — apenas restaura o vínculo funcional que a documentação prescreve.

## 5. Arquivos lidos

### Front-end (`Kronos-Tech-Solution-User-Plataform`, branch `PROD_HOSTINGER_v2`)

```text
src/pages/ListaColaboradores.tsx
src/features/collaborators/components/CollaboratorCommandCenter.tsx
src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts (164-176, 337-345)
src/features/collaborators/utils/collaborator-view.helpers.ts (20-81, 110-116)
src/types/user.ts (20-32)
src/service/user.service.ts (93-104)
src/service/user.service.test.ts (89-116) — teste de contrato
```

### Back-end (`Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`)

```text
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java (antes: 4 campos, sem employeeId)
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserResponse.java (detalhado, já com employeeId)
src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java (54-60) — allUsers usa UserSearchItemResponse::fromDomain
src/main/java/com/kts/kronos/application/service/UserService.java (119-146) — listUsers filtra por tenant e retorna User com employeeId
src/main/java/com/kts/kronos/domain/model/User.java (1-25) — domínio expõe employeeId
src/test/java/com/kts/kronos/config/UserEnumerationExposureIntegrationTest.java (132-147) — assertion legada negava employeeId
```

### Documentação (`kronos-business`, branch `main`)

```text
04-fluxos-aplicacao.md (95-103)
05-fluxos-front-end.md (214-236)
05-entradas-saidas-fluxos.md (77-86)
09-estado-cache-requisicoes.md (39-47)
```

## 6. Arquivos alterados

### Back-end

| Arquivo | Mudança |
|---|---|
| `src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java` | Acrescentado o campo `UUID employeeId` ao record e ao `fromDomain(user)`. Permanece sem `password`, `sessionVersion`, `deletedAt`, `deletedBy`, `deactivationReason`. |
| `src/test/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponseTest.java` | **Novo** — 2 testes: `fromDomain_shouldMapEmployeeIdSoFrontendCanLinkAccounts` e `shouldNotExposeSensitiveDomainFields` (verifica via JSON que `password`/`sessionVersion`/`deletedAt`/`deletedBy`/`deactivationReason` ficam fora e `employeeId` entra). |
| `src/test/java/com/kts/kronos/config/UserEnumerationExposureIntegrationTest.java` | Teste `shouldReduceUsersSearchPayloadMetadata` renomeado para `shouldExposeOnlyTheReducedPayloadOnUsersSearch` — agora valida que **`employeeId` existe** (com o valor do domínio) e que **`password`/`sessionVersion`/`deletedAt`/`deletedBy`/`deactivationReason`** continuam ocultos. |

### Front-end

| Arquivo | Mudança |
|---|---|
| `src/features/collaborators/utils/collaborator-view.helpers.ts` | Restaurada a forma original (match **somente** por `employeeId`). Foi removido um fallback temporário por `username`/`email` que tinha sido aplicado em iteração anterior, em conformidade com a regra "Não corrigir via comparação de nomes". |
| `src/features/collaborators/__tests__/collaborator-view.helpers.test.ts` | Substituídos os 3 testes do fallback por 1 teste que documenta o comportamento conservador: sem `employeeId` no payload do backend, `userId` permanece `null` e `hasAccount=false`. |
| `src/service/user.service.test.ts` | Teste de contrato `listUsers` atualizado para validar que a resposta do backend inclui `employeeId`. |

## 7. Testes adicionados/alterados

### Back-end

| Teste | Arquivo | Status |
|---|---|---|
| `UserSearchItemResponseTest.fromDomain_shouldMapEmployeeIdSoFrontendCanLinkAccounts()` | novo | ✅ |
| `UserSearchItemResponseTest.shouldNotExposeSensitiveDomainFields()` | novo | ✅ |
| `UserEnumerationExposureIntegrationTest.shouldExposeOnlyTheReducedPayloadOnUsersSearch()` | atualizado | ✅ |
| `ResponseMapperTest.shouldMapUserResponsesFromDomain()` | preservado, continua passando | ✅ |

### Front-end

| Teste | Arquivo | Status |
|---|---|---|
| `mescla colaborador e usuario pelo employeeId` | preservado | ✅ |
| `filtra por status, grupo e busca` | preservado | ✅ |
| `não vincula usuário quando o backend retorna response sem employeeId` | substituiu testes de fallback | ✅ |
| `lista usuarios com o contrato resumido de /users/search incluindo employeeId` | atualizado | ✅ |

## 8. Comandos executados

### Back-end (`Kronos-Tech-Solutions-KTS`)

| Comando | Status | Resultado |
|---|---|---|
| `./gradlew test --tests '…UserSearchItemResponseTest' --tests '…ResponseMapperTest' --tests '…UserEnumerationExposureIntegrationTest'` | ✅ | Todas as suites afetadas verdes (`BUILD SUCCESSFUL in 24s`). |
| `./gradlew test` | ✅ | **1736/1736** testes (`BUILD SUCCESSFUL in 1m 46s`). |
| `./gradlew clean build -x test` | ✅ | `BUILD SUCCESSFUL in 27s`. |

### Front-end (`Kronos-Tech-Solution-User-Plataform`)

| Comando | Status | Resultado |
|---|---|---|
| `npm run lint` | ✅ | 0 errors, 0 warnings. |
| `npx tsc --noEmit` | ✅ | limpo. |
| `npx vitest run` | ✅ | **675/675** testes / **96/96** arquivos. |
| `npm run build` | ✅ | `built in 10.98s`. |

## 9. Validação manual recomendada

1. Subir back-end localmente (`./gradlew bootRun`).
2. Autenticar como MANAGER ou CTO.
3. Capturar o cookie de sessão:
   ```bash
   curl -i -X POST http://localhost:8080/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"username":"<u>","password":"<p>"}' -c cookies.txt
   ```
4. Inspecionar o contrato corrigido:
   ```bash
   curl -s -b cookies.txt http://localhost:8080/users/search | jq '.users[0]'
   ```
   O JSON deve conter `userId`, `employeeId`, `username`, `role`, `active` — sem `password`, `sessionVersion`, `deletedAt`, `deletedBy` ou `deactivationReason`.
5. Subir front (`npm run dev`).
6. Abrir `/lista-colaboradores` autenticado como MANAGER.
7. Para um colaborador com conta vinculada, clicar em "Desativar". O modal de confirmação deve abrir; **não** deve mais aparecer o toast "Esse colaborador ainda não possui conta vinculada".
8. Confirmar — `PATCH /users/{userId}/toggle-status` deve disparar (verificar Network) e o estado do colaborador alternar.
9. Filtro "Sem usuário" só deve listar colaboradores que de fato nunca tiveram conta criada.

## 10. Riscos remanescentes

| Risco | Severidade | Mitigação |
|---|---|---|
| Clients antigos que confiavam em `/users/search` *omitir* `employeeId` por contrato. | Baixo | A omissão era erro de DTO, não política. `UserResponse` detalhado já expõe `employeeId`. |
| Enumeração externa via UUID. | Baixo | Endpoint segue `@PreAuthorize` (`UserController` exige `MANAGER`/`CTO`); a chave `employeeId` já era visível ao mesmo grupo via `/employee`. |
| Caches/SW armazenando o payload antigo. | Baixo | Front-end re-deploy invalida o bundle; a chamada não é cacheada agressivamente. |

## 11. Conclusão

A causa raiz era um DTO resumido incompleto no back-end (`UserSearchItemResponse` sem `employeeId`), o que invalidava o vínculo funcional documentado em `kronos-business`. A correção é cirúrgica: adicionar `employeeId` ao DTO e ao `fromDomain`, ajustar o teste de exposição reduzida para refletir a nova política (campos sensíveis continuam ocultos; `employeeId` é metadado funcional necessário ao front) e manter o front-end estrito por `employeeId` (sem fallback por nome ou CPF).

**Regras obrigatórias respeitadas:**

- ✅ Não corrigir via comparação de nomes — fallback experimental por `username`/`email` no front foi revertido.
- ✅ Não corrigir via CPF mascarado — nenhuma mudança no payload de PII.
- ✅ Não alterar regra de autorização — `UserController.allUsers` continua `@PreAuthorize(MANAGER)`.
- ✅ Não remover isolamento por tenant — `UserService.listUsers` continua filtrando por `companyId` para non-CTO.
- ✅ Não expor dados sensíveis — `password`, `sessionVersion`, `deletedAt`, `deletedBy`, `deactivationReason` permanecem fora; o `UserEnumerationExposureIntegrationTest` agora valida explicitamente isso.
- ✅ Correção mínima no DTO resumido do back-end.
- ✅ Front-end coerente com o contrato `UserSearchListItem`.
