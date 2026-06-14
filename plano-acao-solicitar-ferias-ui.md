# Plano de ação — Refatoração da rota `/solicitar-ferias`

## Objetivo

Refatorar a tela `/solicitar-ferias` do Kronos para criar uma nova experiência de solicitação de férias, com UI/UX distintas para desktop e mobile, preservando os contratos HTTP atuais do backend.

---

# ÉPICO 01 — Preparação e leitura obrigatória

## História 01.01 — Confirmar branches e estado inicial

**Objetivo:** garantir que os três repositórios estão nas branches corretas antes de qualquer alteração.

### Tasks

1. Confirmar back-end:

```bash
git -C <BACKEND_REPO> checkout PROD_HOSTINGER_V2
git -C <BACKEND_REPO> pull
git -C <BACKEND_REPO> status --short
```

2. Confirmar front-end:

```bash
git -C <FRONTEND_REPO> checkout feature/lgpd-compliance-new-ui
git -C <FRONTEND_REPO> pull
git -C <FRONTEND_REPO> status --short
```

3. Confirmar documentação:

```bash
git -C <DOCS_REPO> checkout main
git -C <DOCS_REPO> pull
git -C <DOCS_REPO> status --short
```

4. Rodar baseline no front-end:

```bash
cd <FRONTEND_REPO>
npm install
npm run lint
npm run build
```

### Critério de aceite

- Branches corretas confirmadas.
- Falhas pré-existentes documentadas antes da implementação.

---

## História 01.02 — Localizar diretriz visual e mockups

**Objetivo:** garantir que a implementação seja guiada pelos arquivos visuais corretos.

### Tasks

1. Procurar arquivos:

```bash
find <DOCS_REPO> <FRONTEND_REPO> -iname 'kronos_solicitar_ferias_desktop.png' \
  -o -iname 'kronos_solicitar_ferias_mobile.png' \
  -o -iname 'kronos_solicitar_ferias_diretriz_visual.md'
```

2. Ler obrigatoriamente:

- `kronos_solicitar_ferias_diretriz_visual.md`;
- `kronos_solicitar_ferias_desktop.png`;
- `kronos_solicitar_ferias_mobile.png`.

3. Se algum arquivo não existir, parar e registrar:

```text
Arquivos visuais ausentes:
- ...
```

### Critério de aceite

- Diretriz e mockups encontrados e usados.
- Caso ausentes, a implementação não deve prosseguir sem confirmação do usuário.

---

## História 01.03 — Mapear documentação de negócio

**Objetivo:** alinhar a tela ao domínio do Kronos.

### Tasks

1. Ler no `kronos-business`:

- mapa de módulos e telas;
- fluxos front-end;
- regras de negócio;
- entidades;
- entradas e saídas;
- fluxos de ponto/férias;
- qualquer documentação de identidade visual.

2. Confirmar:

- `/solicitar-ferias` é rota autenticada;
- `RequestVacation` é a tela atual;
- `requestVacation` e `fetchManagerOptions` são os serviços principais;
- gestão de férias fica em `/ferias`, restrita a `MANAGER`.

### Critério de aceite

- Resumo escrito no terminal com regras e contratos encontrados.

---

# ÉPICO 02 — Contratos e legado

## História 02.01 — Mapear backend

**Objetivo:** confirmar endpoints, permissões e payload.

### Tasks

