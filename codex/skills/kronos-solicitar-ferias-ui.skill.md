# Skill — Kronos `/solicitar-ferias` UI/UX Refactor

## Missão

Executar a refatoração completa da rota `/solicitar-ferias` no front-end Kronos, criando uma tela de solicitação de férias com identidade visual renovada e experiências distintas para desktop e mobile.

## Contexto funcional

A tela atual é um formulário linear. A nova tela deve representar uma jornada de **planejamento de ausência** vinculada ao domínio de ponto eletrônico, onde o usuário autenticado escolhe período, seleciona manager aprovador e revisa o impacto antes do envio.

## Contratos que devem ser preservados

Não mudar contrato HTTP sem autorização explícita.

### Solicitação de férias

```http
POST /records/vacation-request
```

Body esperado:

```json
{
  "startDate": "yyyy-MM-dd",
  "endDate": "yyyy-MM-dd",
  "managerId": "uuid"
}
```

Resposta esperada:

```http
201 Created
```

Body:

```json
[123, 124, 125]
```

A lista representa os IDs dos registros diários criados para aprovação.

### Managers disponíveis

Usar o serviço existente de busca de usuários ativos e filtrar role `MANAGER`, salvo se o front já possuir serviço mais específico.

### Regras de validação

- `startDate` obrigatório.
- `endDate` obrigatório.
- `managerId` obrigatório.
- `startDate` não pode ser passado.
- `endDate` não pode ser passado.
- `endDate >= startDate`.
- Usar datas no padrão `yyyy-MM-dd` ao enviar ao backend.
- Não fabricar saldo de férias, política trabalhista ou elegibilidade se não houver endpoint/contrato no projeto.

## Leitura obrigatória

### Documentação `kronos-business`

- mapa de módulos e telas;
- fluxos front-end;
- regras de negócio;
- entradas e saídas;
- contratos de ponto e férias;
- diretriz visual `kronos_solicitar_ferias_diretriz_visual.md`;
- mockups `kronos_solicitar_ferias_desktop.png` e `kronos_solicitar_ferias_mobile.png`.

### Back-end `Kronos-Tech-Solutions-KTS`

- `src/main/java/com/kts/kronos/constants/ApiPaths.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/RequestVacationRequest.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/VacationApprovalRequest.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/VacationRequestPageResponse.java`;
- service/usecase de férias, se necessário para entender status e efeitos.

### Front-end `Kronos-Tech-Solution-User-Plataform`

- `package.json`;
- `src/App.tsx`;
- `src/config/app-routes.ts`;
- `src/config/api-routes.ts`;
- `src/pages/RequestVacation.tsx`;
- `src/hooks/useVacationRequest.ts`;
- `src/service/records.service.ts`;
- `src/types/vacation.ts`;
- `src/components/Header.tsx`;
- `src/components/Sidebar.tsx`;
- componentes em `src/components/ui`;
- padrões visuais recém-criados em outras telas, se existirem.

## Arquitetura recomendada

Criar uma feature isolada:

```text
src/features/vacation-request/
├── components/
│   ├── VacationRequestShell.tsx
│   ├── VacationRequestDesktop.tsx
│   ├── VacationRequestMobile.tsx
│   ├── VacationHero.tsx
│   ├── VacationPeriodPlanner.tsx
│   ├── VacationDateRangeSummary.tsx
│   ├── VacationManagerSelector.tsx
│   ├── VacationReviewPanel.tsx
│   ├── VacationRulesCard.tsx
│   ├── VacationRecentRequestsPanel.tsx
│   └── MobileVacationStepper.tsx
├── hooks/
│   ├── useVacationRequestViewModel.ts
│   └── useVacationResponsiveMode.ts
├── mappers/
│   └── vacation-request.mapper.ts
├── utils/
│   ├── vacation-date-utils.ts
│   └── vacation-validation.ts
├── styles/
│   └── vacation-request.tokens.ts
├── types.ts
└── __tests__/
```

`src/pages/RequestVacation.tsx` deve virar um componente fino, responsável apenas por renderizar o container da feature.

## Experiência desktop

A versão desktop deve ser um painel de planejamento:

- sidebar persistente;
- header superior atual do app;
- layout em grid;
- hero com título, status e explicação curta;
- card principal para período;
- card lateral para manager e revisão;
- preview com quantidade de dias corridos selecionados;
- aviso de que cada dia do período cria registro para aprovação;
- seção de próximos passos;
- estado de sucesso com quantidade de IDs criados;
- estados de loading e erro.

## Experiência mobile

A versão mobile deve ser um assistente:

- header compacto sem sidebar persistente;
- chips ou stepper horizontal;
- uma etapa por vez;
- botões com altura mínima de 44px;
- CTA fixo no rodapé;
- bottom sheet ou diálogo para escolher manager, se a lista ficar longa;
- revisão antes do envio;
- feedback pós-envio com opção de limpar/nova solicitação.

## Acessibilidade

- Labels explícitos para datas e manager.
- `aria-label` nos botões iconográficos.
- Estados de erro visíveis e semanticamente claros.
- Foco perceptível.
- Alvos de toque de no mínimo 44px no mobile.
- Não depender apenas de cor para comunicar erro/sucesso.

## Testes mínimos

Executar e corrigir:

```bash
npm run lint
npm run build
npm run test -- --runInBand
```

Se `--runInBand` não existir no Vitest local, executar:

```bash
npm run test
```

Criar testes unitários para utilitários novos de data/validação e, se viável, testes de componente para renderização básica desktop/mobile.

## Critério de pronto

- `/solicitar-ferias` abre sem erro.
- Desktop e mobile não são apenas resize.
- Contratos antigos continuam funcionando.
- Legado substituído e imports mortos removidos.
- A tela não inventa dados que o backend não fornece.
- Lint e build passam ou falhas pré-existentes são documentadas com evidência.
