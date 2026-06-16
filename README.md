# Kronos Codex CLI — Refatoração de exportação do relatório detalhado

## Objetivo

Refatorar a exportação gerada na rota `/relatorio-detalhado`, criando duas experiências distintas:

- **PDF**: documento A4 orientado a contabilidade, fechamento de folha, conferência humana, impressão e arquivamento.
- **CSV**: arquivo tabular orientado a importação, planilha, conciliação e automação, sem lógica visual de PDF.

A implementação deve ocorrer no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, preservando os contratos atuais com o back-end `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.

## Regras centrais

1. Não inventar campos que o endpoint `/records/report` não fornece.
2. O PDF de exemplo é referência visual, não contrato de dados.
3. PDF e CSV devem ter propósitos diferentes.
4. O PDF deve ser legível, paginado e seguro para impressão.
5. O CSV deve ser estável, sem dados mascarados inventados, sem mutação indevida de conteúdo e protegido contra CSV injection.
6. Remover o legado de exportação inline após a nova implementação.
7. Criar ou atualizar testes automatizados.

## Arquivos locais de referência

```text
references/docs/kronos_relatorio_detalhado_pdf_diretriz_visual.md
references/pdf-example/kronos_relatorio_detalhado_pdf_estilizacao.pdf
references/pdf-renders/page-1.png
references/pdf-renders/page-2.png
```

## Resultado esperado

Ao final, o Codex deve entregar:

- exportação PDF refatorada;
- exportação CSV refatorada;
- helpers testáveis extraídos do hook;
- validação com `lint`, `tsc`, `build` e `vitest`;
- remoção do código legado inline;
- registro claro das alterações no output do Codex.
