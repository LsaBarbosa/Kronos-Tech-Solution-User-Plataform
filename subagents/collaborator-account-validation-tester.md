# Subagent — Testes e validação

## Nome

`collaborator-account-validation-tester`

## Missão

Garantir que a correção seja validada por testes automatizados e por roteiro manual local.

## Testes backend

Rodar no back-end:

```bash
cd Kronos-Tech-Solutions-KTS
./gradlew test
./gradlew unitTest || true
./gradlew clean build
```

Caso `unitTest` não exista ou não esteja configurado, registrar no relatório e usar o comando disponível no projeto.

## Testes frontend

Rodar no front-end:

```bash
cd Kronos-Tech-Solution-User-Plataform
npm install
npm run lint
npm run test -- --run || true
npm run build
```

Adaptar para `pnpm`/`yarn` se o lockfile indicar outro gerenciador.

## Validação manual

1. Subir back-end local.
2. Logar como manager.
3. Chamar `/users/search`.
4. Confirmar `employeeId` em cada item.
5. Abrir `/lista-colaboradores`.
6. Confirmar que contas aparecem vinculadas.
7. Testar filtro “Sem usuário”.
8. Testar alternar status de colaborador com conta.

## Evidências a registrar

- Antes/depois do payload `/users/search`.
- Print ou descrição da UI antes/depois.
- Comandos de teste executados.
- Resultado dos testes.
- Arquivos alterados.
