# Subagent — documentation-mapper

## Objetivo
Extrair regras de negócio da documentação e da diretriz visual.

## Ler

```text
kronos-business/04-mapa-modulos-telas.md
references/docs/kronos_relatorio_detalhado_pdf_diretriz_visual.md
references/pdf-example/kronos_relatorio_detalhado_pdf_estilizacao.pdf
references/pdf-renders/page-1.png
references/pdf-renders/page-2.png
```

## Regras extraídas

- PDF é documento de apuração de ponto para contabilidade e folha.
- PDF precisa separar dado bruto de interpretação contábil.
- PDF não deve afirmar que hora positiva é hora extra.
- Registros pendentes são risco de fechamento.
- Saldos negativos em vermelho; positivos em verde.
- CSV deve ser uma experiência diferente, tabular e operacional.

## Produzir

- Checklist de aderência visual.
- Lista de campos da diretriz que existem no front.
- Lista de campos da diretriz que não podem ser preenchidos sem backend.
