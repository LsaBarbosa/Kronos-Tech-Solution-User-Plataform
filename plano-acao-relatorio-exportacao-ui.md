# Plano de ação — PDF e CSV do relatório detalhado

## Fase 0 — Preparação e segurança de branch

### Task 0.1 — Confirmar branches e estado do workspace

Executar:

```bash
git -C ../Kronos-Tech-Solution-User-Plataform branch --show-current
git -C ../Kronos-Tech-Solutions-KTS branch --show-current
git -C ../kronos-business branch --show-current
git -C ../Kronos-Tech-Solution-User-Plataform status --short
```

Critério:

- front-end na branch `feature/lgpd-compliance-new-ui`;
- back-end na branch `PROD_HOSTINGER_V2`;
- documentação na branch `main`;
- não sobrescrever alterações manuais sem registrar.

### Task 0.2 — Ler documentos norteadores

Ler obrigatoriamente:

```text
kronos-business/04-mapa-modulos-telas.md
references/docs/kronos_relatorio_detalhado_pdf_diretriz_visual.md
references/pdf-example/kronos_relatorio_detalhado_pdf_estilizacao.pdf
```

Também renderizar o PDF de exemplo localmente, se necessário, para comparar layout:

```bash
python /home/oai/skills/pdfs/scripts/render_pdf.py references/pdf-example/kronos_relatorio_detalhado_pdf_estilizacao.pdf --out_dir /tmp/kronos-pdf-reference --dpi 160
```

## Fase 1 — Mapeamento do código atual

### Task 1.1 — Mapear rota e tela

Ler:

```text
src/pages/RelatorioDetalhado.tsx
src/components/relatorio-detalhado/index.ts
src/components/relatorio-detalhado/**/*
src/hooks/useDetailedReportBuilder.ts
src/hooks/useReportResponsiveMode.ts
```

Confirmar:

- onde ficam os botões de PDF/CSV;
- quais labels aparecem no desktop;
- quais labels aparecem no mobile;
- se ambos chamam `viewModel.handleDownloadPDF` e `viewModel.handleDownloadCSV`.

### Task 1.2 — Mapear dados disponíveis

Ler:

```text
src/utils/report-utils.tsx
src/components/relatorio-detalhado/report-ui.helpers.ts
src/service/records.service.ts
src/types/user.ts
```

Registrar quais campos podem popular o PDF e o CSV sem ficção.

### Task 1.3 — Mapear contratos do back-end

Ler no back-end:

```text
src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/ListReportRequest.java
src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/TimeRecordResponse.java
```

Confirmar:

- `POST /records/report`;
- `employeeId` opcional por query param;
- payload `reference`, `active`, `statuses`, `dates`.

## Fase 2 — Desenho da arquitetura de exportação

### Task 2.1 — Criar módulo dedicado de exportação

Criar uma pasta ou módulo semelhante a:

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

Alternativa aceita:

```text
src/components/relatorio-detalhado/export/
```

Não deixar a lógica de PDF/CSV inline dentro de `useDetailedReportBuilder.ts`.

### Task 2.2 — Definir contrato interno de exportação

Criar tipo interno, por exemplo:

```ts
export interface DetailedReportExportContext {
  reportData: DetailedReportItem[];
  selectedDates: Date[];
  referenceTime: string;
  selectedStatuses: string[];
  reportActive: boolean;
  selectedEmployeeId?: string;
  selectedEmployeeLabel: string;
  generatedBy?: {
    username?: string;
    role?: string;
    ownEmployeeId?: string;
    ownMaskedCpf?: string;
    ownJobPosition?: string;
  };
}
```

Não passar estados visuais da página para o exportador.

## Fase 3 — Implementar PDF contábil

### Task 3.1 — Implementar resumo contábil seguro

Criar helper que calcule:

- total trabalhado;
- saldo do período;
- horas positivas;
- horas negativas;
- total de abonos;
- total de folgas;
- total de férias;
- total de faltas;
- registros pendentes;
- registros inativos;
- registros editados;
- total de registros com documento;
- geolocalização coletada: sim/não/parcial.

Regras:

- ignorar `IMPLICIT_BREAK` no total trabalhado e saldo;
- não somar `PENDING` como duração realizada;
- separar positivo e negativo pelo campo `balance`;
- tratar valores inválidos como `0`, mas registrar helper testável.

### Task 3.2 — Criar layout PDF A4 vertical

Usar `jsPDF` + `jspdf-autotable`, preservando lazy load via `loadPdfLibraries()`.

Estrutura mínima:

1. Cabeçalho institucional escuro `KRONOS - Relatório Detalhado de Ponto`.
2. Linha ciano técnica.
3. Bloco de identificação:
   - empresa;
   - colaborador;
   - período;
   - jornada referência;
   - status filtrados;
   - ativo/inativo;
   - gerado em;
   - gerado por/perfil, se disponível.
4. Bloco `Resumo para contabilidade`.
5. Alerta interpretativo de fechamento.
6. Tabela `Registros detalhados por dia`.
7. Página(s) extra(s) com:
   - quadro de conciliação;
   - eventos relevantes;
   - observações de fechamento;
   - campos de conferência/assinatura simbólicos;
   - rodapé com paginação.

### Task 3.3 — Tabela principal do PDF

Colunas recomendadas, somente com dados disponíveis:

```text
Data | Dia | Entrada | Saída | Horas | Tipo | Status | Impacto
```

Mapeamento:

