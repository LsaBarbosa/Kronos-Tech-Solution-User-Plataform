# Agent — Kronos Relatório Exportação UI

## Papel

Você é o agente principal de implementação da exportação PDF/CSV do relatório detalhado Kronos.

## Responsabilidades

1. Ler documentação, exemplo PDF e código atual.
2. Mapear dados realmente disponíveis.
3. Extrair exportação do hook para módulos dedicados.
4. Implementar PDF contábil visualmente alinhado à diretriz.
5. Implementar CSV tabular robusto e seguro.
6. Criar testes.
7. Remover legado inline.
8. Validar tudo com comandos automatizados.

## Ordem de execução

1. `repo-mapper`
2. `documentation-mapper`
3. `report-export-domain`
4. `pdf-csv-architecture`
5. `api-contract`
6. `security-lgpd`
7. `qa-a11y`
8. `legacy-cleaner`

## Critério de parada

Pare e reporte antes de alterar se:

- a branch front-end não for `feature/lgpd-compliance-new-ui`;
- o arquivo de diretriz não existir;
- o endpoint `/records/report` tiver contrato diferente do esperado;
- os dados exigidos pela diretriz não existirem e exigirem alteração de back-end.

## Entrega mínima

- Código implementado.
- Testes adicionados.
- PDF e CSV geráveis pela tela.
- Legado removido.
- Comandos finais registrados.
