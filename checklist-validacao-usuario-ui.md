# Checklist de validação — `/usuario`

## Contratos

- [ ] `GET /users/own-profile` usado para conta.
- [ ] `GET /employee/own-profile` usado para perfil.
- [ ] `PATCH /employee/update-own-profile` usado para e-mail/telefone/endereço autorizado.
- [ ] `PUT /users/password` usado para senha.
- [ ] `GET /terms/status` usado para status biométrico.
- [ ] `GET /terms/biometric/current` usado quando necessário.
- [ ] `GET /terms/consents/history` usado para histórico.
- [ ] `DELETE /terms/revoke-biometric` usado para revogação.
- [ ] `GET /lgpd/me/export` usado para exportação própria.
- [ ] Nenhum endpoint novo foi criado sem necessidade.

## Segurança

- [ ] CPF mascarado.
- [ ] Remuneração protegida.
- [ ] Biometria não exibida.
- [ ] Hash completo não exibido.
- [ ] Sem `console.log` sensível.
- [ ] Senha em fluxo próprio.
- [ ] Revogação biométrica com confirmação.
- [ ] Troca de senha informa encerramento de sessão.
- [ ] Exportação LGPD não despeja JSON completo na tela.

## Desktop

- [ ] Sidebar persistente.
- [ ] Header superior.
- [ ] Hero institucional.
- [ ] Cards de resumo.
- [ ] Grid informativo.
- [ ] Identidade profissional.
- [ ] Contato editável.
- [ ] Segurança.
- [ ] Privacidade/LGPD visível.

## Mobile

- [ ] Sem sidebar.
- [ ] Header compacto.
- [ ] Card superior de perfil.
- [ ] Chips horizontais.
- [ ] Cards empilhados.
- [ ] Bottom navigation fixa.
- [ ] Sheets/fluxos dedicados.
- [ ] Alvos de toque >= 44px.

## Acessibilidade

- [ ] Inputs com label.
- [ ] Botões com texto ou `aria-label`.
- [ ] Estados de erro com `role="alert"` quando aplicável.
- [ ] Foco visível.
- [ ] Contraste adequado.
- [ ] Navegação por teclado em desktop.
- [ ] Navegação por toque adequada em mobile.

## Build/teste

- [ ] `npm run lint`.
- [ ] `npm run test`.
- [ ] `npm run build`.
- [ ] Sem imports mortos.
- [ ] Sem implementação legada duplicada.
