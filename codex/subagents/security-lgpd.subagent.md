# Subagent — security-lgpd

## Objetivo
Evitar vazamento e manipulação insegura de dados nos arquivos exportados.

## PDF

- Não inserir salário.
- Não inserir CPF completo.
- Não inserir coordenadas precisas.
- Não sugerir automaticamente que saldo positivo é hora extra.
- Não expor dados de terceiros se não vierem do relatório.

## CSV

- Proteger contra CSV injection.
- Não exportar latitude/longitude por padrão.
- Não alterar conteúdo legítimo, como vírgulas em nomes.
- Usar UTF-8 BOM para compatibilidade com Excel.
- Garantir `URL.revokeObjectURL` via `downloadTextFile`.

## Testar

- célula `=HYPERLINK(...)` deve virar `'=HYPERLINK(...)`;
- célula `+SUM(...)` deve ser protegida;
- célula com vírgula deve permanecer com vírgula.
