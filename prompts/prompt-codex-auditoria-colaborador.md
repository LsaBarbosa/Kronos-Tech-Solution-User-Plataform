# Prompt detalhado para o Codex CLI

Use este prompt no terminal dentro do workspace que contém os três repositórios.

---

## Prompt

Você é o agente de execução do projeto Kronos. Trabalhe de forma auditável, sem fazer alterações desnecessárias e sem inventar contratos.

### Contexto

Repositórios e branches obrigatórias:

```text
Back-end:  Kronos-Tech-Solutions-KTS                  branch PROD_HOSTINGER_V2
Front-end: Kronos-Tech-Solution-User-Plataform        branch PROD_HOSTINGER_v2
Docs:      kronos-business                            branch main
```

### Objetivo

Auditar e corrigir o problema em que a tela de colaboradores indica que há colaborador “sem usuário” / “sem conta vinculada”, mesmo os endpoints `/users/search` e `/employee` retornando dados.

O payload observado mostra que `/users/search` retorna usuários com:

```json
{
  "userId": "...",
  "username": "...",
  "role": "...",
  "active": true
}
```

mas não retorna `employeeId`.

O endpoint `/employee` retorna colaboradores com `employeeId`.

A hipótese a validar é: o front-end cruza usuários e colaboradores por `employeeId`, mas o back-end omite `employeeId` no DTO resumido `UserSearchItemResponse`, causando falso `hasAccount=false`.

---

## Passo 1 — Validar branches

Execute:

```bash
git -C Kronos-Tech-Solutions-KTS branch --show-current
git -C Kronos-Tech-Solution-User-Plataform branch --show-current
git -C kronos-business branch --show-current
```

Se estiver fora das branches corretas, faça checkout antes de alterar qualquer arquivo.

---

## Passo 2 — Ler documentação

Leia estes trechos:

```bash
sed -n '95,103p' kronos-business/04-fluxos-aplicacao.md
sed -n '214,236p' kronos-business/05-fluxos-front-end.md
sed -n '77,86p' kronos-business/05-entradas-saidas-fluxos.md
sed -n '39,47p' kronos-business/09-estado-cache-requisicoes.md
```

Registre em `auditoria-colaborador.md` que o fluxo esperado cria colaborador via `/employee`, cria usuário via `/users` e usa `employeeId` como vínculo funcional.

---

## Passo 3 — Auditar front-end

Leia:

```bash
sed -n '1,40p' Kronos-Tech-Solution-User-Plataform/src/pages/ListaColaboradores.tsx
sed -n '1,40p' Kronos-Tech-Solution-User-Plataform/src/features/collaborators/components/CollaboratorCommandCenter.tsx
sed -n '164,176p' Kronos-Tech-Solution-User-Plataform/src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts
sed -n '20,50p' Kronos-Tech-Solution-User-Plataform/src/features/collaborators/utils/collaborator-view.helpers.ts
sed -n '110,116p' Kronos-Tech-Solution-User-Plataform/src/features/collaborators/utils/collaborator-view.helpers.ts
sed -n '20,32p' Kronos-Tech-Solution-User-Plataform/src/types/user.ts
sed -n '93,104p' Kronos-Tech-Solution-User-Plataform/src/service/user.service.ts
```

Confirme:

1. `useCollaboratorsCommandCenter` carrega `fetchEmployeeList(null)` e `listUsers(null)`.
2. O hook chama `mergeCollaborators(employees, users)`.
3. `mergeCollaborators` cria `usersByEmployeeId` com `user.employeeId`.
4. `UserSearchListItem` espera `employeeId`.
5. `listUsers()` apenas retorna o array do backend; não preenche `employeeId`.
6. Logo, se o backend omite `employeeId`, o front não tem como montar vínculo.

Não altere o front ainda, a menos que os testes indiquem necessidade.

---

## Passo 4 — Auditar back-end

Leia:

```bash
sed -n '1,80p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java
sed -n '1,80p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserResponse.java
sed -n '54,62p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
sed -n '119,148p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/application/service/UserService.java
sed -n '10,20p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/domain/model/User.java
```

