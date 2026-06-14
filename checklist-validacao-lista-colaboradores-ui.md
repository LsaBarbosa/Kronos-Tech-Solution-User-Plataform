# Checklist de validação — `/lista-colaboradores`

## Fontes

- [ ] Front-end na branch correta.
- [ ] Back-end observado na branch correta.
- [ ] Documentação observada na branch correta.
- [ ] Diretriz visual lida.
- [ ] Mockups desktop/mobile observados.

## Contratos

- [ ] `GET /employee?active=` preservado.
- [ ] `GET /employee/{employeeId}` preservado.
- [ ] `PATCH /employee/manager/update-employee/{employeeId}` preservado.
- [ ] `POST /employee/manager/{employeeId}/biometric-enrollment` preservado.
- [ ] `GET /users/search?active=` preservado.
- [ ] `PATCH /users/search/{userId}` preservado.
- [ ] `PATCH /users/toggle-activate/{userId}` preservado.
- [ ] Nenhum endpoint novo criado.

## Permissão

- [ ] `/lista-colaboradores` continua `MANAGER`.
- [ ] Guards preservados.
- [ ] Rota continua renderizando `ListaColaboradores`.

## Desktop

- [ ] Hero implementado.
- [ ] Métricas implementadas.
- [ ] Filtros horizontais implementados.
- [ ] Tabela operacional implementada.
- [ ] Painel lateral implementado.
- [ ] Ações sensíveis isoladas.

## Mobile

- [ ] Não usa tabela.
- [ ] Topo compacto.
- [ ] Métricas rápidas.
- [ ] Busca grande.
- [ ] Chips de filtro.
- [ ] Cards.
- [ ] Menu contextual.
- [ ] Bottom sheet.
- [ ] Rodapé de ações.

## Estados

- [ ] Loading desktop.
- [ ] Loading mobile.
- [ ] Lista vazia.
- [ ] Sem resultado.
- [ ] Erro.
- [ ] Atualização em andamento.
- [ ] Conta sem usuário.
- [ ] Biometria pendente.

## Ações

- [ ] Editar cadastro.
- [ ] Salvar/cancelar.
- [ ] Ativar/desativar com confirmação.
- [ ] Biometria separada.
- [ ] Novo colaborador.
- [ ] Limpar filtros.

## Segurança e acessibilidade

- [ ] Sem imagem facial exibida.
- [ ] Sem log sensível.
- [ ] Status com texto além de cor.
- [ ] Botões de ícone com `aria-label`.
- [ ] Foco visível.
- [ ] Toque mobile mínimo de 44px.

## Limpeza e build

- [ ] UI legada removida.
- [ ] Imports mortos removidos.
- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Testes executados se existirem.