1. Ler:

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/RequestVacationRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/VacationApprovalRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/vacation/VacationRequestPageResponse.java
```

2. Confirmar contrato de envio:

```http
POST /records/vacation-request
```

3. Confirmar payload:

```json
{
  "startDate": "yyyy-MM-dd",
  "endDate": "yyyy-MM-dd",
  "managerId": "uuid"
}
```

4. Confirmar retorno:

```json
[1, 2, 3]
```

5. Confirmar permissões:

- solicitar: qualquer empregado autenticado;
- aprovar/rejeitar/listar gestão: `MANAGER`.

### Critério de aceite

- Tabela de contrato backend preenchida antes de codar.

---

## História 02.02 — Mapear front-end legado

**Objetivo:** entender o que reaproveitar e o que substituir.

### Tasks

1. Ler:

```text
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
src/pages/RequestVacation.tsx
src/hooks/useVacationRequest.ts
src/service/records.service.ts
src/types/vacation.ts
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/*
```

2. Identificar:

- estado de datas;
- estado de manager;
- validação `zod`;
- serviço de submit;
- toast de sucesso/erro;
- seleção de calendário;
- Select de manager;
- layout legado com card único.

### Critério de aceite

- Lista clara do que será reaproveitado.
- Lista clara do que será removido.

---

# ÉPICO 03 — Fundação da nova feature

## História 03.01 — Criar estrutura isolada

**Objetivo:** separar a nova tela do legado.

### Tasks

Criar:

```text
src/features/vacation-request/
├── components/
├── hooks/
├── mappers/
├── utils/
├── styles/
├── types.ts
└── __tests__/
```

Arquivos iniciais:

```text
components/VacationRequestShell.tsx
components/VacationRequestDesktop.tsx
components/VacationRequestMobile.tsx
hooks/useVacationRequestViewModel.ts
hooks/useVacationResponsiveMode.ts
utils/vacation-date-utils.ts
utils/vacation-validation.ts
styles/vacation-request.tokens.ts
types.ts
```

### Critério de aceite

- Feature compila vazia ou com render inicial.
- `src/pages/RequestVacation.tsx` passa a delegar para `VacationRequestShell`.

---

## História 03.02 — Criar view model

**Objetivo:** centralizar estado e regras de apresentação.

### Tasks

1. Reaproveitar ou envolver `useVacationRequest`.
2. Expor dados calculados:

```ts
{
  startDate,
  endDate,
  managerId,
  managerOptions,
  selectedManager,
  dayCount,
  formattedStartDate,
  formattedEndDate,
  periodLabel,
  validationState,
  canSubmit,
  isSubmitting,
  isLoadingManagers,
  submit,
  reset,
}
```

3. Criar utilitários:

- `countCalendarDaysInclusive(start, end)`;
- `formatVacationDate(date)`;
- `formatVacationPeriod(start, end)`;
- `isVacationPeriodValid(start, end)`;
- `getVacationValidationMessage(state)`.

4. Criar testes unitários para utilitários.

### Critério de aceite

- Cálculos testados.
- Nenhuma regra duplicada diretamente dentro dos componentes visuais.

---

# ÉPICO 04 — Implementação desktop

## História 04.01 — Criar layout desktop

**Objetivo:** entregar experiência de painel de planejamento.

### Tasks

Criar componentes:

```text
VacationHero.tsx
VacationPlanningGrid.tsx
VacationPeriodPlanner.tsx
VacationManagerSelector.tsx
VacationReviewPanel.tsx
VacationRulesCard.tsx
VacationRecentRequestsPanel.tsx opcional
```

Requisitos:

- sidebar persistente;
- header atual;
- grid 12 colunas;
- hero institucional;
- seletor de período em destaque;
- manager e próximos passos próximos ao contexto;
- painel de revisão com CTA;
- estados de loading/erro/sucesso.

### Critério de aceite

- Em desktop, a tela parece um painel de planejamento, não um formulário centralizado.

---

## História 04.02 — Revisão antes do envio

**Objetivo:** reduzir erro de solicitação.

### Tasks

1. Mostrar resumo:

- início;
- fim;
- quantidade de dias corridos;
- manager selecionado;
- status esperado: pendente de aprovação.

2. Mostrar aviso:

```text
Após o envio, o período será registrado para análise do manager selecionado.
```

3. Desabilitar CTA quando inválido.

### Critério de aceite

- Usuário consegue revisar tudo antes de enviar.

---

# ÉPICO 05 — Implementação mobile

## História 05.01 — Criar assistente mobile

**Objetivo:** entregar experiência própria para toque.

### Tasks

Criar componentes:

```text
MobileVacationHeader.tsx
MobileVacationStepper.tsx
MobileDateStep.tsx
MobileManagerStep.tsx
MobileReviewStep.tsx
MobileStickyActionBar.tsx
```

Requisitos:

- fluxo por etapas;
- etapa de período;
- etapa de manager;
- etapa de revisão;
- CTA fixo no rodapé;
- navegação por chips/stepper;
- sem sidebar persistente;
- bottom sheet ou diálogo para listas longas, se componentes existirem.

### Critério de aceite

- Mobile não é o desktop comprimido.
- Usuário consegue concluir a solicitação com uma mão.

---

## História 05.02 — Estados e feedback mobile

**Objetivo:** tornar a experiência clara em telas pequenas.

### Tasks

1. Mostrar progresso da solicitação.
2. Mostrar erro no card da etapa correspondente.
3. Mostrar sucesso em tela dedicada ou card final.
4. Permitir nova solicitação após sucesso.
5. Garantir safe area no rodapé.

### Critério de aceite

- Não há overflow horizontal.
- Botões têm alvo mínimo de 44px.
- Estado de erro não depende só de toast.

---

# ÉPICO 06 — Integração e limpeza

## História 06.01 — Integrar rota

**Objetivo:** manter `/solicitar-ferias` funcionando.

### Tasks

1. Atualizar `src/pages/RequestVacation.tsx`:

```tsx
import { VacationRequestShell } from '@/features/vacation-request/components/VacationRequestShell';

export default function RequestVacation() {
  return <VacationRequestShell />;
}
```

2. Manter lazy import no `App.tsx` salvo necessidade real.
3. Não alterar `APP_PATHS.solicitarFerias`.

### Critério de aceite

- Rota abre pelo menu e diretamente pela URL.

---

## História 06.02 — Remover legado

**Objetivo:** deixar apenas a nova implementação.

### Tasks

1. Remover layout antigo da página.
2. Remover imports mortos.
3. Remover estilos/classes não usadas.
4. Garantir que serviços compartilhados não foram removidos.
5. Rodar lint.

### Critério de aceite

- Não há duplicidade entre tela antiga e nova.

---

# ÉPICO 07 — Validação final

## História 07.01 — Testes e build

### Tasks

Executar:

```bash
npm run lint
npm run build
npm run test
```

Se existir ambiente e2e configurado:

```bash
npm run test:e2e
```

### Critério de aceite

- Comandos passam ou falhas pré-existentes são documentadas.

---

## História 07.02 — Checklist final

Preencher:

```text
- Desktop validado:
- Mobile validado:
- Contratos preservados:
- Acessibilidade básica:
- Legado removido:
- Build/lint/test:
- Pendências:
```
