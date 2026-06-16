# Prompt para Codex CLI — Refatorar PDF e CSV do relatório detalhado Kronos

Você é o agente de implementação do Kronos. Execute esta tarefa no repositório front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.

## 1. Contexto obrigatório

Observe também, apenas para leitura e validação de contrato:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Documentação: `kronos-business`, branch `main`.

A rota alvo é:

```text
/relatorio-detalhado
```

O elemento alvo é a exportação gerada a partir do relatório detalhado:

- PDF;
- CSV.

## 2. Objetivo

Refatorar a exportação do relatório detalhado para que PDF e CSV sejam experiências diferentes, adequadas ao tipo de arquivo:

- **PDF**: documento humano, A4 vertical, orientado a contabilidade, folha, conferência e arquivamento.
- **CSV**: arquivo tabular, limpo, seguro e orientado a planilha/importação.

Não implemente apenas dois formatos com os mesmos dados jogados em layouts diferentes. Cada formato tem finalidade própria.

## 3. Arquivos que você deve ler primeiro

### Front-end

```text
package.json
src/pages/RelatorioDetalhado.tsx
src/hooks/useDetailedReportBuilder.ts
src/hooks/useReportResponsiveMode.ts
src/components/relatorio-detalhado/index.ts
src/components/relatorio-detalhado/**/*
src/utils/report-export.ts
src/utils/report-utils.tsx
src/service/records.service.ts
src/types/user.ts
src/config/app-routes.ts
src/App.tsx
```

### Back-end

```text
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/ListReportRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TimeRecordResponse.java
```

### Documentação

```text
kronos-business/04-mapa-modulos-telas.md
kronos-business/**/*relatorio*.*
kronos-business/**/*ponto*.*
```

### Referências visuais deste pacote

```text
references/docs/kronos_relatorio_detalhado_pdf_diretriz_visual.md
references/pdf-example/kronos_relatorio_detalhado_pdf_estilizacao.pdf
references/pdf-renders/page-1.png
references/pdf-renders/page-2.png
```

## 4. Condições de segurança

Antes de alterar, confirme:

```bash
git branch --show-current
```

A branch deve ser:

```text
feature/lgpd-compliance-new-ui
```

Se não estiver nessa branch, pare e avise.

## 5. Regras de dados

Não invente dados.

O PDF de exemplo mostra campos como CNPJ, CPF e cargo. Esses campos só podem aparecer se estiverem disponíveis de forma correta.

A interface `DetailedReportItem` fornece principalmente:

- empresa;
- colaborador;
- employeeId;
- timeRecordId;
- data/hora de início;
- data/hora de fim;
- duração;
- saldo;
- status;
- ativo;
- editado;
- documento vinculado;
- indícios de geolocalização.

Se CPF/cargo forem usados, só use quando o relatório for do próprio usuário autenticado e os dados vierem de `useAuth().user.profile`. Para relatórios de colaboradores selecionados por gestor/CTO, não usar CPF/cargo do gestor como se fossem do colaborador.

Para dados indisponíveis:

- omita o campo; ou
- exiba `Não disponível no relatório atual`.

## 6. Implementação esperada

### 6.1 Criar módulo de exportação

Crie uma estrutura semelhante a:

```text
src/features/detailed-report-export/
├── detailed-report-export.types.ts
├── detailed-report-export.helpers.ts
├── detailed-report-pdf.exporter.ts
├── detailed-report-csv.exporter.ts
└── __tests__/
    ├── detailed-report-export.helpers.test.ts
    └── detailed-report-csv.exporter.test.ts
```

Pode ajustar o nome da pasta se o padrão local do projeto sugerir outro, mas mantenha a lógica fora do hook.

### 6.2 Refatorar o hook

No arquivo:

```text
src/hooks/useDetailedReportBuilder.ts
```

Substitua a lógica inline de PDF/CSV por chamadas para o novo módulo.

O hook deve continuar expondo:

```ts
handleDownloadPDF
handleDownloadCSV
```

Não quebre `DetailedReportDesktop` e `DetailedReportMobile`.

### 6.3 PDF

Implemente PDF com:

- `jsPDF`;
- `jspdf-autotable`;
- A4 vertical;
- cabeçalho escuro Kronos;
- linha ciano técnica;
- bloco de identificação;
- resumo para contabilidade;
- alerta interpretativo de fechamento;
- tabela paginada;
- quadro de conciliação;
- observações de fechamento;
- campos de conferência;
- rodapé com número da página.

Use a diretriz e o PDF de exemplo como referência visual, mas não copie dados falsos.

### 6.4 CSV

Corrija a função de CSV atual, especialmente:

- não substituir vírgulas por ponto;
- usar `;` como separador;
- preservar BOM UTF-8;
- escapar `;`, aspas e quebras de linha;
- proteger contra CSV injection.

Crie CSV com colunas estáveis, uma linha por registro, por exemplo:

```text
competencia
periodo_inicio
periodo_fim
empresa
colaborador
employee_id
time_record_id
data_inicio
dia_semana
hora_inicio
data_fim
hora_fim
duracao_hhmm
saldo_hhmm
status_codigo
status_label
tipo_evento
ativo
editado
documento_id
documento_presente
geolocalizacao_coletada
```

Não exporte latitude/longitude precisas por padrão.

## 7. Testes obrigatórios

Crie testes para:

- parsing de hora positiva;
- parsing de hora negativa;
- soma de saldo;
- separação de horas positivas e negativas;
- exclusão de `PENDING` e `IMPLICIT_BREAK` do total trabalhado;
- contagem de abonos, férias, folgas, faltas e pendências;
- CSV preservando vírgulas;
- CSV escapando `;`;
- CSV escapando aspas;
- CSV protegendo fórmula iniciada por `=`, `+`, `-`, `@`;
- CSV com BOM UTF-8;
- colunas esperadas.

## 8. Remover legado

Depois de implementar, remova de `useDetailedReportBuilder.ts`:

- montagem direta de PDF;
- montagem direta de CSV;
- helpers locais que agora pertencem ao módulo de exportação;
- imports não usados.

## 9. Validação final

Execute:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Se possível, também faça validação manual:

1. Abrir `/relatorio-detalhado` desktop.
2. Gerar relatório.
3. Baixar PDF.
4. Abrir PDF e verificar páginas/tabela/rodapé.
5. Baixar CSV.
6. Abrir CSV em planilha.
7. Repetir em viewport mobile.

## 10. Saída esperada da resposta do Codex

Ao final, informe:

- arquivos alterados;
- arquivos criados;
- arquivos removidos;
- testes criados;
- comandos executados e status;
- itens não implementados e motivo, se houver.
