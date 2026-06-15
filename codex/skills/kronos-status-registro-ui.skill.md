# Skill — Kronos Status Registro UI

## Missão

Refatorar a rota `/status-do-registro` para uma experiência de **Time Record Status Control**, mantendo contratos e regras existentes.

## Contexto funcional

A tela permite ao gestor:

1. Filtrar registros por colaborador, datas, status e ativo/inativo.
2. Buscar registros em `/records/report`.
3. Selecionar um registro.
4. Alterar o status para `ABSENCE`, `DAY_OFF` ou `TIME_OFF`.
5. Ativar ou inativar o registro.
6. Entender o impacto trabalhista antes da confirmação.

## Arquivos que devem ser lidos

### Front-end

```text
src/pages/StatusRegistro.tsx
src/pages/RelatorioFiltros.tsx
src/components/ResultadosRelatorioDetalhado.tsx
src/service/records.service.ts
src/utils/report-utils.tsx
src/config/app-routes.ts
src/App.tsx
src/context/AuthContext.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/*
```

### Back-end

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/UpdateTimeRecordStatusRequest.java
src/main/java/com/kts/kronos/domain/model/enuns/StatusRecord.java
```

### Referências do pacote

```text
references/docs/kronos_status_registro_diretriz_visual.md
references/mockups/kronos_status_registro_desktop.png
references/mockups/kronos_status_registro_mobile.png
```

## Contratos obrigatórios

```http
POST /records/report?employeeId=<uuid opcional>
PUT /records/update/status/{employeeId}/{timeRecordId}
PUT /records/toggle-activate/{employeeId}/{timeRecordId}
```

## Status permitidos na decisão

```text
ABSENCE  -> Falta
DAY_OFF  -> Folga
TIME_OFF -> Abono
```

Não adicione novos valores ao enum do back-end.

## UX desktop

- Mesa de correção formal.
- Filtros à esquerda.
- Resultados no centro/esquerda.
- Painel de decisão à direita.
- Hero com contexto de ação auditável.
- Confirmação antes de salvar ou ativar/inativar.

## UX mobile

- Fluxo sequencial.
- Sem tabela.
- Etapas numeradas.
- Cards compactos de registros.
- Bottom bar fixa com resumo da decisão.

## Guardrails

- Não alterar back-end.
- Não trocar a rota.
- Não usar modal genérico antigo se o painel de decisão resolver melhor.
- Não deixar callbacks não implementados.
- Não permitir ação sensível sem confirmação.
- Não depender apenas de cor para status.
