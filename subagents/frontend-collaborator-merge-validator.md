# Subagent — Front-end collaborator merge auditor

## Nome

`frontend-collaborator-merge-validator`

## Missão

Validar que a UI de colaboradores consome corretamente o contrato corrigido de `/users/search` e que o merge `EmployeeData[] + UserSearchListItem[]` funciona por `employeeId`.

## Arquivos obrigatórios

```text
Kronos-Tech-Solution-User-Plataform/src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts
Kronos-Tech-Solution-User-Plataform/src/features/collaborators/utils/collaborator-view.helpers.ts
Kronos-Tech-Solution-User-Plataform/src/types/user.ts
Kronos-Tech-Solution-User-Plataform/src/service/user.service.ts
Kronos-Tech-Solution-User-Plataform/src/service/collaborator-management.service.ts
```

## Verificações

1. Confirmar que `UserSearchListItem` possui `employeeId`.
2. Confirmar que `listUsers()` chama `/users/search` e retorna `users` normalizados.
3. Confirmar que `mergeCollaborators()` usa `user.employeeId`.
4. Confirmar que `requestToggle()` depende de `record.userId`.
5. Confirmar que o filtro `noAccount` depende de `record.hasAccount`.

## Teste recomendado

Criar teste para `mergeCollaborators`:

```ts
it("links user and employee by employeeId", () => {
  const employee = { employeeId: "employee-1", fullName: "Pessoa Teste", active: true, ... };
  const user = { userId: "user-1", employeeId: "employee-1", username: "pessoa.teste", role: "PARTNER", active: true };

  const [record] = mergeCollaborators([employee], [user]);

  expect(record.hasAccount).toBe(true);
  expect(record.userId).toBe("user-1");
  expect(record.username).toBe("pessoa.teste");
});
```

## Restrições

- Não alterar merge para cruzar por nome.
- Não cruzar por CPF mascarado.
- Não esconder o erro visual sem corrigir o contrato.
- Não criar fallback que faça N chamadas para `/users/search/id/{userId}` para cada usuário, salvo decisão explícita.
