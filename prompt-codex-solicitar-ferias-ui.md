# Prompt para Codex CLI — Refatoração da rota `/solicitar-ferias` do Kronos

Você é o agente de execução técnica do projeto Kronos.

## Objetivo

Refatore a rota `/solicitar-ferias` no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, criando uma nova tela de solicitação de férias com duas experiências distintas:

1. **Desktop:** painel de planejamento de férias.
2. **Mobile:** assistente de solicitação em etapas.

A nova tela deve refletir a identidade da plataforma Kronos e o domínio de ponto/férias descrito na documentação `kronos-business`.

Não implemente apenas um redimensionamento responsivo. Desktop e mobile precisam ter navegação, densidade, hierarquia visual e fluxo próprios.

## Repositórios

Use os caminhos locais abaixo. Se os caminhos forem diferentes, descubra ou peça confirmação antes de modificar.

```text
<BACKEND_REPO>  = caminho local do repositório Kronos-Tech-Solutions-KTS
<FRONTEND_REPO> = caminho local do repositório Kronos-Tech-Solution-User-Plataform
<DOCS_REPO>     = caminho local do repositório kronos-business
```

Branches obrigatórias:

```bash
git -C <BACKEND_REPO> checkout PROD_HOSTINGER_V2
git -C <FRONTEND_REPO> checkout feature/lgpd-compliance-new-ui
git -C <DOCS_REPO> checkout main
```

---

# Fase 0 — Leitura obrigatória sem alteração

Antes de modificar qualquer arquivo, leia e resuma internamente os arquivos abaixo.

## Documentação

No repositório `kronos-business`, branch `main`, leia:

- mapa de módulos e telas;
- fluxos front-end;
- regras de negócio;
- entradas e saídas;
- fluxos de ponto/férias;
- documentação de componentes/rotas, se houver;
- qualquer arquivo relacionado a férias, ponto eletrônico, solicitação, aprovação, usuário autenticado e manager.

Leia também a diretriz visual:

```text
kronos_solicitar_ferias_diretriz_visual.md
```

Use os mockups como referência visual obrigatória:

```text
kronos_solicitar_ferias_desktop.png
kronos_solicitar_ferias_mobile.png
```

Se esses três arquivos não forem encontrados, pare e mostre:

```text
Não encontrei os arquivos visuais obrigatórios para /solicitar-ferias:
- kronos_solicitar_ferias_diretriz_visual.md
- kronos_solicitar_ferias_desktop.png
- kronos_solicitar_ferias_mobile.png
Informe o caminho correto antes da implementação.
```

## Back-end

No repositório `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`, leia:

```text
build.gradle
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/RequestVacationRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/VacationApprovalRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/VacationRequestPageResponse.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/MyRequestsResponse.java se existir
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/MyRequestItemResponse.java se existir
```

Confirme os endpoints:

```http
POST /records/vacation-request
PATCH /records/vacation-request/approve
PATCH /records/vacation-request/reject
GET /records/vacation-request
GET /records/me/requests?limit= se existir no controller
```

## Front-end

No repositório `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, leia:

```text
package.json
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
src/config/api.ts
src/pages/RequestVacation.tsx
src/hooks/useVacationRequest.ts
src/service/records.service.ts
src/types/vacation.ts
src/types/recordApproval.ts
src/lib/query-keys.ts
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/calendar.tsx
src/components/ui/select.tsx
src/components/ui/popover.tsx
src/components/ui/dialog.tsx se existir
src/components/ui/drawer.tsx se existir
```

Ao terminar a leitura, produza este resumo no terminal e somente depois implemente:

```text
Resumo de leitura — /solicitar-ferias:
- contratos confirmados:
- DTOs confirmados:
- arquivos front-end críticos:
- arquivos visuais encontrados:
- regras de férias:
- restrições de UX:
- riscos:
- plano de implementação:
```

---

# Fase 1 — Regras de implementação

## Não alterar backend

A implementação deve consumir o contrato existente. Não crie endpoint, DTO, controller ou migration.

## Preservar contrato de solicitação

O envio deve continuar usando:

```ts
requestVacation({
  startDate: 'yyyy-MM-dd',
  endDate: 'yyyy-MM-dd',
  managerId: 'uuid',
})
```

## Não inventar dados

Não exiba:

- saldo de férias;
- dias disponíveis;
- férias vencidas;
- elegibilidade trabalhista;
- cálculo de remuneração;
- aprovação automática;
- calendário corporativo oficial;

salvo se houver endpoint/documentação real para isso.

## Linguagem correta

Usar:

- "Solicitação de férias";
- "Período solicitado";
- "Manager responsável pela aprovação";
- "Enviar para aprovação";
- "Solicitação enviada para análise";
- "Cada dia do período será registrado para aprovação".

Evitar:

- "Férias aprovadas" após submit;
- "Você tem direito a X dias";
- "Garantido";
- "Concedido".

---

# Fase 2 — Arquitetura recomendada

Crie uma feature isolada:

```text
src/features/vacation-request/
├── components/
│   ├── VacationRequestShell.tsx
│   ├── VacationRequestDesktop.tsx
│   ├── VacationRequestMobile.tsx
│   ├── VacationHero.tsx
│   ├── VacationPlanningGrid.tsx
│   ├── VacationPeriodPlanner.tsx
│   ├── VacationDateRangeSummary.tsx
│   ├── VacationManagerSelector.tsx
│   ├── VacationReviewPanel.tsx
│   ├── VacationRulesCard.tsx
│   ├── VacationRecentRequestsPanel.tsx
│   ├── MobileVacationHeader.tsx
│   ├── MobileVacationStepper.tsx
│   ├── MobileDateStep.tsx
│   ├── MobileManagerStep.tsx
│   ├── MobileReviewStep.tsx
│   └── MobileStickyActionBar.tsx
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
    ├── vacation-date-utils.test.ts
    └── vacation-validation.test.ts
