# Prompt para Codex CLI — Kronos `/criar-colaborador`

Você está trabalhando no projeto Kronos.

## Repositórios

Use estes repositórios locais:

- Back-end: `Kronos-Tech-Solutions-KTS`
  - branch: `PROD_HOSTINGER_V2`
- Front-end: `Kronos-Tech-Solution-User-Plataform`
  - branch: `feature/lgpd-compliance-new-ui`
- Documentação: `kronos-business`
  - branch: `main`

## Objetivo

Refatorar a tela `/criar-colaborador` do front-end.

A tela deve deixar de ser um formulário longo e virar uma experiência de **onboarding formal de colaborador**, com duas versões reais:

1. Desktop: console de cadastro com ficha ampla e painel lateral de vínculo de acesso.
2. Mobile: fluxo guiado por etapas, com CTA fixo e menor densidade de campos.

As versões não devem ser apenas redimensionamento da mesma tela. Devem ter UX e UI distintas.

## Arquivos de referência obrigatórios

Leia antes de implementar:

```text
references/docs/kronos_criar_colaborador_diretriz_visual.md
references/mockups/kronos_criar_colaborador_desktop.png
references/mockups/kronos_criar_colaborador_mobile.png
```

O arquivo de diretriz correto para esta tarefa é `kronos_criar_colaborador_diretriz_visual.md`.

## Arquivos do front-end que você deve ler

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

## Arquivos do back-end que você deve ler

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/EmployeeController.java
src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/employee/CreateEmployeeRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/user/CreateUserRequest.java
src/main/java/com/kts/kronos/domain/model/enuns/WorkScheduleType.java
```

## Contratos que devem permanecer intactos

Não mude os endpoints.

### Checar CPF

```http
GET /employee/check-cpf?cpf=
```

Regra atual do serviço:

- `200`: CPF já existe, indisponível;
- `404`: CPF disponível.

### Criar colaborador

```http
POST /employee
```

Payload funcional atual:

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

### Checar username

```http
GET /users/check-username?username=
```

Regra atual do serviço:

- `200`: username já existe, indisponível;
- `404`: username disponível.

### Criar usuário

```http
POST /users
```

Payload funcional atual:

```ts
{
  username: string;
  role: "MANAGER" | "PARTNER";
  employeeId: string;
}
```

## Regras obrigatórias de negócio

- A criação ocorre em duas fases.
- O usuário vinculado só pode ser criado depois que o colaborador for salvo.
- O passo 2 deve ficar bloqueado até existir `employeeId`.
- CPF deve ser verificado antes de criar colaborador.
- Username deve ser verificado antes de criar usuário.
- Perfil permitido no vínculo: `MANAGER` ou `PARTNER`.
- Escalas permitidas:
  - `TRADITIONAL_5X2`
  - `SIX_BY_ONE_FIXED`
  - `ROTATING_12X36`
  - `ROTATING_24X72`
  - `SIX_BY_ONE_TWO_WEEKENDS`
  - `SIX_BY_ONE_ONE_WEEKEND`
- Home office `false` deve comunicar exigência de geolocalização.
- Home office `true` deve comunicar dispensa de geolocalização.
- Jornada deve exibir entrada, intervalo e saída.

## Direção visual

Use a identidade indicada nos mockups:

- azul noite;
- azul principal;
- cards brancos;
- bordas frias;
- selos verdes para validação;
- amarelo para pendência;
- vermelho para erro;
- roxo para perfil/acesso;
- teal para operação/geolocalização.

## Desktop esperado

A tela desktop deve ter:

- sidebar persistente;
- header com breadcrumb;
- hero `Cadastro completo com vínculo de acesso`;
- cards de progresso:
  - Dados;
  - Escala;
  - Jornada;
  - Acesso;
- painel principal `Ficha do colaborador`;
- painel lateral `Vínculo de acesso`;
- card de regra de fluxo;
- botões `Salvar dados` e `Criar acesso`;
- validação visual de CPF;
- validação visual de username;
- resumo de escala e jornada.

## Mobile esperado

A tela mobile deve ter:

- topo compacto `Criar colaborador`;
- subtítulo `Onboarding`;
- título `Novo cadastro`;
- stepper `Dados`, `Escala`, `Acesso`;
- cards verticais:
  1. dados pessoais;
  2. escala e jornada;
  3. acesso do usuário;
- banner `CPF verificado` quando aplicável;
- painel inferior fixo com próximo passo;
- CTA `Salvar dados e continuar` ou `Concluir cadastro`.

## Implementação recomendada

Você pode escolher entre:

1. Refatorar `src/pages/CriarColaborador.tsx` diretamente em componentes internos.
2. Criar pasta dedicada, por exemplo:

```text
src/features/collaborators/create/
├── CriarColaboradorPage.tsx
├── CreateCollaboratorDesktop.tsx
├── CreateCollaboratorMobile.tsx
├── components/
│   ├── OnboardingHero.tsx
│   ├── Stepper.tsx
│   ├── EmployeeFormPanel.tsx
│   ├── ScaleJourneyPanel.tsx
│   ├── AccessLinkPanel.tsx
│   ├── ValidationBadge.tsx
│   └── MobileBottomAction.tsx
└── criar-colaborador-ui.ts
```

Se criar componentes, mantenha `src/pages/CriarColaborador.tsx` como entrypoint simples.

## Preservar lógica existente

Preserve ou adapte `useCreateCollaborator`.

Não duplique payloads em vários lugares.

Não remova:

- `checkCpfAvailability`;
- `checkUsernameAvailability`;
- `createCollaborator`;
- `createUser`;
- `preloadCsrfToken`.

## Remoção de legado

Depois da nova implementação funcionar:

- remova JSX antigo da página;
- remova imports mortos;
- remova estilos mortos;
- garanta que a rota renderiza apenas a nova experiência.

## Validação final

Rode:

```bash
npm run lint
npm run build
```

Faça teste manual:

1. abrir `/criar-colaborador` como `MANAGER`;
2. tentar avançar sem CPF;
3. validar CPF;
4. salvar colaborador;
5. confirmar desbloqueio do acesso;
6. validar username;
7. criar usuário;
8. confirmar reset do fluxo;
9. testar mobile;
10. testar desktop.

## Entrega esperada

Ao final, responda com:

- arquivos alterados;
- arquivos criados;
- arquivos removidos;
- contratos preservados;
- comandos executados;
- resultado dos testes;
- riscos remanescentes.
