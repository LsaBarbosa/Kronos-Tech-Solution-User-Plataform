# Subagent — Backend contract auditor

## Nome

`backend-user-search-contract-fixer`

## Missão

Corrigir o contrato de `GET /users/search` para retornar `employeeId` no item resumido de usuário.

## Arquivos obrigatórios

```text
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserResponse.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/application/service/UserService.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/domain/model/User.java
```

## Implementação esperada

Alterar `UserSearchItemResponse` para:

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

## Testes esperados

Criar teste unitário do DTO:

```text
src/test/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponseTest.java
```

Validar:

- `userId` preservado;
- `employeeId` preservado;
- `username` preservado;
- `role` serializado como string;
- `active` preservado.

Quando viável, criar teste de controller para `GET /users/search` validando:

```json
$.users[0].employeeId
```

## Restrições

- Não alterar regra de autorização do controller.
- Não alterar `UserService.listUsers()` sem evidência adicional.
- Não expor password/sessionVersion no DTO.
- Não remover filtros por tenant.