```

Atualize `src/pages/RequestVacation.tsx` para delegar para a nova feature:

```tsx
import { VacationRequestShell } from '@/features/vacation-request/components/VacationRequestShell';

export default function RequestVacation() {
  return <VacationRequestShell />;
}
```

Se o arquivo atual exportar também `export const RequestVacation`, mantenha compatibilidade somente se algum import depender disso. Caso contrário, padronize para default export conforme lazy import do `App.tsx`.

---

# Fase 3 — View model

Crie `useVacationRequestViewModel` para centralizar:

- datas selecionadas;
- manager selecionado;
- lista de managers;
- loading de managers;
- envio;
- sucesso;
- erro;
- quantidade de dias corridos;
- mensagens de validação;
- label do período;
- payload pronto para submit;
- reset.

Reaproveite o hook atual `useVacationRequest` quando fizer sentido. Se ele ficar limitado para a nova UX, refatore mantendo a mesma integração externa.

Exemplo de shape:

```ts
export type VacationRequestViewModel = {
  startDate?: Date;
  endDate?: Date;
  managerId: string;
  managerOptions: ManagerOption[];
  selectedManager?: ManagerOption;
  isLoadingManagers: boolean;
  isSubmitting: boolean;
  dayCount: number;
  periodLabel: string;
  validationMessage?: string;
  canSubmit: boolean;
  successCreatedIds?: number[];
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
  setManagerId: (id: string) => void;
  submit: () => void;
  reset: () => void;
};
```

---

# Fase 4 — Desktop

Implemente `VacationRequestDesktop` como painel de planejamento.

## Requisitos visuais

- Sidebar persistente à esquerda.
- Header superior do app.
- Hero com identidade Kronos e propósito da tela.
- Layout em grid, preferencialmente 12 colunas.
- Card principal para escolher período.
- Card de manager aprovador.
- Card de regras/próximos passos.
- Painel lateral de revisão com CTA.
- Feedback de sucesso/erro.

## Conteúdo recomendado

Hero:

```text
Planejar férias
Escolha o período, selecione o manager responsável e envie sua solicitação para aprovação.
```

Regras:

```text
- O período precisa ser atual ou futuro.
- A data final não pode ser anterior à inicial.
- O manager selecionado será responsável pela análise.
- Após o envio, cada dia do período será registrado para aprovação.
```

Revisão:

```text
Período solicitado
Início
Fim
Dias corridos
Manager
Status esperado: Pendente de aprovação
```

---

# Fase 5 — Mobile

Implemente `VacationRequestMobile` como assistente em etapas.

## Requisitos de navegação

- Sem sidebar persistente.
- Header compacto.
- Stepper ou chips horizontais:
  - Período;
  - Manager;
  - Revisão.
- Uma etapa ativa por vez.
- CTA fixo no rodapé.
- Revisão obrigatória antes do envio.

## Comportamento

1. Etapa `Período`:
   - selecionar início;
   - selecionar fim;
   - mostrar quantidade de dias.

2. Etapa `Manager`:
   - listar managers;
   - loading claro;
   - estado vazio.

3. Etapa `Revisão`:
   - mostrar período;
   - mostrar manager;
   - mostrar aviso de aprovação;
   - enviar.

## Acessibilidade mobile

- Botões com altura mínima de 44px.
- `aria-label` em botões iconográficos.
- CTA respeitando `env(safe-area-inset-bottom)`.
- Sem overflow horizontal.

---

# Fase 6 — Integrações opcionais

Você pode adicionar painel de "minhas solicitações recentes" somente se o contrato já existir no front-end/backend.

Contrato provável:

```http
GET /records/me/requests?limit=5
```

Se não existir serviço front-end, pode criar wrapper em `records.service.ts` **somente se o backend confirmar endpoint e DTO**. Se houver risco de incompatibilidade, deixe fora da primeira entrega.

---

# Fase 7 — Remover legado

Após a nova tela estar funcional:

1. Remover layout antigo de `src/pages/RequestVacation.tsx`.
2. Remover imports mortos.
3. Remover componentes legados não usados.
4. Preservar serviços compartilhados usados por `/ferias` ou `/solicitar-abono`.
5. Rodar lint.

---

# Fase 8 — Validação

Execute:

```bash
cd <FRONTEND_REPO>
npm run lint
npm run build
npm run test
```

Se `npm run test` falhar por ausência de ambiente, registre o erro completo e execute pelo menos os testes unitários criados.

Valide manualmente:

```text
Desktop:
- abrir /solicitar-ferias em largura >= 1024px;
- escolher período válido;
- escolher manager;
- revisar;
- enviar.

Mobile:
- abrir /solicitar-ferias em largura <= 430px;
- avançar por etapas;
- validar erros;
- revisar;
- enviar.
```

---

# Saída final obrigatória

Ao terminar, responda no terminal:

```text
Resumo final — /solicitar-ferias:
- arquivos criados:
- arquivos alterados:
- arquivos removidos:
- contratos preservados:
- diferenças desktop/mobile:
- validações implementadas:
- comandos executados:
- resultado dos comandos:
- riscos/pontos pendentes:
```
