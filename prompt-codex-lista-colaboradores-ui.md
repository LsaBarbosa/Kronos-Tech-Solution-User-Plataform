# Prompt para Codex CLI — Refatoração `/lista-colaboradores`

Você está no projeto Kronos.

## Repositórios

Observe:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Documentação: `kronos-business`, branch `main`.

A rota alvo é:

```text
/lista-colaboradores
```

A implementação atual está em:

```text
src/pages/ListaColaboradores.tsx
```

Refatore a tela legada para uma nova central de pessoas e contas de acesso. Após implementar e testar, remova o legado e deixe somente a nova implementação.

## Leia antes de codar

### Diretriz e mockups

```text
references/docs/kronos_lista_colaboradores_diretriz_visual.md
references/mockups/kronos_lista_colaboradores_desktop.png
references/mockups/kronos_lista_colaboradores_mobile.png
```

### Front-end

```text
package.json
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
src/pages/ListaColaboradores.tsx
src/hooks/useCollaboratorList.ts
src/service/collaborator-management.service.ts
src/service/user.service.ts
src/service/employee.service.ts
src/types/employee.ts
src/types/user.ts
src/components/PageShell.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ManagerBiometricEnrollmentModal.tsx
src/components/ui/*
```

### Back-end

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/EmployeeController.java
src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/employee/*
src/main/java/com/kts/kronos/adapter/in/web/dto/user/*
src/main/java/com/kts/kronos/application/service/EmployeeService.java
src/main/java/com/kts/kronos/application/service/UserService.java
```

### Documentação

```text
04-mapa-modulos-telas.md
08-rotas-guards-permissoes.md
03-atores-permissoes.md
04-fluxos-aplicacao.md
```

## Regras centrais

- Não altere contrato HTTP para resolver UI.
- Não crie endpoint novo por conveniência visual.
- `/lista-colaboradores` deve continuar restrita a `MANAGER`.
- Preserve a combinação atual de colaboradores + usuários.
- Preserve edição, toggle de usuário e biometria.
- Ativar/desativar precisa de confirmação.
- Biometria precisa ficar separada da edição comum.
- Não exiba imagem facial ou material biométrico.
- Não use dados mockados na implementação final.
- Desktop e mobile devem ser experiências diferentes.

## Contratos preservados

```text
GET    /employee?active=
GET    /employee/{employeeId}
PATCH  /employee/manager/update-employee/{employeeId}
POST   /employee/manager/{employeeId}/biometric-enrollment
GET    /users/search?active=
PATCH  /users/search/{userId}
PATCH  /users/toggle-activate/{userId}
```

Serviços existentes:

```ts
fetchEmployeeList(active)
listUsers(active)
getEmployee(employeeId)
updateCollaborator(employeeId, payload)
updateUser(userId, payload)
toggleUserStatus(userId)
```

## Desktop esperado

Criar uma mesa de controle:

- sidebar e header;
- hero com “Colaboradores, contas e operação em uma única visão”;
- métricas: ativos, inativos, gestores, home office e biometria pendente;
- busca e filtros horizontais;
- tabela com `Colaborador | Perfil | Jornada | Status | Biometria | Ações`;
- painel lateral com detalhes do colaborador selecionado;
- ações sensíveis isoladas.

## Mobile esperado

Criar uma lista operacional:

- topo compacto;
- métricas rápidas;
- busca grande;
- chips: Ativos, Inativos, Gestores, Home office, Biometria pendente;
- cards de colaboradores;
- menu `...` por card;
- bottom sheet de detalhes/ações;
- rodapé fixo com “Novo colaborador” e “Limpar filtros”.

Não renderize tabela no mobile.

## Estados obrigatórios

- carregando;
- lista vazia;
- sem resultado;
- ativo;
- inativo;
- biometria cadastrada;
- biometria pendente;
- conta sem usuário;
- edição aberta;
- atualização em andamento;
- erro;
- confirmação destrutiva.

## Arquitetura sugerida

```text
src/pages/ListaColaboradores.tsx
src/features/collaborators/components/*
src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts
src/features/collaborators/types/collaborator-view.types.ts
src/features/collaborators/utils/collaborator-formatters.ts
```

## Validação obrigatória

Execute:

```bash
npm run lint
npm run build
```

Se houver testes:

```bash
npm test
```

Finalize com:

```text
Arquivos alterados
Componentes criados
Contratos preservados
Comandos executados
Resultado dos comandos
Pendências
```
