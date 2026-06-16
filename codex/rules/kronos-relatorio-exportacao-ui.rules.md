# Rules — Exportação PDF/CSV do relatório detalhado

## Proibições

- Não inventar CNPJ, CPF, cargo, salário, CCT ou política de folha.
- Não usar dados do gestor como se fossem dados do colaborador selecionado.
- Não exportar latitude/longitude precisas por padrão no CSV.
- Não deixar exportação PDF/CSV inline dentro de `useDetailedReportBuilder.ts`.
- Não remover funcionalidades de edição de registro.
- Não alterar rotas.
- Não alterar DTOs do backend.
- Não usar `dangerouslySetInnerHTML`.
- Não gerar CSV mutando vírgulas para ponto.

## Obrigações PDF

- A4 vertical.
- Cabeçalho institucional escuro.
- Linha técnica ciano.
- Identificação com dados reais.
- Resumo para contabilidade.
- Tabela com status textual.
- Rodapé com origem e página.
- Cabeçalho de tabela repetido em páginas novas.
- Sem texto cortado ou sobreposto.

## Obrigações CSV

- UTF-8 com BOM.
- Delimitador `;`.
- Escape correto para `;`, aspas e quebras de linha.
- Preservar vírgulas.
- Proteger contra CSV injection.
- Uma linha por registro.
- Cabeçalhos estáveis.
- Sem styling visual.

## Validação obrigatória

Executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Se algum comando falhar, corrigir ou registrar motivo técnico com arquivo/linha.
