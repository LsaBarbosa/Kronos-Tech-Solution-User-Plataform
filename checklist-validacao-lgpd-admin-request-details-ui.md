# Checklist de validação — `/lgpd/admin/requests/:requestId`

## Pré-implementação

- [ ] Branch front-end confirmada: `feature/lgpd-compliance-new-ui`.
- [ ] Diretriz visual lida.
- [ ] Mockup desktop analisado.
- [ ] Mockup mobile analisado.
- [ ] `kronos-business/04-mapa-modulos-telas.md` lido.
- [ ] `AdminLgpdRequestDetails.tsx` atual lido.
- [ ] `lgpd.service.ts` lido.
- [ ] Back-end LGPD lido.

## Rota e permissão

- [ ] Rota real preservada: `/lgpd/admin/requests/:requestId`.
- [ ] `APP_ROUTE_META.lgpdAdminRequestDetails.allowedRoles` preserva `CTO` e `MANAGER`.
- [ ] `App.tsx` continua usando `renderProtectedRoleRoute`.
- [ ] Botão voltar aponta para `/lgpd/admin/requests`.

## Desktop

- [ ] Hero institucional criado.
- [ ] Cards de status/SLA/tipo/exportabilidade criados.
- [ ] Coluna principal exibe caso completo.
- [ ] Timeline horizontal criada.
- [ ] Histórico visível.
- [ ] Resultado de anonimização visível quando existir.
- [ ] Painel lateral de ações criado.
- [ ] Ações avançadas têm menor destaque.

## Mobile

- [ ] Não usa tabela.
- [ ] Usa cards verticais.
- [ ] Usa fluxo compacto.
- [ ] Usa barra inferior fixa.
- [ ] Próxima decisão é clara.
- [ ] Não replica densidade do desktop.

## Ações sensíveis

- [ ] Aprovar exportação exige justificativa e escopo.
- [ ] Exportar exige fundamento legal.
- [ ] Exportar exige motivo operacional.
- [ ] Exportar exige notas do revisor.
- [ ] Rejeitar exige motivo.
- [ ] Rejeitar exige nota pública.
- [ ] Complemento exige mensagem.
- [ ] Cancelamento exige motivo.
- [ ] Cancelamento respeita role.
- [ ] Conclusão exige nota pública.
- [ ] ObjectURL é revogado após download.

## Segurança LGPD

- [ ] Sem logs de dados pessoais.
- [ ] Sem localStorage/sessionStorage para dados sensíveis.
- [ ] Sem query string com dados sensíveis.
- [ ] Sem ação sensível por clique único sem confirmação.
- [ ] Dados sensíveis destacados visualmente quando aplicável.

## Acessibilidade

- [ ] Botões de ícone têm `aria-label`.
- [ ] Campos com erro têm `aria-invalid`.
- [ ] Erros têm `role="alert"` quando aplicável.
- [ ] Componentes clicáveis são acessíveis por teclado.
- [ ] Status não depende apenas de cor.

## Testes

- [ ] Testes de helpers adicionados.
- [ ] Testes cobrem status.
- [ ] Testes cobrem tipo exportável.
- [ ] Testes cobrem ação primária.
- [ ] Testes cobrem fluxo visual.

## Validação final

- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npx vitest run`
- [ ] Legado removido.
- [ ] Imports mortos removidos.
- [ ] Arquivos alterados revisados.
