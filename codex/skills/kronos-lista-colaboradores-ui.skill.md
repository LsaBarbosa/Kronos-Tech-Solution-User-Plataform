# Skill — Kronos `/lista-colaboradores` UI Refactor

## Missão

Implementar a nova experiência da rota `/lista-colaboradores`, transformando-a em uma **People Operations Command Center** para gestores.

## Fontes obrigatórias

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
kronos-business/04-mapa-modulos-telas.md
kronos-business/08-rotas-guards-permissoes.md
kronos-business/03-atores-permissoes.md
kronos-business/04-fluxos-aplicacao.md
references/docs/kronos_lista_colaboradores_diretriz_visual.md
references/mockups/kronos_lista_colaboradores_desktop.png
references/mockups/kronos_lista_colaboradores_mobile.png
```

## Escopo funcional

A nova tela deve permitir ao gestor:

- visualizar colaboradores do próprio tenant;
- buscar por nome, usuário ou cargo;
- filtrar por status, role, home office/presencial e biometria;
- diferenciar colaborador e conta de usuário;
- ver jornada, escala, contato, local e biometria;
- selecionar colaborador sem perder o contexto da lista;
- editar dados autorizados;
- ativar/desativar usuário com confirmação;
- abrir cadastro biométrico gerencial como ação separada;
- limpar filtros;
- navegar para criação de novo colaborador.

## Contratos a preservar

```text
GET    /employee?active=
GET    /employee/{employeeId}
PATCH  /employee/manager/update-employee/{employeeId}
POST   /employee/manager/{employeeId}/biometric-enrollment
GET    /users/search?active=
PATCH  /users/search/{userId}
PATCH  /users/toggle-activate/{userId}
```

Use os serviços já existentes sempre que possível:

```ts
fetchEmployeeList(active)
listUsers(active)
getEmployee(employeeId)
updateCollaborator(employeeId, payload)
updateUser(userId, payload)
toggleUserStatus(userId)
```

## Experiência desktop

- Sidebar e header preservados.
- Hero institucional com contexto de central de pessoas.
- Métricas: ativos, inativos, gestores, home office e biometria pendente quando possível.
- Filtros horizontais.
- Tabela densa: colaborador, perfil, jornada, status, biometria e ações.
- Painel lateral com detalhes do selecionado.
- Ações sensíveis isoladas e confirmadas.

## Experiência mobile

- Sem tabela.
- Topo compacto.
- Métricas resumidas.
- Busca destacada.
- Chips de filtros.
- Cards empilhados.
- Menu `...` por colaborador.
- Bottom sheet para detalhe/ações.
- Rodapé fixo com “Novo colaborador” e “Limpar filtros”.

## Regras de segurança

- `/lista-colaboradores` continua restrita a `MANAGER`.
- MANAGER opera apenas o próprio tenant.
- Não exibir material biométrico.
- Não logar CPF bruto, imagem facial, token ou senha.
- Ativar/desativar precisa de confirmação.
- Biometria não deve ser misturada com edição comum.
- Status deve ter texto além de cor.

## Saída

O Codex deve entregar nova implementação, remover o legado visual e executar `npm run lint` e `npm run build`.
