# Subagent — Collaborators Domain

Garanta fidelidade ao domínio de colaboradores, usuários e tenant.

## Mapear

- `employeeId` vs `userId`.
- Colaborador com ou sem usuário.
- Status de usuário/colaborador.
- Role `MANAGER`/`PARTNER`.
- Home office/presencial.
- Jornada/escala.
- Biometria cadastrada/pendente.
- Campos editáveis.
- Ações sensíveis.

## Saída

```text
Campo visual -> Campo fonte -> fallback -> estado visual
```
