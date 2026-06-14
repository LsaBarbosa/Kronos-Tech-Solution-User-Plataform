# Prompt para Codex CLI — Kronos `/solicitar-abono`

Você é o agente de implementação e revisão da refatoração da rota `/solicitar-abono` da plataforma Kronos.

## Contexto

A tela atual de solicitação de abono/esquecimento de ponto é legado visual. O objetivo é inovar a identidade visual e transformar a experiência em um fluxo moderno, seguro e claro, mantendo o contrato HTTP existente.

A aplicação é uma plataforma de ponto, jornada, documentos, LGPD, aprovação gerencial e gestão de colaboradores.

## Repositórios e branches

Antes de implementar, valide os repositórios:

```bash
cd Kronos-Tech-Solutions-KTS
git checkout PROD_HOSTINGER_V2

cd ../Kronos-Tech-Solution-User-Plataform
git checkout feature/lgpd-compliance-new-ui

cd ../kronos-business
git checkout main
```

Não implemente antes de confirmar as branches.

## Arquivos que você deve ler primeiro

### Back-end — fonte do contrato

Leia:

```text
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/RequestTimeOffRequest.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/domain/model/enuns/RequestType.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/constants/ApiPaths.java
Kronos-Tech-Solutions-KTS/src/main/java/com/kts/kronos/application/service/TimeRecordService.java
```

Confirme:

- endpoint: `POST /records/time-off/request`;
- consumo: `multipart/form-data`;
- part JSON: `request`;
- part arquivo: `document`, opcional;
- autorização: qualquer empregado autenticado;
- aprovação/rejeição: fluxo gerencial separado;
- DTO:
  - `startDate`
  - `endDate`
  - `startHour`
  - `endHour`
  - `managerId`
  - `type`
- enum:
  - `TIME_OFF_REQUEST`
  - `FORGOTTEN_REGISTRATION`.

### Front-end — legado a refatorar

Leia:

```text
Kronos-Tech-Solution-User-Plataform/src/App.tsx
Kronos-Tech-Solution-User-Plataform/src/config/app-routes.ts
Kronos-Tech-Solution-User-Plataform/src/pages/RequestManualRegistration.tsx
Kronos-Tech-Solution-User-Plataform/src/hooks/useManualRegister.ts
Kronos-Tech-Solution-User-Plataform/src/service/records.service.ts
Kronos-Tech-Solution-User-Plataform/src/types/vacation.ts
Kronos-Tech-Solution-User-Plataform/src/types/recordApproval.ts
Kronos-Tech-Solution-User-Plataform/src/types/document.ts
Kronos-Tech-Solution-User-Plataform/src/components/PageShell.tsx
Kronos-Tech-Solution-User-Plataform/src/components/Header.tsx
Kronos-Tech-Solution-User-Plataform/src/components/Sidebar.tsx
Kronos-Tech-Solution-User-Plataform/package.json
```

Confirme:

- `/solicitar-abono` está roteado para `RequestManualRegistration`;
- o serviço `requestTimeOff` usa `FormData`;
- o hook envia `type` para o backend;
- a tela atual contém formulário visual legado;
- upload já possui limites e tipos permitidos.

### Documentação — fonte de regras

Leia no `kronos-business`:

```text
04-mapa-modulos-telas.md
05-entradas-saidas-fluxos.md
08-rotas-guards-permissoes.md
03-atores-permissoes.md
15-testes.md
```

Use a documentação para confirmar:

- `/solicitar-abono` é rota autenticada;
- a tela representa solicitação de abono/esquecimento;
- `/aprovacoes-abono` é gestão gerencial;
- entrada do fluxo é Blob JSON `request` + arquivo opcional;
- saída é `TimeOffCreatedResponse`.

## Arquivos visuais

Procure no workspace:

```text
kronos_solicitar_abono_desktop.png
kronos_solicitar_abono_mobile.png
kronos_solicitar_abono_diretriz_visual.md
```

### Atenção

Se `kronos_solicitar_abono_mobile.png` tiver textos de férias, use apenas a estrutura visual de navegação mobile. A tela final deve falar de **abono/esquecimento de ponto**, nunca de férias.

Se `kronos_solicitar_abono_diretriz_visual.md` não existir e houver apenas uma diretriz de `/usuario`, use essa diretriz somente como referência de identidade visual geral. Não trate a diretriz de `/usuario` como especificação funcional de abono.

## Implementação esperada

### 1. Criar arquitetura de feature

Preferencialmente:

