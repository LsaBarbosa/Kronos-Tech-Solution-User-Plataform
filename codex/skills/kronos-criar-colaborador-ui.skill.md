# Skill — Kronos `/criar-colaborador` UI Refactor

## Missão

Implementar a nova experiência visual e funcional da rota `/criar-colaborador`, transformando a tela em um **Employee Onboarding Console**.

## Contexto de produto

A tela cria um colaborador e, somente depois, cria a conta de acesso vinculada.

O fluxo de negócio é obrigatório:

1. Capturar dados pessoais, profissionais, endereço, escala e jornada.
2. Validar CPF.
3. Criar colaborador via API.
4. Receber `employeeId`.
5. Desbloquear criação de acesso.
6. Validar username.
7. Criar usuário vinculado ao `employeeId`.
8. Confirmar conclusão e permitir novo cadastro.

## Arquivos que devem ser lidos antes de implementar

### Front-end

```text
src/App.tsx
src/config/app-routes.ts
src/pages/CriarColaborador.tsx
src/hooks/useCreateCollaborator.ts
src/service/collaborator-management.service.ts
src/config/api-routes.ts
src/components/PageShell.tsx
src/components/Sidebar.tsx
src/components/Header.tsx
src/components/ui/
```

### Back-end

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/EmployeeController.java
src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/employee/CreateEmployeeRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/user/CreateUserRequest.java
src/main/java/com/kts/kronos/domain/model/enuns/WorkScheduleType.java
```

### Documentação e assets

```text
references/docs/kronos_criar_colaborador_diretriz_visual.md
references/mockups/kronos_criar_colaborador_desktop.png
references/mockups/kronos_criar_colaborador_mobile.png
```

## Resultado esperado

### Desktop

Construir uma experiência de console:

- sidebar persistente;
- header com contexto;
- hero institucional;
- cards de progresso;
- painel principal de ficha do colaborador;
- painel lateral de vínculo de acesso;
- resumo de escala, jornada e validações;
- botões separados para salvar dados e criar acesso.

### Mobile

Construir uma experiência de onboarding:

- topo compacto;
- stepper horizontal;
- cards verticais;
- fluxo por etapas;
- CTA fixo no rodapé;
- resumo do próximo passo;
- menos campos simultâneos;
- foco em evitar erro de preenchimento.

## Contratos que não podem mudar

### Criar colaborador

```http
POST /employee
```

Payload funcional:

```ts
{
  fullName: string;
  cpf: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  homeOffice: boolean;
  faceImageBase64?: string;
  address: {
    postalCode: string;
    number: string;
  };
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  scheduleType: string;
  scaleStartDate: string | null;
  preferredDayOff: string | null;
  weekendOffIndex: number | null;
  fixedWorkDays: string[];
}
```

### Criar usuário

```http
POST /users
```

Payload funcional:

```ts
{
  username: string;
  role: "MANAGER" | "PARTNER";
  employeeId: string;
}
```

### Checar CPF

```http
GET /employee/check-cpf?cpf=
```

Regra do serviço atual:

- `200` significa que já existe;
- `404` significa disponível.

### Checar username

```http
GET /users/check-username?username=
```

Regra do serviço atual:

- `200` significa que já existe;
- `404` significa disponível.

## Regras de negócio obrigatórias

- O usuário de acesso só é criado após o colaborador existir.
- CPF precisa ser validado antes do passo 1.
- Username precisa ser validado antes do passo 2.
- Escalas suportadas:
  - `TRADITIONAL_5X2`
  - `SIX_BY_ONE_FIXED`
  - `ROTATING_12X36`
  - `ROTATING_24X72`
  - `SIX_BY_ONE_TWO_WEEKENDS`
  - `SIX_BY_ONE_ONE_WEEKEND`
- Home office `false` deve comunicar que há exigência de geolocalização.
- Jornada deve exibir entrada, intervalo e saída.
- Perfil de usuário deve permitir apenas `MANAGER` e `PARTNER`.
- Estados de CPF, username, envio e conclusão precisam aparecer de forma textual e visual.

## Regras de implementação

- Preservar ou adaptar `useCreateCollaborator`; não mover regra crítica para JSX sem necessidade.
- Separar componentes visuais quando a tela ficar grande.
- Usar os componentes existentes em `src/components/ui`.
- Evitar nova dependência.
- Evitar duplicação de regra de payload.
- Remover a UI legada depois que a nova UI estiver funcionando.
- Manter `PageShell`, `ProtectedRoute` e `RoleRoute` compatíveis com o padrão atual da aplicação.

## Qualidade esperada

- `npm run build` deve passar.
- `npm run lint` deve passar ou registrar exatamente o que já era legado.
- Nenhuma alteração de contrato HTTP.
- Sem dados sensíveis em logs.
- UX desktop e mobile semanticamente diferentes.
