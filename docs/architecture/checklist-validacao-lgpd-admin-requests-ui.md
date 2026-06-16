# Checklist de validação — `/lgpd/admin/requests`

## Branches

- [ ] Front-end em `feature/lgpd-compliance-new-ui`.
- [ ] Back-end consultado em `PROD_HOSTINGER_V2`.
- [ ] Documentação consultada em `kronos-business/main`.

## Rota e RBAC

- [ ] `/lgpd/admin/requests` registrada.
- [ ] `/lgpd/admin/requests/:requestId` registrada.
- [ ] `CTO` acessa.
- [ ] `MANAGER` acessa.
- [ ] `PARTNER` não acessa.
- [ ] Sidebar/menu não expõe rota para perfil indevido.

## Desktop

- [ ] Hero implementado.
- [ ] Métricas: abertas, em análise, atrasadas e exportáveis.
- [ ] Filtros por tipo/status/busca.
- [ ] Inbox mostra titular, empresa, tipo, status, SLA e responsável.
- [ ] Linha selecionada destacada.
- [ ] Painel lateral com caso selecionado.
- [ ] CTA `Abrir detalhes`.
- [ ] Sem ação destrutiva direta.

## Mobile

- [ ] Não usa tabela.
- [ ] Cards mostram titular, tipo, status e SLA.
- [ ] Chips de status.
- [ ] Bottom bar/drawer com selecionado.
- [ ] CTA abre detalhes.
- [ ] Layout validado em 390x844 e 430x932.

## LGPD e segurança

- [ ] Não grava payloads LGPD em `localStorage`.
- [ ] Não loga dados sensíveis.
- [ ] `isOverdue` destacado em vermelho.
- [ ] Status textual acompanha cor.
- [ ] Dados sensíveis destacados sem expor conteúdo indevido.

## Estados

- [ ] Loading.
- [ ] Erro com retry.
- [ ] Sem solicitações.
- [ ] Sem resultados.
- [ ] Paginação.
- [ ] Item selecionado ausente após refetch.

## Comandos

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

- [ ] Todos executados.
