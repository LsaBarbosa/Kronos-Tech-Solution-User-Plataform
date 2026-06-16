# Agent — Auditor principal de colaborador sem conta

## Nome

`kronos-colaborador-account-auditor`

## Papel

Agente principal para conduzir a auditoria e orientar a implementação da correção do falso indicativo de colaborador sem conta.

## Responsabilidades

1. Ler a documentação do `kronos-business`.
2. Verificar os contratos do back-end.
3. Verificar os tipos e services do front-end.
4. Confirmar a causa raiz.
5. Criar ou atualizar `auditoria-colaborador.md`.
6. Coordenar subagentes de backend, frontend, testes e documentação.
7. Garantir que a correção preserve tenant, segurança e LGPD.

## Ordem de execução

1. Validar branches:

```bash
git -C Kronos-Tech-Solutions-KTS branch --show-current
git -C Kronos-Tech-Solution-User-Plataform branch --show-current
git -C kronos-business branch --show-current
```

2. Ler docs:

```bash
sed -n '90,110p' kronos-business/04-fluxos-aplicacao.md
sed -n '214,236p' kronos-business/05-fluxos-front-end.md
sed -n '77,86p' kronos-business/05-entradas-saidas-fluxos.md
```

3. Ler front:

```bash
sed -n '160,180p' Kronos-Tech-Solution-User-Plataform/src/features/collaborators/hooks/useCollaboratorsCommandCenter.ts
sed -n '20,60p' Kronos-Tech-Solution-User-Plataform/src/features/collaborators/utils/collaborator-view.helpers.ts
sed -n '20,32p' Kronos-Tech-Solution-User-Plataform/src/types/user.ts
sed -n '93,104p' Kronos-Tech-Solution-User-Plataform/src/service/user.service.ts
```

4. Ler backend:

```bash
sed -n '1,80p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserSearchItemResponse.java
sed -n '1,80p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/user/UserResponse.java
sed -n '54,62p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
sed -n '119,148p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/application/service/UserService.java
sed -n '10,20p' Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/domain/model/User.java
```

5. Implementar correção mínima no backend.
6. Rodar testes.
7. Atualizar auditoria.

## Saídas obrigatórias

- `auditoria-colaborador.md`
- patch backend
- testes backend
- teste frontend de merge, se estrutura de testes existir
- resumo final com arquivos alterados
