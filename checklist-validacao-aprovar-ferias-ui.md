# Checklist de validação — `/ferias`

## 1. Repositório e branch

- [x] Front-end está na branch `feature/lgpd-compliance-new-ui`.
- [x] Back-end consultado está na branch `PROD_HOSTINGER_V2`.
- [x] Documentação consultada está na branch `main`.

## 2. Contrato

- [x] Endpoint de listagem confirmado.
- [x] Endpoint de aprovação confirmado.
- [x] Endpoint de rejeição confirmado.
- [x] Payload de lote confirmado.
- [x] CSRF/cookie preservados.
- [x] Nenhum contrato HTTP foi alterado sem justificativa.

## 3. Desktop

- [x] Sidebar visível.
- [x] Header de contexto visível.
- [x] Hero com título e subtítulo.
- [x] Métricas de pendentes/aprovadas/rejeitadas.
- [x] Filtros horizontais.
- [x] Inbox/tabela de solicitações.
- [x] Linha selecionada destacada.
- [x] Painel lateral com detalhe.
- [x] Aprovar e rejeitar separados.
- [x] Confirmação antes da decisão.

## 4. Mobile

- [x] Header compacto.
- [x] Métricas curtas.
- [x] Busca.
- [x] Chips de status.
- [x] Cards de solicitação.
- [x] Sem tabela.
- [x] Card selecionável.
- [x] Painel inferior fixo.
- [x] Botões grandes.
- [x] Confirmação antes da decisão.

## 5. Status

- [x] `REQUEST_VACATION` exibido como `Aguardando aprovação`.
- [x] `VACATION` exibido como `Aprovada`.
- [x] `VACATION_REJECTED` exibido como `Rejeitada`.
- [x] Status pendente usa amarelo e texto.
- [x] Status aprovado usa verde e texto.
- [x] Status rejeitado usa vermelho e texto.
- [x] Status finalizado não exibe CTA ativo.

## 6. Estados

- [x] Loading inicial.
- [x] Loading de mutação.
- [x] Estado vazio.
- [x] Estado sem resultado.
- [x] Erro de listagem.
- [x] Erro de mutação.
- [x] Sucesso de aprovação.
- [x] Sucesso de rejeição.

## 7. Acessibilidade

- [x] Inputs têm labels.
- [x] Botões têm texto visível.
- [x] Ícones interativos têm `aria-label`.
- [x] Decisão não depende apenas de cor.
- [x] Foco visível.
- [x] Confirmação acessível por teclado.
- [x] Alvos mobile >= 44px.

## 8. Qualidade

- [x] Legado visual removido.
- [x] Imports não usados removidos.
- [x] Sem estados mortos.
- [x] Sem componentes locais sem uso.
- [x] `npm run lint` executado.
- [x] `npm run build` executado.
- [x] Testes existentes executados.

## 9. Responsividade

- [ ] 360x800 validado manualmente.
- [ ] 430x932 validado manualmente.
- [ ] 768x1024 validado manualmente.
- [ ] 1366x768 validado manualmente.
- [ ] 1440x900 validado manualmente.

## 10. Reporte final

- [x] Arquivos alterados listados.
- [x] Decisões técnicas explicadas.
- [x] Contratos confirmados.
- [x] Comandos executados informados.
- [x] Pendências/riscos informados.

## Observação

- A validação visual manual em navegador não foi executada nesta sessão.
