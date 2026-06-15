# Rules — Kronos Aprovar Férias UI

## Regras absolutas

1. Não alterar contrato HTTP sem evidência.
2. Não mudar regra de autorização.
3. Não transformar `/ferias` em tela de solicitação.
4. Não usar tabela no mobile.
5. Não esconder decisão sensível sem confirmação.
6. Não exibir botões de aprovação/rejeição para status finalizado.
7. Não depender apenas de cor para status.
8. Não remover tratamento de erro existente sem substituir por equivalente superior.
9. Não deixar legado morto importado.
10. Não commitar segredos, tokens, `.env` ou dados reais.

## Contratos esperados

### Listagem

A tela deve consumir o endpoint existente de listagem de solicitações de férias, filtrando por status, colaborador e paginação conforme o front atual já faz.

### Aprovação

A aprovação deve usar o contrato existente de aprovação de férias, enviando o lote/lista de IDs conforme o DTO atual.

### Rejeição

A rejeição deve usar o contrato existente de rejeição de férias, enviando o lote/lista de IDs conforme o DTO atual.

## Estados obrigatórios

- loading inicial;
- loading de mutação;
- lista vazia;
- sem resultado de filtro;
- erro de listagem;
- erro de mutação;
- sucesso de aprovação;
- sucesso de rejeição;
- item selecionado;
- filtro ativo.

## UX obrigatória

### Desktop

- sidebar visível;
- hero com métricas;
- inbox/lista à esquerda;
- detalhe à direita;
- ações no contexto da solicitação selecionada.

### Mobile

- header compacto;
- cards;
- chips;
- bottom decision panel;
- ações grandes.

## Acessibilidade

- Botões com texto visível.
- Ícones com `aria-label` quando forem interativos.
- Confirmação acessível por teclado.
- Inputs com labels.
- Status com texto.
- Áreas clicáveis com alvo mínimo de 44px no mobile.

## Padrão visual

Use as cores da diretriz:

- azul noite: `#0B1220`;
- azul principal: `#2563EB`;
- verde sucesso: `#16A34A`;
- amarelo pendência: `#F59E0B`;
- vermelho decisão negativa: `#DC2626`;
- fundo claro: `#F8FAFC`;
- superfície: `#FFFFFF`.

Preferir tokens/classes existentes do projeto quando houver equivalente.
