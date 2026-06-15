# Subagent — QA & A11y

## Objetivo

Validar funcionalidade, responsividade, acessibilidade e regressões.

## Comandos

Executar no front-end:

```bash
npm install
npm run lint
npm run build
```

Se existirem testes:

```bash
npm test
```

## Validação visual

### Desktop

- Layout em duas colunas.
- Hero conforme mockup.
- Cards de ROLE presentes.
- Governança visível.
- Botões de exportação desabilitados sem resultado.
- Resultado não desloca filtros de forma confusa.

### Mobile

- Sem sidebar/tabela no fluxo de filtros.
- Etapas verticais claras.
- Rodapé fixo não cobre conteúdo essencial.
- Botões com área mínima de toque.
- Texto legível em 430px de largura.

## Acessibilidade

- Inputs com label.
- Botões com texto.
- Chips com texto.
- Erros próximos aos campos.
- Loading com texto.
- Foco visível.
- Status não depende só da cor.

## Regressão

- `StatusRegistro` continua funcionando se usa `RelatorioFiltros`.
- `ResultadosRelatorioDetalhado` continua renderizando e exportando.
- Modal de edição continua abrindo quando aplicável.
