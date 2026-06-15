# Prompt para Codex CLI — Kronos `/status-do-registro`

Você deve atuar no projeto Kronos como agente de implementação e revisão da nova UI/UX da rota `/status-do-registro`.

## 1. Repositórios e branches

Use:

```text
Back-end:
repo: Kronos-Tech-Solutions-KTS
branch: PROD_HOSTINGER_V2

Front-end:
repo: Kronos-Tech-Solution-User-Plataform
branch: feature/lgpd-compliance-new-ui

Documentação:
repo: kronos-business
branch: main
```

## 2. Objetivo

Refatorar a tela `status do registro` atualmente na rota:

```text
/status-do-registro
```

A nova tela deve ser uma **central de correção auditável de registros de ponto**, com duas experiências reais:

- desktop: mesa de correção com busca, resultados e painel de decisão lado a lado;
- mobile: fluxo sequencial com filtros, seleção de registro, decisão e CTA fixo.

Não implemente apenas responsividade por redução de largura. A navegação e a hierarquia precisam mudar por dispositivo.

## 3. Referências obrigatórias

Leia antes de implementar:

```text
references/docs/kronos_status_registro_diretriz_visual.md
references/mockups/kronos_status_registro_desktop.png
references/mockups/kronos_status_registro_mobile.png
```

## 4. Arquivos do front-end que você deve ler

```text
src/App.tsx
src/config/app-routes.ts
src/pages/StatusRegistro.tsx
src/pages/RelatorioFiltros.tsx
src/components/ResultadosRelatorioDetalhado.tsx
src/service/records.service.ts
src/service/employee.service.ts
src/utils/report-utils.tsx
src/context/AuthContext.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/*
```

## 5. Arquivos do back-end que você deve ler

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/ListReportRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/UpdateTimeRecordStatusRequest.java
src/main/java/com/kts/kronos/domain/model/enuns/StatusRecord.java
```

## 6. Arquivos da documentação que você deve ler

```text
kronos-business/04-mapa-modulos-telas.md
```

Se o arquivo não existir com esse nome, procure no repositório de documentação por:

```text
status-do-registro
StatusRegistro
registros de ponto
alterar status
```

## 7. Contratos HTTP que devem ser preservados

Não altere o back-end e não altere os contratos:

```http
POST /records/report?employeeId=<uuid opcional>
Content-Type: application/json

{
  "reference": "08:00",
  "active": true,
  "statuses": ["CREATED"],
  "dates": ["13-06-2026"]
}
```

```http
PUT /records/update/status/{employeeId}/{timeRecordId}
Content-Type: application/json

{
  "statusRecord": "ABSENCE"
}
```

```http
PUT /records/toggle-activate/{employeeId}/{timeRecordId}
```

## 8. Regra crítica da tela

A busca pode usar múltiplos status, mas a alteração manual de status deve permitir somente:

```text
ABSENCE  -> Falta
DAY_OFF  -> Folga
TIME_OFF -> Abono
```

Não permitir salvar sem:

- registro selecionado;
- funcionário/employeeId válido;
- timeRecordId válido;
- novo status válido;
- confirmação do usuário.

## 9. Arquitetura desejada

Use componentes internos ou arquivos separados. Recomendação:

```text
src/pages/StatusRegistro.tsx
src/components/status-registro/StatusRegistroShell.tsx
src/components/status-registro/StatusRegistroDesktop.tsx
src/components/status-registro/StatusRegistroMobile.tsx
src/components/status-registro/StatusSearchPanel.tsx
src/components/status-registro/StatusResultsList.tsx
src/components/status-registro/StatusDecisionPanel.tsx
```

Mantenha a implementação compatível com o padrão existente do projeto. Se o projeto não tiver essa pasta, crie-a apenas se fizer sentido.

## 10. Desktop

Implementar a tela desktop conforme o mockup:

- Sidebar à esquerda.
- Header com breadcrumb.
- Hero institucional com título:
  - `Altere status de ponto com contexto e confirmação`.
- Cards de contexto:
  - `CREATED` origem;
  - `DAY_OFF` folga;
  - `ABSENCE` falta;
  - `TIME_OFF` abono.
- Card `Localizar registro` com filtros:
  - colaborador;
  - status atual;
  - datas;
  - ativo/inativo.
- Botões:
  - `Buscar registros`;
  - `Limpar`.
- Lista `Resultados encontrados` com:
  - data;
  - horários quando houver;
  - status atual;
  - ativo/inativo;
  - ação `Editar` ou seleção direta.
- Painel `Registro selecionado` com:
  - colaborador;
  - data;
  - status atual;
  - informação de marcação ou ausência de marcação;
  - seleção de novo status;
  - aviso de impacto trabalhista;
  - botões separados `Inativar registro` e `Salvar status`.

## 11. Mobile

Implementar a tela mobile conforme o mockup:

- Topo compacto sem sidebar.
- Título `Status do registro`.
- Subtítulo `Correção auditável`.
- Fluxo sequencial:
  1. `Filtros`;
  2. `Registros encontrados`;
  3. `Decisão`.
- Cards de resultado, não tabela.
- Status por chips textuais.
- Rodapé fixo com:
  - registro selecionado;
  - resumo do impacto;
  - botão `Inativar`;
  - botão `Salvar status`.

## 12. Confirmação obrigatória

Antes de salvar status ou ativar/inativar, exibir confirmação com:

- nome do colaborador;
- data do registro;
- status atual;
- novo status, quando aplicável;
- impacto trabalhista;
- texto claro de ação sensível.

Use `Dialog`, `AlertDialog` ou componente equivalente já existente no projeto.

## 13. Estados obrigatórios

Implementar ou preservar:

- sem status no filtro;
- buscando;
- sem registros;
- registro selecionado;
- salvando status;
- ativando/inativando;
- erro;
- sucesso.

## 14. Remoção do legado

Depois de implementar:

- remova o visual antigo baseado em relatório genérico;
- remova modal antigo se substituído por painel de decisão;
- remova callbacks com `throw new Error("Function not implemented")`;
- remova imports não usados;
- mantenha somente a nova implementação.

## 15. Validação

Execute:

```bash
npm run lint
npm run build
```

Se houver testes:

```bash
npm test
```

## 16. Entrega esperada

No final, responda com:

- arquivos alterados;
- comandos executados;
- comportamento validado;
- contrato preservado;
- riscos ou pendências.
