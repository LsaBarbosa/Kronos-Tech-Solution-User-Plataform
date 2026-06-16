# Rules — Kronos LGPD Admin Requests UI

## Regras obrigatórias

1. Não alterar contratos do back-end sem evidência de bug real.
2. Não remover a rota `/lgpd/admin/requests`.
3. Não remover a rota de detalhe `/lgpd/admin/requests/:requestId`.
4. Preservar acesso apenas para `CTO` e `MANAGER`.
5. `PARTNER` não deve visualizar rota administrativa.
6. Mobile não pode usar tabela.
7. Desktop não pode ser apenas mobile ampliado.
8. A lista não deve executar ações destrutivas diretamente.
9. A tela de detalhe continua responsável por transições, notas, exportação, anonimização e fechamento.
10. Dados sensíveis devem ser comunicados visualmente, sem expor conteúdo sensível indevido.
11. Status textual é obrigatório; cor sozinha não basta.
12. Solicitações atrasadas precisam de destaque visual.
13. Loading deve bloquear repetição de busca.
14. Erros devem usar linguagem administrativa.
15. Adicionar ou ajustar testes quando criar formatters, mappers ou cálculos de SLA.
16. Depois de validar a nova implementação, remover componentes/trechos legados substituídos.

## Não fazer

- Não usar `dangerouslySetInnerHTML`.
- Não armazenar dados pessoais, token, CPF, salário ou payload LGPD em `localStorage`.
- Não logar request/response LGPD completo no console.
- Não fazer mock permanente de dados em produção.
- Não depender de `window.innerWidth` direto se já houver padrão com `matchMedia`.
- Não criar rota paralela para a mesma tela.
