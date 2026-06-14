# Plano de ação — Refatoração `/solicitar-abono`

## Fase 0 — Preparação

### Task 0.1 — Validar branches

```bash
cd Kronos-Tech-Solutions-KTS
git fetch --all
git checkout PROD_HOSTINGER_V2
git pull

cd ../Kronos-Tech-Solution-User-Plataform
git fetch --all
git checkout feature/lgpd-compliance-new-ui
git pull

cd ../kronos-business
git fetch --all
git checkout main
git pull
```

**Critério de aceite:** os três repositórios estão nas branches corretas.

### Task 0.2 — Localizar anexos visuais

Procurar no workspace:

```bash
find .. -iname "kronos_solicitar_abono_desktop.png"
find .. -iname "kronos_solicitar_abono_mobile.png"
find .. -iname "kronos_solicitar_abono_diretriz_visual.md"
```

**Critério de aceite:** desktop e mobile foram encontrados. Se a diretriz específica não existir, registrar a ausência e seguir pelos mockups + documentação.

---

## Fase 1 — Observação dos contratos

### Task 1.1 — Ler controller de ponto

Arquivo:

```text
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
```

Validar:

- `@PostMapping(path = TIME_OFF_REQUEST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)`
- `@RequestPart("request")`
- `@RequestPart(value = "document", required = false)`
- `@PreAuthorize(ANY_EMPLOYEE)`

### Task 1.2 — Ler DTO de solicitação

Arquivo:

```text
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/RequestTimeOffRequest.java
```

Validar campos:

- `startDate`
- `endDate`
- `startHour`
- `endHour`
- `managerId`
- `type`

### Task 1.3 — Ler enum de tipo

Arquivo:

```text
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/domain/model/enuns/RequestType.java
```

Validar valores:

- `TIME_OFF_REQUEST`
- `FORGOTTEN_REGISTRATION`

---

## Fase 2 — Observação do front-end legado

### Task 2.1 — Ler roteamento

Arquivos:

```text
src/App.tsx
src/config/app-routes.ts
```

Validar:

- `/solicitar-abono`
- `RequestManualRegistration`
- ausência de restrição explícita de papel na rota de solicitação.

### Task 2.2 — Ler tela atual

Arquivo:

```text
src/pages/RequestManualRegistration.tsx
```

Identificar:

- campos;
- validações;
- upload;
- seleção de tipo;
- seleção de gestor;
- imports;
- código visual legado.

### Task 2.3 — Ler hook atual

Arquivo:

```text
src/hooks/useManualRegister.ts
```

Validar:

- estado do formulário;
- default;
- validações;
- transformação `requestType` -> `type`;
- envio;
- toasts;
- reset.

### Task 2.4 — Ler serviço atual

Arquivo:

```text
src/service/records.service.ts
```

Validar:

- `requestTimeOff`;
- criação de `FormData`;
- `request` como Blob JSON;
- `document` opcional;
- endpoint `/records/time-off/request`.

---

## Fase 3 — Design de arquitetura da nova tela

### Task 3.1 — Definir feature folder

Criar, se fizer sentido:

```text
src/features/time-off-request/
```

### Task 3.2 — Separar experiências

Criar componentes distintos:

- `TimeOffDesktopExperience`
- `TimeOffMobileExperience`

Critério: o mobile e o desktop não podem compartilhar apenas o mesmo layout redimensionado. Eles podem compartilhar subcomponentes pequenos e lógica, mas a composição de navegação deve ser diferente.

### Task 3.3 — Criar view model

Criar ou evoluir:

```text
useTimeOffRequestViewModel.ts
```

Responsabilidades:

- adaptar `useRequestManualRegistration`;
- calcular resumo;
- expor status de checklist;
- expor handlers de UI;
- não alterar contrato HTTP.

---

## Fase 4 — Implementação desktop

### Task 4.1 — Hero e header operacional

Implementar:

- breadcrumb `Kronos / Jornada / Solicitar abono`;
- chip `Evidência protegida`;
- usuário/role se o contexto disponibilizar;
- título `Formalize uma justificativa de jornada`;
- subtítulo explicando período, horário, gestor e evidência.

### Task 4.2 — Composição da solicitação

Implementar card com:

- seletor de tipo;
- datas;
- horários;
- gestor;
- evidência;
- dica de preenchimento.

### Task 4.3 — Resumo para aprovação

Implementar card lateral com:

- período solicitado;
- duração aproximada;
- status pendente;
- campos essenciais OK;
- checklist operacional;
- fluxo `Solicitação criada → gestor analisa → aprova ou rejeita`;
- CTA.

---

## Fase 5 — Implementação mobile

### Task 5.1 — Header mobile

Implementar:

- logo/monograma Kronos;
- título `Solicitar abono`;
- subtítulo curto;
- badge `Seguro`.

### Task 5.2 — Fluxo guiado

Implementar etapas:

1. Tipo
2. Período
3. Gestor
4. Evidência
5. Revisão

### Task 5.3 — Bottom action

Implementar barra fixa inferior:

- resumo curto;
- botão `Enviar solicitação`;
- estado disabled conforme validação;
- loading durante envio.

---

## Fase 6 — Upload e segurança

### Task 6.1 — Preservar política atual de arquivo

Reusar:

- `ALLOWED_ACCEPT_STRING`
- `MAX_UPLOAD_SIZE_BYTES`
- `ALLOWED_MIME_TYPES`

### Task 6.2 — Melhorar feedback de upload

Exibir:

- nome;
- extensão/tipo;
- tamanho;
- status validado;
- botão remover;
- erro contextual.

Não exibir caminho local.

---

## Fase 7 — Limpeza do legado

### Task 7.1 — Substituir página antiga

`RequestManualRegistration.tsx` deve ficar como wrapper limpo ou nova página.

### Task 7.2 — Remover imports e comentários obsoletos

Remover:

- imports sem uso;
- componentes antigos não usados;
- comentários de correção que não fazem sentido no novo layout;
- duplicidade visual.

---

## Fase 8 — Validação

### Task 8.1 — Build e lint

Executar:

```bash
npm run lint
npm run build
```

### Task 8.2 — Testes manuais

Testar:

- desktop largo;
- tablet;
- mobile;
- com anexo;
- sem anexo;
- abono;
- esquecimento;
- datas inválidas;
- horários inválidos;
- manager ausente.

### Task 8.3 — Relatório final

Gerar relatório contendo:

- arquivos alterados;
- arquivos removidos;
- decisões tomadas;
- prints ou descrição de validação;
- pendências.
