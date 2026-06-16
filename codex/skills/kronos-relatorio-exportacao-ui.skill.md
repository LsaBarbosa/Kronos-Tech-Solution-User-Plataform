# Skill — Kronos Relatório Detalhado Exportação PDF/CSV

## Missão

Implementar a nova camada de exportação do relatório detalhado de ponto em `/relatorio-detalhado`, criando uma experiência PDF para conferência contábil/folha e uma experiência CSV para integração/tabulação.

## Escopo

Repositórios:

- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`, somente leitura para contrato.
- Documentação: `kronos-business`, branch `main`, somente leitura para regra de negócio.

Arquivos front-end prioritários:

```text
src/pages/RelatorioDetalhado.tsx
src/hooks/useDetailedReportBuilder.ts
src/utils/report-export.ts
src/utils/report-utils.tsx
src/components/relatorio-detalhado/**/*
src/service/records.service.ts
src/types/user.ts
```

## Princípios

1. Não alterar contrato do endpoint `/records/report`.
2. Não criar backend novo.
3. Não inventar CNPJ, CPF, cargo ou dados jurídicos não retornados pelo sistema.
4. PDF é documento humano/contábil.
5. CSV é documento tabular/máquina.
6. Toda regra de cálculo precisa estar em helper testável.
7. `useDetailedReportBuilder.ts` não deve conter layout PDF nem montagem CSV extensa.

## Resultado esperado

- PDF A4 vertical com identidade Kronos, resumo contábil, tabela paginada, observações e rodapé.
- CSV com colunas estáveis, UTF-8 BOM, separador `;`, escape correto e proteção contra CSV injection.
- Testes unitários para helpers e CSV.
- Build/lint/typecheck/test passando.
