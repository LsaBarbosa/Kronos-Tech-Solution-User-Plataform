# Subagent — Onboarding Domain

## Objetivo

Validar o domínio da criação de colaborador.

## Pontos obrigatórios

- O fluxo é em duas fases.
- O usuário só nasce após colaborador salvo.
- `employeeId` retornado pelo passo 1 alimenta o passo 2.
- CPF deve ser checado antes da criação.
- Username deve ser checado antes da criação do usuário.
- Role permitida no vínculo: `MANAGER` ou `PARTNER`.
- Escalas devem respeitar enum do back-end.
- Home office deve comunicar impacto em geolocalização.
- Jornada precisa de entrada, intervalo e saída.

## Validação esperada

Conferir:

- `CreateEmployeeRequest`;
- `CreateUserRequest`;
- `WorkScheduleType`;
- `EmployeeController`;
- `UserController`;
- `useCreateCollaborator`;
- `collaborator-management.service.ts`.

## Saída esperada

Lista de regras que a UI precisa refletir e riscos se alguma for quebrada.