```text
src/features/time-off-request/
├── components/
│   ├── TimeOffRequestPage.tsx
│   ├── TimeOffDesktopExperience.tsx
│   ├── TimeOffMobileExperience.tsx
│   ├── TimeOffHero.tsx
│   ├── TimeOffTypeSelector.tsx
│   ├── TimeOffDateTimeFields.tsx
│   ├── TimeOffManagerSelector.tsx
│   ├── TimeOffEvidenceUploader.tsx
│   ├── TimeOffApprovalSummary.tsx
│   ├── TimeOffOperationalChecklist.tsx
│   └── TimeOffMobileStepper.tsx
├── hooks/
│   └── useTimeOffRequestViewModel.ts
├── utils/
│   ├── timeOffFormatting.ts
│   └── timeOffValidation.ts
└── index.ts
```

Adapte ao padrão real do projeto se necessário.

### 2. Refatorar a página

`src/pages/RequestManualRegistration.tsx` deve deixar de conter o formulário legado completo.

Opção recomendada:

```tsx
export { TimeOffRequestPage as RequestManualRegistration } from "@/features/time-off-request";
```

Ou manter wrapper mínimo se o roteamento exigir.

### 3. Desktop

A versão desktop deve seguir o mockup de painel:

- sidebar/rail visível;
- header superior com breadcrumb;
- badge `Evidência protegida`;
- hero com título `Formalize uma justificativa de jornada`;
- cards de contexto:
  - `Tipo`
  - `Destino`
  - `Anexo`
- card `Composição da solicitação`;
- card `Resumo para aprovação`;
- checklist operacional;
- CTA `Enviar solicitação`;
- link/botão secundário `Ver política de anexo`.

### 4. Mobile

A versão mobile deve ser fluxo guiado, não desktop reduzido:

- header compacto;
- título `Solicitar abono`;
- subtítulo `Fluxo guiado para aprovação`;
- stepper:
  - Tipo
  - Período
  - Gestor
  - Evidência
  - Revisão
- cards empilhados;
- CTA fixo inferior;
- resumo curto antes do envio;
- interação touch-first.

### 5. Tipos de solicitação

Exibir claramente:

#### Abono de horas

Valor backend:

```ts
TIME_OFF_REQUEST
```

Texto de apoio:

```text
Atestado, folga acordada ou justificativa médica.
```

#### Esquecimento de ponto

Valor backend:

```ts
FORGOTTEN_REGISTRATION
```

Texto de apoio:

```text
Correção quando a marcação não foi registrada.
```

### 6. Validações

Preservar e melhorar feedback:

- data início obrigatória;
- data fim obrigatória;
- hora início obrigatória;
- hora fim obrigatória;
- gestor obrigatório;
- tipo obrigatório;
- data fim não pode ser anterior;
- se mesma data, hora fim precisa ser posterior;
- arquivo precisa respeitar tipo e tamanho permitidos;
- bloqueio de envio duplicado durante loading.

### 7. Upload

Preservar:

- `ALLOWED_ACCEPT_STRING`;
- `MAX_UPLOAD_SIZE_BYTES`;
- `ALLOWED_MIME_TYPES`;
- compressão de imagem se já existir e fizer sentido.

Melhorar:

- mostrar nome do arquivo;
- mostrar tamanho;
- mostrar tipo;
- mostrar status `validado`;
- permitir remover;
- explicar que evidência é protegida.

### 8. Contrato HTTP

Não quebre isto:

```ts
const formData = new FormData();

formData.append(
  "request",
  new Blob([JSON.stringify(payload)], { type: "application/json" })
);

if (document) {
  formData.append("document", document, document.name);
}
```

O payload deve conter:

```ts
{
  startDate,
  endDate,
  startHour,
  endHour,
  managerId,
  type
}
```

Não envie `requestType` ao back-end.

## Limpeza do legado

Após a nova implementação passar no build:

- remova JSX legado de `RequestManualRegistration.tsx`;
- remova imports obsoletos;
- remova comentários antigos;
- remova helpers duplicados se forem substituídos;
- mantenha o hook/serviço se forem reaproveitados;
- não deixe duas implementações visuais concorrentes.

## Testes obrigatórios

Execute:

```bash
npm run lint
npm run build
```

Teste manualmente:

1. Abrir `/solicitar-abono`.
2. Desktop renderiza como painel operacional.
3. Mobile renderiza como fluxo guiado.
4. Enviar `TIME_OFF_REQUEST` sem anexo.
5. Enviar `TIME_OFF_REQUEST` com anexo válido.
6. Enviar `FORGOTTEN_REGISTRATION`.
7. Tentar data final anterior à inicial.
8. Tentar mesmo dia com hora final anterior.
9. Tentar enviar sem gestor.
10. Tentar arquivo inválido.
11. Confirmar que o request continua multipart.
12. Confirmar que a rota `/aprovacoes-abono` não foi alterada.

## Relatório final

Ao terminar, informe:

- arquivos alterados;
- arquivos criados;
- arquivos removidos;
- decisões de UX desktop;
- decisões de UX mobile;
- validações executadas;
- resultado de `npm run lint`;
- resultado de `npm run build`;
- pendências, se houver.
