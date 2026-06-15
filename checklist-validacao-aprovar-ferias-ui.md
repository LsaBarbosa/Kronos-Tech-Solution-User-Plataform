# Checklist de validação — `/ferias`

## 1. Repositório e branch

- [ ] Front-end está na branch `feature/lgpd-compliance-new-ui`.
- [ ] Back-end consultado está na branch `PROD_HOSTINGER_V2`.
- [ ] Documentação consultada está na branch `main`.

## 2. Contrato

- [ ] Endpoint de listagem confirmado.
- [ ] Endpoint de aprovação confirmado.
- [ ] Endpoint de rejeição confirmado.
- [ ] Payload de lote confirmado.
- [ ] CSRF/cookie preservados.
- [ ] Nenhum contrato HTTP foi alterado sem justificativa.

## 3. Desktop

- [ ] Sidebar visível.
- [ ] Header de contexto visível.
- [ ] Hero com título e subtítulo.
- [ ] Métricas de pendentes/aprovadas/rejeitadas.
- [ ] Filtros horizontais.
- [ ] Inbox/tabela de solicitações.
- [ ] Linha selecionada destacada.
- [ ] Painel lateral com detalhe.
- [ ] Aprovar e rejeitar separados.
- [ ] Confirmação antes da decisão.

## 4. Mobile

- [ ] Header compacto.
- [ ] Métricas curtas.
- [ ] Busca.
- [ ] Chips de status.
- [ ] Cards de solicitação.
- [ ] Sem tabela.
- [ ] Card selecionável.
- [ ] Painel inferior fixo.
- [ ] Botões grandes.
- [ ] Confirmação antes da decisão.

## 5. Status

- [ ] `REQUEST_VACATION` exibido como `Aguardando aprovação`.
- [ ] `VACATION` exibido como `Aprovada`.
- [ ] `VACATION_REJECTED` exibido como `Rejeitada`.
- [ ] Status pendente usa amarelo e texto.
- [ ] Status aprovado usa verde e texto.
- [ ] Status rejeitado usa vermelho e texto.
- [ ] Status finalizado não exibe CTA ativo.

## 6. Estados

- [ ] Loading inicial.
- [ ] Loading de mutação.
- [ ] Estado vazio.
- [ ] Estado sem resultado.
- [ ] Erro de listagem.
- [ ] Erro de mutação.
- [ ] Sucesso de aprovação.
- [ ] Sucesso de rejeição.

## 7. Acessibilidade

- [ ] Inputs têm labels.
- [ ] Botões têm texto visível.
- [ ] Ícones interativos têm `aria-label`.
- [ ] Decisão não depende apenas de cor.
- [ ] Foco visível.
- [ ] Confirmação acessível por teclado.
- [ ] Alvos mobile >= 44px.

## 8. Qualidade

- [ ] Legado visual removido.
- [ ] Imports não usados removidos.
- [ ] Sem estados mortos.
- [ ] Sem componentes locais sem uso.
- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Testes existentes executados quando disponíveis.

## 9. Responsividade

- [ ] 360x800 validado.
- [ ] 430x932 validado.
- [ ] 768x1024 validado.
- [ ] 1366x768 validado.
- [ ] 1440x900 validado.

## 10. Reporte final

- [ ] Arquivos alterados listados.
- [ ] Decisões técnicas explicadas.
- [ ] Contratos confirmados.
- [ ] Comandos executados informados.
- [ ] Pendências/riscos informados.