Confirme:

1. `UserResponse` detalhado possui `employeeId`.
2. `UserSearchItemResponse` resumido não possui `employeeId`.
3. `UserController.allUsers()` usa `UserSearchItemResponse::fromDomain`.
4. `UserService.listUsers()` retorna domínio `User` com `employeeId` e já filtra por tenant.
5. `User` possui `employeeId` no domínio.

---

## Passo 5 — Implementar correção no back-end

Altere:

```text
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java
```

Para incluir `employeeId`:

```java
package com.kts.kronos.adapter.in.web.dto.user;

import com.kts.kronos.domain.model.User;

import java.util.UUID;

public record UserSearchItemResponse(
        UUID userId,
        UUID employeeId,
        String username,
        String role,
        boolean active
) {
    public static UserSearchItemResponse fromDomain(User user) {
        return new UserSearchItemResponse(
                user.userId(),
                user.employeeId(),
                user.username(),
                user.role().name(),
                user.active()
        );
    }
}
```

Não inclua `password`, `sessionVersion`, `deletedAt`, `deletedBy` ou `deactivationReason`.

---

## Passo 6 — Adicionar testes

### 6.1 Teste unitário do DTO

Crie, se a estrutura de testes permitir:

```text
Kronos-Tech-Solutions-KTS/src/test/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponseTest.java
```

Teste mínimo:

- criar um `User` com `userId`, `employeeId`, `username`, `role`, `active`;
- chamar `UserSearchItemResponse.fromDomain(user)`;
- validar que `response.employeeId()` é igual ao `employeeId` do domínio.

### 6.2 Teste front-end de merge

Se o projeto já usa Vitest/Jest, crie teste para:

```text
Kronos-Tech-Solution-User-Plataform/src/features/collaborators/utils/collaborator-view.helpers.test.ts
```

Cenário obrigatório:

- `EmployeeData.employeeId = "employee-1"`;
- `UserSearchListItem.employeeId = "employee-1"`;
- `mergeCollaborators` deve retornar `hasAccount=true`, `userId` preenchido e `username` preenchido.

Se não houver estrutura de testes front-end configurada, registre isso no relatório e não introduza framework novo.

---

## Passo 7 — Executar validações

Back-end:

```bash
cd Kronos-Tech-Solutions-KTS
./gradlew clean test
./gradlew clean build
```

Front-end:

```bash
cd ../Kronos-Tech-Solution-User-Plataform
npm run lint
npm run build
```

Se algum comando não existir, registre o erro e execute o equivalente disponível no projeto.

---

## Passo 8 — Validar contrato local

Depois de subir o back-end:

```bash
curl -s -b cookies.txt http://localhost:8080/users/search | jq '.users[0]'
```

O item deve conter:

```json
{
  "userId": "...",
  "employeeId": "...",
  "username": "...",
  "role": "...",
  "active": true
}
```

---

## Passo 9 — Atualizar auditoria

Crie ou atualize:

```text
auditoria-colaborador.md
```

Inclua:

1. causa raiz;
2. payload antes;
3. contrato esperado;
4. arquivos lidos;
5. arquivos alterados;
6. testes executados;
7. resultado dos testes;
8. validação manual recomendada;
9. conclusão.

---

## Regras obrigatórias

- Não corrigir via comparação de nomes.
- Não corrigir via CPF mascarado.
- Não alterar regra de autorização sem necessidade.
- Não remover isolamento por tenant.
- Não expor dados sensíveis.
- Preferir correção mínima no DTO resumido do back-end.
- Manter o front coerente com o contrato `UserSearchListItem`.

---

## Resultado esperado

Após a implementação:

- `/users/search` retorna `employeeId`;
- `mergeCollaborators` encontra `matchedUser`;
- colaboradores com usuário vinculado deixam de aparecer como “Sem usuário”;
- botão de ativar/desativar usa `record.userId` corretamente;
- filtro “Sem usuário” mostra somente colaboradores sem conta real.
