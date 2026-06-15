# Subagent — QA & A11y

## Objetivo

Validar qualidade visual, responsividade, acessibilidade e segurança de interação.

## Checklist

- foco visível;
- botões com labels;
- prioridade textual;
- contraste nos chips amarelo/vermelho;
- confirmação destrutiva por teclado;
- loading acessível;
- estado vazio;
- erro claro;
- mobile com toque mínimo 44px;
- desktop com ordem lógica de leitura.

## Testes manuais

- `PARTNER`: listar, abrir detalhe, paginar, não ver ações admin.
- `MANAGER`: listar, criar aviso, abrir detalhe, deletar com confirmação.
- `CTO`: validar como regra do produto. Se front permitir e back não permitir, documentar divergência.
- Filtro por prioridade.
- Busca por título e conteúdo.
- Estado sem resultado.
- Estado sem avisos.
