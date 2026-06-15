# Checklist de validação — `/aprovacoes-abono`

## Rotas e permissões

- [ ] `/aprovacoes-abono` continua existindo.
- [ ] A rota continua protegida para `MANAGER`.
- [ ] O componente principal continua sendo carregado pelo roteamento atual.

## Contratos

- [ ] `GET /records/time-off/requests` não foi alterado.
- [ ] `PATCH /records/time-off/approve/{timeRecordId}` não foi alterado.
- [ ] `PATCH /records/time-off/reject/{timeRecordId}` não foi alterado.
- [ ] `listTimeOffRequests` continua recebendo `page`, `size`, `status`, `employeeName`.
- [ ] `approveTimeOff` continua recebendo `timeRecordId`.
- [ ] `rejectTimeOff` continua recebendo `timeRecordId`.
- [ ] Download de documento/evidência continua funcionando.

## Desktop

- [ ] Hero com título e métricas.
- [ ] Fila com busca por colaborador.
- [ ] Chips de status visíveis.
- [ ] Lista permite selecionar solicitação.
- [ ] Painel lateral mostra solicitação selecionada.
- [ ] Evidência/anexo aparece quando disponível.
- [ ] Impacto em horas/registros aparece.
- [ ] Aprovar e rejeitar são botões separados.
- [ ] Confirmação aparece antes da ação.

## Mobile

- [ ] Não há tabela.
- [ ] Cards são usados para solicitações.
- [ ] Busca e chips funcionam.
- [ ] Painel fixo inferior mostra seleção atual.
- [ ] Botões de aprovar/rejeitar têm área de toque adequada.
- [ ] Detalhe/evidência abre em modal/drawer/bottom sheet.

## Estados

- [ ] Loading inicial.
- [ ] Loading de mutação.
- [ ] Estado vazio.
- [ ] Erro de listagem.
- [ ] Erro de aprovação/rejeição.
- [ ] Sucesso de aprovação/rejeição.
- [ ] Solicitação finalizada não mostra CTA.

## Acessibilidade

- [ ] Status tem texto, não apenas cor.
- [ ] Botões têm texto ou `aria-label`.
- [ ] Cards selecionáveis têm foco visível.
- [ ] Confirmação é acessível por teclado.
- [ ] Contraste validado para amarelo, verde, vermelho e roxo.

## Qualidade

- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Imports não usados removidos.
- [ ] Código legado não renderiza mais.
- [ ] Nenhum contrato do back-end foi alterado.
