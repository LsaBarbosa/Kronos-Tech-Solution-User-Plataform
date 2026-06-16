# Plano de ação — Correção do falso “colaborador sem conta”

## Fase 0 — Preparação

### Task 0.1 — Validar branches

```bash
git -C Kronos-Tech-Solutions-KTS status
git -C Kronos-Tech-Solutions-KTS checkout PROD_HOSTINGER_V2

git -C Kronos-Tech-Solution-User-Plataform status
git -C Kronos-Tech-Solution-User-Plataform checkout PROD_HOSTINGER_v2

git -C kronos-business status
git -C kronos-business checkout main
```

Critério de aceite:

- branches corretas;
- worktree limpo ou alterações existentes registradas antes da intervenção.

---

## Fase 1 — Auditoria documental

### Task 1.1 — Ler documentação de fluxo

Arquivos:

```text
kronos-business/04-fluxos-aplicacao.md
kronos-business/05-fluxos-front-end.md
kronos-business/05-entradas-saidas-fluxos.md
kronos-business/09-estado-cache-requisicoes.md
```

Objetivo:

- confirmar que o fluxo de colaborador cria `Employee` e depois `User` vinculado por `employeeId`;
- confirmar que a UI trabalha com `UserSearchListItem[]` para listagem de usuários.

Critério de aceite:

- registrar achados em `auditoria-colaborador.md`.

---

## Fase 2 — Auditoria front-end

### Task 2.1 — Localizar tela e hook principal

Arquivos:

```text
src/pages/ListaColaboradores.tsx
src/features/collaborators/components/CollaboratorCommandCenter.tsx
src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts
```

Validar:

- tela usa `CollaboratorCommandCenter`;
- hook carrega `fetchEmployeeList(null)` e `listUsers(null)`;
- hook chama `mergeCollaborators(employees, users)`.

### Task 2.2 — Validar contrato TypeScript

Arquivos:

```text
src/types/user.ts
src/service/user.service.ts
```

Validar:

- `UserSearchListItem` contém `employeeId`;
- `listUsers` não busca detalhes adicionais;
- `listUsers` depende do backend retornar todos os campos.

### Task 2.3 — Validar merge

Arquivo:

```text
src/features/collaborators/utils/collaborator-view.helpers.ts
```

Validar:

- `usersByEmployeeId` usa `user.employeeId`;
- `hasAccount` depende de `matchedUser`;
- filtro `noAccount` depende de `record.hasAccount`.

Critério de aceite:

- confirmar que o front está coerente com o contrato desejado, mas quebra quando o backend omite `employeeId`.

---

## Fase 3 — Auditoria back-end

### Task 3.1 — Validar DTO detalhado

Arquivo:

```text
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserResponse.java
```

Validar:

- contém `employeeId`.

### Task 3.2 — Validar DTO resumido

Arquivo:

```text
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java
```

Validar:

- atualmente não contém `employeeId`.

### Task 3.3 — Validar controller

Arquivo:

```text
src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
```

Validar:

- `GET /users/search` usa `UserSearchItemResponse::fromDomain`.

### Task 3.4 — Validar domínio/service

Arquivos:

```text
src/main/java/com/kts/kronos/domain/model/User.java
src/main/java/com/kts/kronos/application/service/UserService.java
```

Validar:

- `User` possui `employeeId`;
- `UserService.listUsers()` já busca usuários por tenant.

Critério de aceite:

- registrar causa raiz no relatório.

---

## Fase 4 — Implementação

### Task 4.1 — Corrigir DTO resumido

Alterar:

```text
src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java
```

Implementar:

```java
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

Critério de aceite:

- projeto compila;
- JSON de `/users/search` contém `employeeId`.

---

## Fase 5 — Testes

### Task 5.1 — Teste unitário do DTO

Criar:

```text
src/test/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponseTest.java
```

Validar todos os campos.

### Task 5.2 — Teste de controller, se viável

Validar JSON:

```text
$.users[0].employeeId
```

### Task 5.3 — Teste front-end de merge, se estrutura permitir

Criar teste para:

```text
mergeCollaborators(employees, users)
```

Cenários:

- usuário com `employeeId` correspondente → `hasAccount=true`;
- usuário sem `employeeId` → `hasAccount=false`;
- colaborador sem usuário → aparece no filtro `noAccount`.

---

## Fase 6 — Validação local

### Task 6.1 — Back-end

```bash
cd Kronos-Tech-Solutions-KTS
./gradlew clean build
```

### Task 6.2 — Front-end

```bash
cd Kronos-Tech-Solution-User-Plataform
npm run build
```

### Task 6.3 — Contrato HTTP

```bash
curl -s -b cookies.txt http://localhost:8080/users/search | jq '.users[0]'
```

Esperado:

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

## Fase 7 — Atualização do relatório

### Task 7.1 — Atualizar `auditoria-colaborador.md`

Incluir:

- arquivos alterados;
- diff resumido;
- comandos executados;
- resultado dos testes;
- evidência do payload corrigido.

---

## Fase 8 — Revisão final

### Task 8.1 — Revisar risco

Confirmar:

- nenhum dado sensível novo foi exposto;
- `employeeId` é necessário e suficiente para a UI;
- autorização e tenant foram preservados;
- build passa.

### Task 8.2 — Entregar patch

Gerar resumo:

```bash
git diff --stat
git diff
```