- Data: `startWork` formatado;
- Dia: dia da semana derivado de `startWork`;
- Entrada: `startHour`;
- Saída: `endHour`, ou `--:--` quando `PENDING`;
- Horas: `hoursWork`, ou `--:--` quando `PENDING`;
- Tipo: derivado de `statusRecord` (`Entrada/Saída/Pausa/Abono/Férias/Folga/Falta`);
- Status: label textual via `getTranslatedStatus`;
- Impacto: `balance`, `documento`, `pendente`, `editado`, ou observação objetiva.

### Task 3.4 — Paginação e impressão

Garantir:

- A4 portrait;
- margens seguras;
- cabeçalho repetido por página;
- rodapé com página N;
- zebra striping leve;
- status textual além de cor;
- sem textos sobrepostos;
- sem quebrar palavras longas em áreas pequenas.

### Task 3.5 — Não usar dados inexistentes

O PDF de exemplo possui CNPJ, CPF e cargo. Esses campos só podem aparecer se vierem de dados reais.

Regra:

- para relatório do próprio usuário, pode usar `user.profile.maskedCpf` e `user.profile.jobPosition` se `employeeId` do registro for igual ao `employeeId` autenticado;
- para relatório de colaborador selecionado por gestor, não usar CPF/cargo do gestor como se fosse do colaborador;
- se o campo não existir, exibir `Não disponível no relatório atual` ou omitir o bloco.

## Fase 4 — Implementar CSV operacional

### Task 4.1 — Refatorar `buildCsvContent`

Arquivo atual:

```text
src/utils/report-export.ts
```

Problema atual a corrigir:

- o `escapeCsvCell` substitui vírgulas por ponto, alterando conteúdo legítimo.

Nova regra:

- delimiter: `;`;
- preservar vírgulas;
- envolver em aspas quando houver `;`, `"`, `\n` ou `\r`;
- duplicar aspas internas;
- manter BOM UTF-8;
- proteger contra CSV injection.

CSV injection:

Se uma célula textual começar com `=`, `+`, `-`, `@`, tab ou carriage return, prefixar com `'`.

### Task 4.2 — CSV com experiência própria

O CSV não deve tentar replicar o PDF.

Ele deve ser tabular, com uma linha por registro e cabeçalhos estáveis, por exemplo:

```text
competencia;periodo_inicio;periodo_fim;empresa;colaborador;employee_id;time_record_id;data_inicio;dia_semana;hora_inicio;data_fim;hora_fim;duracao_hhmm;saldo_hhmm;status_codigo;status_label;tipo_evento;ativo;editado;documento_id;documento_presente;geolocalizacao_coletada
```

Não exportar latitude/longitude precisas por padrão. Exportar apenas `geolocalizacao_coletada` como `sim`, `nao` ou `parcial`.

### Task 4.3 — Adicionar linhas de metadata, se necessário

Se optar por metadata no topo, usar prefixo claro e testável:

```text
# Kronos - Relatorio Detalhado de Ponto
# Gerado em;2026-06-16 16:42
# Jornada referencia;08:00
```

Mas manter compatibilidade com planilhas. Preferencialmente deixar metadata apenas em colunas repetidas por linha.

## Fase 5 — Integrar ao hook e remover legado

### Task 5.1 — Reduzir `useDetailedReportBuilder.ts`

Substituir lógica inline por chamadas:

```ts
await exportDetailedReportPdf(context);
exportDetailedReportCsv(context);
```

O hook deve montar o contexto e tratar toast/erros.

### Task 5.2 — Remover código legado

Remover do hook:

- constantes de cor do PDF;
- `getStatusRGB` local;
- `timeToMinutes` local;
- `minutesToTime` local;
- `parseReportDate` local;
- `autoTable` direto;
- montagem inline de CSV.

## Fase 6 — Testes

### Task 6.1 — Testar helpers de tempo e resumo

Cobrir:

- `08:00` para 480 min;
- `-01:42` negativo;
- valor inválido retorna 0;
- soma de horas trabalhadas ignora `PENDING` e `IMPLICIT_BREAK`;
- saldo positivo e negativo são separados;
- contagem de `TIME_OFF`, `DAY_OFF`, `VACATION`, `ABSENCE`, `PENDING`.

### Task 6.2 — Testar CSV

Cobrir:

- vírgula preservada;
- ponto e vírgula escapado;
- aspas internas duplicadas;
- quebra de linha escapada;
- fórmula iniciando com `=` protegida;
- BOM presente;
- colunas esperadas.

### Task 6.3 — Teste smoke do PDF

Como `jsPDF` em teste pode ser complexo, criar teste de helpers usados no PDF. Se viável, mockar `jsPDF` e `autoTable` para verificar:

- `autoTable` recebe cabeçalhos corretos;
- filename termina com `.pdf`;
- não tenta usar CPF/cargo inexistente;
- adiciona rodapé/paginação.

## Fase 7 — Validação final

Executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Também validar manualmente:

1. `/relatorio-detalhado` desktop.
2. `/relatorio-detalhado` mobile.
3. Gerar relatório com registros normais.
4. Baixar PDF.
5. Abrir PDF e verificar páginas, cabeçalho, tabela e rodapé.
6. Baixar CSV.
7. Abrir CSV no LibreOffice/Excel e confirmar colunas.
8. Confirmar que dados inexistentes não aparecem como falsos.

## Fase 8 — Relatório da execução

O Codex deve informar:

- arquivos criados;
- arquivos alterados;
- legado removido;
- testes criados;
- comandos executados;
- pendências, se houver.
