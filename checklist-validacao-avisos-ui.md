# Checklist de validação — Avisos UI

## Rota

- [ ] Confirmada rota real no projeto.
- [ ] `/avisos` funcionando.
- [ ] Se `/aviso` existir/for necessário, há redirect para `/avisos`.
- [ ] Nenhuma tela duplicada criada.

## Contratos

- [ ] `GET /messages?page=&size=` preservado.
- [ ] `POST /messages` preservado.
- [ ] `DELETE /messages/{messageId}` preservado.
- [ ] `MessagePriority` preserva `NORMAL`, `ALERT`, `CRITICAL`.
- [ ] `CriarAviso` continua funcionando.

## Desktop

- [ ] Sidebar visível.
- [ ] Header contextual.
- [ ] Hero institucional.
- [ ] Métricas superiores.
- [ ] Busca por título/conteúdo.
- [ ] Chips de prioridade.
- [ ] Lista de avisos à esquerda.
- [ ] Detalhe lateral à direita.
- [ ] Aviso selecionado com destaque.
- [ ] Paginação clara.
- [ ] Ação `Novo aviso` visível apenas quando permitida.
- [ ] Ação `Deletar aviso` visível apenas quando permitida.

## Mobile

- [ ] Não usa tabela.
- [ ] Topo compacto.
- [ ] Métricas resumidas.
- [ ] Busca em destaque.
- [ ] Chips horizontais.
- [ ] Cards empilhados.
- [ ] Detalhe em modal/drawer/tela dedicada.
- [ ] Rodapé com permissão atual.
- [ ] Alvos de toque com pelo menos 44px.
- [ ] `PARTNER` não vê ações administrativas.

## Estados

- [ ] Loading.
- [ ] Erro.
- [ ] Estado vazio: `Tudo tranquilo por aqui`.
- [ ] Sem resultado de filtro.
- [ ] Exclusão em andamento.
- [ ] Paginação sem anterior/próxima.

## Prioridades

- [ ] `NORMAL` com texto explícito.
- [ ] `ALERT` com texto explícito e cor de alerta.
- [ ] `CRITICAL` com texto explícito e destaque crítico.
- [ ] Prioridade não depende apenas de cor.

## Permissões

- [ ] `PARTNER`: somente leitura.
- [ ] `MANAGER`: pode criar/deletar quando backend permitir.
- [ ] `CTO`: comportamento validado contra backend.
- [ ] Divergências documentadas.

## Acessibilidade

- [ ] Labels nos botões.
- [ ] Foco visível.
- [ ] Confirmação destrutiva acessível por teclado.
- [ ] Contraste adequado.
- [ ] Erros textuais.
- [ ] Estado vazio compreensível.

## Qualidade

- [ ] Sem imports mortos.
- [ ] Sem comentários obsoletos.
- [ ] Sem console.log de conteúdo sensível.
- [ ] Sem mocks substituindo dados reais.
- [ ] Build passou.
- [ ] Lint passou.
