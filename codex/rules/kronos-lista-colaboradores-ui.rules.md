# Rules — Kronos `/lista-colaboradores`

## Obrigatório

1. Trabalhar no front-end `feature/lgpd-compliance-new-ui`.
2. Observar o back-end `PROD_HOSTINGER_V2` como contrato.
3. Observar `kronos-business/main` como documentação funcional.
4. Não criar endpoint novo por conveniência visual.
5. Não remover `ProtectedRoute`, `RoleRoute` ou `allowedRoles`.
6. `/lista-colaboradores` continua `MANAGER`.
7. Desktop e mobile precisam ser experiências distintas.
8. Não usar tabela no mobile.
9. Não usar cards simples como única estrutura do desktop.
10. Não exibir imagem facial.
11. Biometria deve ser ação separada.
12. Toggle de status deve exigir confirmação.
13. Status não pode depender apenas de cor.
14. Não usar dados mockados.
15. Não deixar legado ativo depois da nova UI.
16. Não quebrar os serviços existentes.
17. Não registrar dados sensíveis em log.
18. Preservar CSRF/preload quando existente.
19. Remover imports e estados mortos.
20. Executar lint e build.

## UX

- Desktop: painel gerencial denso com tabela e detalhes laterais.
- Mobile: cards, chips, menu contextual e bottom sheet.
- Loading: skeleton de tabela no desktop e skeleton de cards no mobile.
- Estado vazio: CTA para cadastrar novo colaborador.
- Sem resultado: botão para limpar filtros.
- Botões de ícone: `aria-label`.
- Toque mobile: mínimo 44px.
