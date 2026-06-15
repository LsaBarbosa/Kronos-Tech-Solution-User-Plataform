# Rules — Kronos Avisos UI

## Regras de contrato

1. Não alterar endpoints do back-end.
2. Não alterar payload de `POST /messages`.
3. Não alterar estrutura esperada de `Message`.
4. Não alterar autenticação, cookie, CSRF ou interceptors.
5. Não criar mocks fixos substituindo dados reais.

## Regras de permissão

1. `PARTNER` não vê `Novo aviso`.
2. `PARTNER` não vê `Deletar aviso`.
3. `MANAGER` e `CTO` podem visualizar ações administrativas somente se o produto/back-end permitir.
4. Em caso de conflito entre diretriz e back-end, seguir back-end e registrar ajuste necessário.

## Regras visuais

1. Desktop não pode ser apenas mobile ampliado.
2. Mobile não pode renderizar tabela.
3. Desktop deve ter detalhe lateral.
4. Mobile deve ter detalhe em modal/drawer/tela dedicada.
5. Prioridade deve ser textual e por cor.
6. Ação destrutiva sempre exige confirmação.

## Regras de LGPD e segurança

1. Não exibir dados pessoais além do necessário.
2. Não logar conteúdo completo do aviso em console.
3. Não exibir IDs técnicos para o usuário.
4. Não permitir exclusão sem confirmação.
5. Mensagens de erro devem ser claras e não técnicas.

## Regras de código

1. Evitar componente monolítico em `Avisos.tsx`.
2. Criar componentes reutilizáveis dentro de uma pasta local da feature se necessário.
3. Preferir funções puras para:
   - contagem de métricas;
   - filtragem;
   - classificação de prioridade;
   - texto de permissão.
4. Não deixar funções, imports ou CSS mortos.
5. Usar nomes em português coerentes com o projeto ou nomes técnicos consistentes se o módulo já usar inglês.

## Validação mínima

Executar:

```bash
npm install
npm run lint
npm run build
```

Quando houver testes disponíveis:

```bash
npm test
```
