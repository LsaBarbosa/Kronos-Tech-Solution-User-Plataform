# Plano de ação — Kronos `/status-do-registro`

## 0. Premissas

- Não alterar contrato HTTP.
- Não alterar back-end.
- Refatorar apenas o front-end da rota `/status-do-registro`.
- Preservar a branch `feature/lgpd-compliance-new-ui`.
- Usar a diretriz visual e os mockups incluídos em `references/`.
- Ao final, remover a UI legada da própria tela, mantendo somente a nova implementação.

---

## 1. Mapeamento inicial

### Task 1.1 — Confirmar rota e proteção

Ler:

```text
src/config/app-routes.ts
src/App.tsx
```

Validar:

- `APP_PATHS.statusDoRegistro === "/status-do-registro"`.
- A rota renderiza `StatusRegistro`.
- A rota é protegida por role gerencial via `renderProtectedRoleRoute`.

### Task 1.2 — Identificar tela legada

Ler:

```text
src/pages/StatusRegistro.tsx
src/pages/RelatorioFiltros.tsx
src/components/ResultadosRelatorioDetalhado.tsx
src/utils/report-utils.tsx
```

Mapear:

- estados de filtro;
- seleção de funcionário;
- seleção de datas;
- status atual;
- lista de resultados;
- registro selecionado;
- status novo;
- loading de busca;
- loading de salvar;
- loading de ativar/inativar.

### Task 1.3 — Identificar services existentes

Ler:

```text
src/service/records.service.ts
src/service/employee.service.ts
src/config/api-routes.ts
```

Validar o uso de:

```ts
fetchDetailedReport(...)
updateRecordStatus(employeeId, timeRecordId, { statusRecord })
toggleRecordActivate(employeeId, timeRecordId)
fetchReportEmployees(...)
```

---

## 2. Contrato e regra de negócio

### Task 2.1 — Confirmar contratos no back-end

Ler:

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/UpdateTimeRecordStatusRequest.java
src/main/java/com/kts/kronos/domain/model/enuns/StatusRecord.java
```

Preservar:

```http
POST /records/report
PUT /records/update/status/{employeeId}/{timeRecordId}
PUT /records/toggle-activate/{employeeId}/{timeRecordId}
```

### Task 2.2 — Restringir status de decisão

A tela pode pesquisar por status existentes, mas a decisão final deve permitir apenas:

```text
ABSENCE  -> FALTA
DAY_OFF  -> FOLGA
TIME_OFF -> ABONO
```

### Task 2.3 — Separar alteração de status e ativação

- `Salvar status` altera `statusRecord`.
- `Inativar/Ativar registro` altera estado ativo/inativo.
- Não misturar as duas ações no mesmo CTA.
- Exigir confirmação antes de cada mutação.

---

## 3. Arquitetura de UI

### Task 3.1 — Criar modelo visual comum

Criar helpers locais ou componentes internos para:

- `StatusRecordShell`;
- `StatusHero`;
- `StatusSearchPanel`;
- `StatusResultsList`;
- `StatusDecisionPanel`;
- `StatusMobileFlow`;
- `StatusDesktopDesk`.

Pode ser tudo no mesmo arquivo inicialmente, desde que legível. Se o arquivo crescer demais, separar em:

```text
src/components/status-registro/*
```

### Task 3.2 — Desktop

Implementar desktop como mesa de correção:

- sidebar persistente;
- header/breadcrumb;
- hero com mensagem institucional;
- cards `CREATED`, `DAY_OFF`, `ABSENCE`, `TIME_OFF`;
- card de busca à esquerda;
- lista de resultados no centro/esquerda;
- painel de decisão à direita;
- botões separados:
  - `Inativar registro`;
  - `Salvar status`.

### Task 3.3 — Mobile

Implementar mobile como fluxo sequencial:

- topo compacto;
- sem sidebar;
- etapa 1: filtros;
- etapa 2: registros encontrados;
- etapa 3: decisão;
- bottom bar fixo com registro selecionado e CTAs;
- sem tabela;
- botões com área mínima de toque de 44px.

---

## 4. Estados e validações

### Task 4.1 — Busca

Estados obrigatórios:

- sem status no filtro;
- sem datas;
- buscando;
- sem registros;
- registros encontrados;
- erro de busca.

### Task 4.2 — Seleção

Estados obrigatórios:

- nenhum registro selecionado;
- registro selecionado com borda azul;
- painel de decisão preenchido;
- status atual visível;
- data do registro visível.

### Task 4.3 — Decisão

Estados obrigatórios:

- sem novo status: `Salvar status` desabilitado;
- status novo igual ao atual: avisar ou desabilitar;
- ação sensível: exigir confirmação;
- saving: loading localizado;
- sucesso: toast e refresh de dados;
- erro: mensagem vermelha clara.

---

## 5. Legado

### Task 5.1 — Remover dependência visual de relatório genérico

A tela atual usa `RelatorioFiltros` e `ResultadosRelatorioDetalhado`. A nova experiência pode reaproveitar lógica, tipos e services, mas não deve parecer relatório detalhado.

Remover da tela final:

- instruções antigas extensas;
- modal genérico de edição;
- callbacks `onDownloadPDF`/`onDownloadCSV` com `throw new Error`;
- ordem antiga “resultados em cima e filtros embaixo”;
- layout animado genérico que prejudique a nova identidade.

### Task 5.2 — Limpar imports

Remover:

- imports não usados;
- componentes antigos não utilizados;
- código morto;
- handlers duplicados.

---

## 6. Testes e validação

Executar:

```bash
npm run lint
npm run build
```

Se houver suíte configurada:

```bash
npm test
```

Validar manualmente:

- busca com status e datas;
- seleção de registro;
- alteração para `ABSENCE`;
- alteração para `DAY_OFF`;
- alteração para `TIME_OFF`;
- ativação/inativação;
- confirmação antes de mutação;
- responsivo mobile;
- permissões gerenciais;
- acessibilidade de botões.

---

## 7. Critério de pronto

A tarefa só está pronta quando:

- `/status-do-registro` renderiza a nova identidade visual;
- desktop e mobile são experiências distintas;
- contratos HTTP seguem intactos;
- legado visual foi removido;
- build passa;
- não há `throw new Error("Function not implemented")` na tela;
- o usuário entende claramente o impacto trabalhista antes de confirmar.
