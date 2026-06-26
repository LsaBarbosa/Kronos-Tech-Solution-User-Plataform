# Notas para execução — Front-end Check-in

Branch: `checkin`.

## Objetivo

Criar nova tela isolada de check-in/checkout para colaboradores. A tela deve ter fluxo simples, não depender do dashboard e consumir o contrato novo do back-end.

## Ler primeiro

- `README.md`
- `package.json`
- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/config/api-routes.ts`
- `src/config/api.ts`
- `src/service/auth.service.ts`
- `src/service/records.service.ts`
- `src/context/CheckinContext.tsx`
- `src/components/checkin/CheckinModal.tsx`
- `src/types/checkin.types.ts`
- `../kronos-business/README.md`
- `../kronos-business/04-fluxos-aplicacao.md`
- `../kronos-business/06-contratos-api.md`

## Sequência

1. Criar rota `/checkin` fora do bloco protegido.
2. Criar página/feature própria para terminal.
3. Criar serviço para o endpoint novo do back-end.
4. Criar tipos TypeScript do request/response.
5. Implementar estados: iniciar, coletar dados, enviar, sucesso, erro e sair.
6. Adicionar botão de reinício do fluxo.
7. Exibir sucesso por 10 segundos.
8. Resetar tela no final.
9. Criar mobile e desktop com UX distinta.
10. Criar testes.

## Validação

```bash
npm run lint
npm run test
npm run build
```

Resumo final obrigatório:

- arquivos alterados;
- rota criada;
- serviço criado;
- testes criados ou ajustados;
- comandos executados;
- pendências, se houver.
