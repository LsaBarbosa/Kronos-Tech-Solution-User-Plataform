# Checklist de validação — `/status-do-registro`

## Rota e build

- [ ] `/status-do-registro` continua existindo em `APP_PATHS.statusDoRegistro`.
- [ ] A rota continua renderizando `StatusRegistro`.
- [ ] A rota continua protegida conforme regra do projeto.
- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Sem imports não usados.
- [ ] Sem `throw new Error("Function not implemented")`.

## Contrato HTTP

- [ ] `POST /records/report` preservado.
- [ ] `PUT /records/update/status/{employeeId}/{timeRecordId}` preservado.
- [ ] `PUT /records/toggle-activate/{employeeId}/{timeRecordId}` preservado.
- [ ] Payload `{ statusRecord }` preservado.
- [ ] O front não exige mudança de back-end.

## UX desktop

- [ ] Sidebar visível.
- [ ] Header/breadcrumb visível.
- [ ] Hero institucional implementado.
- [ ] Cards `CREATED`, `DAY_OFF`, `ABSENCE`, `TIME_OFF` implementados.
- [ ] Busca e resultados ficam em área principal.
- [ ] Painel de decisão fica lateral.
- [ ] Registro selecionado fica destacado.
- [ ] Novo status é visualmente separado do status atual.
- [ ] `Inativar registro` é separado de `Salvar status`.

## UX mobile

- [ ] Não replica tabela desktop.
- [ ] Usa fluxo sequencial.
- [ ] Cards de registros têm alvo mínimo de 44px.
- [ ] Bottom bar fixa com resumo e CTAs.
- [ ] Sem sidebar no mobile.
- [ ] Status e ações têm texto, não só cor.

## Regras funcionais

- [ ] Não busca sem status selecionado.
- [ ] Não salva sem registro selecionado.
- [ ] Não salva sem novo status.
- [ ] Novo status limitado a `ABSENCE`, `DAY_OFF`, `TIME_OFF`.
- [ ] Confirmação antes de salvar status.
- [ ] Confirmação antes de ativar/inativar.
- [ ] Refresh da lista após mutação.
- [ ] Toast/mensagem de sucesso.
- [ ] Mensagem clara em erro.

## Estados

- [ ] Loading de busca.
- [ ] Loading de salvar status.
- [ ] Loading de ativar/inativar.
- [ ] Estado vazio sem registros.
- [ ] Estado de erro.
- [ ] Estado de sucesso.

## Acessibilidade

- [ ] Labels explícitos nos filtros.
- [ ] Botões com texto ou `aria-label`.
- [ ] Confirmações acessíveis por teclado.
- [ ] Foco visível em cards e botões.
- [ ] Contraste adequado para falta/folga/abono.
- [ ] Mensagens de impacto trabalhista textuais.
