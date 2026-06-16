# Checklist de validação — PDF e CSV `/relatorio-detalhado`

## Branch e escopo

- [ ] Front-end na branch `feature/lgpd-compliance-new-ui`.
- [ ] Back-end consultado na branch `PROD_HOSTINGER_V2`.
- [ ] Documentação consultada na branch `main`.
- [ ] Nenhum contrato de API alterado.
- [ ] Nenhuma rota alterada.

## PDF

- [ ] PDF gerado em A4 vertical.
- [ ] Cabeçalho institucional escuro aplicado.
- [ ] Linha ciano técnica aplicada.
- [ ] Bloco de identificação usa apenas dados reais.
- [ ] CNPJ não é inventado.
- [ ] CPF/cargo não são preenchidos com dados do gestor indevidamente.
- [ ] Resumo para contabilidade existe.
- [ ] Total trabalhado calculado corretamente.
- [ ] Saldo do período calculado corretamente.
- [ ] Horas positivas e negativas aparecem separadas.
- [ ] Abonos/folgas/férias/faltas são contabilizados.
- [ ] Registros pendentes aparecem como risco de fechamento.
- [ ] Status textual aparece além da cor.
- [ ] Tabela tem zebra striping leve.
- [ ] Cabeçalho da tabela repete em nova página.
- [ ] Rodapé contém origem do documento e página.
- [ ] Não há texto sobreposto.
- [ ] Não há texto cortado.
- [ ] PDF abre corretamente no navegador e leitor externo.

## CSV

- [ ] CSV contém BOM UTF-8.
- [ ] CSV usa `;` como delimitador.
- [ ] Vírgulas são preservadas.
- [ ] Aspas são escapadas corretamente.
- [ ] Quebras de linha são tratadas corretamente.
- [ ] Células perigosas para CSV injection são protegidas.
- [ ] Uma linha por registro.
- [ ] Cabeçalhos estáveis.
- [ ] Não exporta latitude/longitude precisas por padrão.
- [ ] `geolocalizacao_coletada` aparece como indicador booleano/textual.
- [ ] CSV abre corretamente no Excel/LibreOffice.

## Código

- [ ] `useDetailedReportBuilder.ts` não possui mais layout PDF inline.
- [ ] `useDetailedReportBuilder.ts` não possui mais montagem CSV inline.
- [ ] Exportadores estão em módulo dedicado.
- [ ] Helpers são puros e testáveis.
- [ ] Imports mortos removidos.
- [ ] Código legado removido.

## Testes

- [ ] Testes de parsing de tempo.
- [ ] Testes de resumo contábil.
- [ ] Testes de CSV escaping.
- [ ] Testes de CSV injection.
- [ ] Testes de colunas CSV.

## Comandos

- [ ] `npm run lint` passou.
- [ ] `npx tsc --noEmit` passou.
- [ ] `npm run build` passou.
- [ ] `npx vitest run` passou.

## Validação manual

- [ ] Desktop: PDF funciona.
- [ ] Desktop: CSV funciona.
- [ ] Mobile: PDF funciona.
- [ ] Mobile: CSV funciona.
- [ ] Sem dados: mostra erro amigável.
- [ ] Com dados: baixa arquivos corretamente.
