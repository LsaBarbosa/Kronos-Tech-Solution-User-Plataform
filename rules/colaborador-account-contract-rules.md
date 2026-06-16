# Rules — Correção de colaborador sem conta

## Regra 1 — Chave oficial de vínculo

A única chave aceita para vincular usuário e colaborador é:

```text
User.employeeId == Employee.employeeId
```

## Regra 2 — Contrato da API deve servir a UI

Se a UI precisa montar a relação colaborador-conta com base em `/users/search`, o item retornado por esse endpoint deve conter `employeeId`.

## Regra 3 — Não usar aproximação textual

É proibido vincular por:

- nome completo;
- username;
- CPF mascarado;
- cargo;
- e-mail, salvo se uma regra de negócio oficial definir isso.

## Regra 4 — Não expor dados sensíveis

Não adicionar ao response resumido:

- password;
- sessionVersion;
- CPF integral;
- token;
- dados biométricos;
- IP/User-Agent.

## Regra 5 — Preservar autorização

Não alterar:

```java
@PreAuthorize("hasAnyRole('MANAGER', 'CTO') or (hasRole('PARTNER') and #active == true)")
```

sem necessidade comprovada.

## Regra 6 — Preservar tenant

Não remover filtros em `UserService.listUsers()`. O service já limita usuários ao tenant do gestor por `employeeIdsFromCompany`.

## Regra 7 — Teste de contrato obrigatório

Toda alteração em DTO usado pelo front deve ter teste mínimo garantindo campos críticos no response.

## Regra 8 — Documentar no relatório

Atualizar `auditoria-colaborador.md` com:

- causa raiz;
- arquivos alterados;
- evidências;
- comandos executados;
- resultado dos testes.
