# Checklist de validação — `/privacidade`

## Rota e contrato

- [ ] `/privacidade` renderiza `PrivacyCenter`.
- [ ] Rota continua autenticada.
- [ ] Nenhum endpoint foi alterado.
- [ ] `exportMyData()` continua usando `GET /lgpd/me/export`.
- [ ] Solicitações continuam usando `/lgpd/requests`.
- [ ] Consentimento biométrico continua usando `/terms/*`.

## Desktop

- [ ] Existe hero institucional conforme mockup.
- [ ] Métricas superiores aparecem.
- [ ] Cards de ações principais aparecem.
- [ ] Solicitações recentes aparecem.
- [ ] Painel de governança aparece à direita.
- [ ] CTAs `Exportar JSON` e `Criar solicitação` estão visíveis.
- [ ] A experiência usa grid/painel, não apenas cards empilhados.

## Mobile

- [ ] Não há tabela.
- [ ] Não é apenas desktop redimensionado.
- [ ] Cards verticais funcionam bem em 390–430px.
- [ ] CTA fixo inferior aparece.
- [ ] Cards têm área de toque adequada.
- [ ] Formulário/ações sensíveis abrem em modal, sheet ou etapa dedicada.

## LGPD e segurança

- [ ] Exportação exige confirmação.
- [ ] Manifesto de exportação é exibido após sucesso.
- [ ] Consentimento biométrico indica estado atual.
- [ ] Revogação explica consequências.
- [ ] Catálogo, política e DPO são acessíveis.
- [ ] Status de solicitação é textual.
- [ ] Nenhum material biométrico é exibido.

## Estados

- [ ] Exportando mostra loading.
- [ ] Exportação concluída mostra confirmação/manifesto.
- [ ] Solicitação aberta aparece com selo amarelo.
- [ ] Em análise aparece com selo azul.
- [ ] Concluída aparece com selo verde.
- [ ] Rejeitada/cancelada aparece com selo vermelho.
- [ ] Erros são claros e não técnicos.

## Acessibilidade

- [ ] Botões possuem texto ou `aria-label`.
- [ ] Foco visível em cards acionáveis.
- [ ] Contraste adequado nas cores teal, roxo, amarelo e vermelho.
- [ ] Status não depende apenas de cor.
- [ ] CTA desabilitado tem contexto textual quando aplicável.

## Validação técnica

- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Não há imports mortos.
- [ ] Não há componentes antigos ativos duplicando a nova experiência.
- [ ] Não há overflow horizontal no mobile.
