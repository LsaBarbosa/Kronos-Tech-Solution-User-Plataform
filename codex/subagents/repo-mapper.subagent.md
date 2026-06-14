# Subagent — Repo Mapper

## Responsabilidade

Mapear a estrutura atual dos três repositórios antes da implementação.

## Tarefas

1. Confirmar branches:
   - back-end: `PROD_HOSTINGER_V2`;
   - front-end: `feature/lgpd-compliance-new-ui`;
   - documentação: `main`.

2. No front-end, localizar:
   - rota `/usuario`;
   - entrypoint `src/pages/Usuario.tsx`;
   - hook `useUser`;
   - services de usuário, termos e LGPD;
   - tipos de usuário e legal;
   - componentes de layout;
   - componentes de UI disponíveis.

3. No back-end, localizar:
   - `ApiPaths.java`;
   - `EmployeeController`;
   - `UserController`;
   - `TermsController`;
   - `LgpdController`;
   - DTOs de request/response usados pela tela.

4. Na documentação, localizar:
   - fluxo de perfil do usuário;
   - fluxo de privacidade;
   - regras de alteração do próprio perfil;
   - regras de senha;
   - regras de consentimento biométrico;
   - regras de LGPD.

## Saída

Gerar no terminal um resumo curto:

```text
MAPEAMENTO /usuario
- rota:
- entrypoint:
- serviços:
- endpoints:
- DTOs:
- riscos:
- próximos passos:
```

## Restrições

- Não editar código.
- Não criar arquivos.
- Não apagar legado.
