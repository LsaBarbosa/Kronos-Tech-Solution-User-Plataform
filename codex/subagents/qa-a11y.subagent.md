# Subagent — QA & A11y

## Objetivo

Validar build, lint, responsividade, acessibilidade e fluxos funcionais.

## Testes mínimos

- `npm run lint`
- `npm run build`
- abrir `/aprovacoes-abono` como `MANAGER`;
- filtrar por colaborador;
- alternar `PENDING`, `APPROVED`, `REJECTED`;
- selecionar solicitação;
- baixar anexo quando houver;
- aprovar com confirmação;
- rejeitar com confirmação;
- validar estado vazio;
- validar mobile sem tabela.

## Acessibilidade

- texto nos botões;
- `aria-label` em ícones isolados;
- contraste dos chips;
- navegação por teclado;
- foco visível.
