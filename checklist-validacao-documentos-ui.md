# Checklist de validação — `/documentos`

## Repositórios

- [ ] Back-end na branch `PROD_HOSTINGER_V2`.
- [ ] Front-end na branch `feature/lgpd-compliance-new-ui`.
- [ ] Documentação na branch `main`.

## Referências

- [ ] `kronos_documentos_diretriz_visual.md` lido.
- [ ] `kronos_documentos_desktop.png` analisado.
- [ ] `kronos_documentos_mobile.png` analisado.

## Contrato

- [ ] `GET /documents` preservado.
- [ ] `GET /documents/{documentId}` preservado.
- [ ] `DELETE /documents/{documentId}` preservado.
- [ ] `GET /employee?active=` preservado.
- [ ] `type` enviado corretamente.
- [ ] `date` enviado apenas quando preenchido.
- [ ] `employeeId` respeita role e estado.

## Desktop

- [ ] Sidebar/header mantidos.
- [ ] Hero institucional implementado.
- [ ] Cards CTO/MANAGER/PARTNER visíveis.
- [ ] Console de busca em grade.
- [ ] Tipos documentais como chips.
- [ ] Resultados em painel lateral.
- [ ] Bloco de governança visível.
- [ ] Download e exclusão separados.
- [ ] Estado vazio claro.
- [ ] Loading de busca visível.

## Mobile

- [ ] Topo compacto.
- [ ] Card de escopo atual.
- [ ] Etapa 1: tipo documental.
- [ ] Etapa 2: filtros.
- [ ] Etapa 3: resultados.
- [ ] CTA fixo inferior.
- [ ] Cards de documentos, sem tabela.
- [ ] Toque mínimo de 44px.
- [ ] Sem scroll horizontal.

## Role

- [ ] `PARTNER` não seleciona funcionário.
- [ ] `PARTNER` vê acervo próprio.
- [ ] `MANAGER` seleciona funcionário permitido.
- [ ] `CTO` possui comunicação visual de escopo amplo.
- [ ] UI não tenta burlar autorização backend.

## Ações

- [ ] Buscar desabilita sem tipo.
- [ ] Buscar desabilita sem funcionário para CTO/MANAGER.
- [ ] Download mostra feedback.
- [ ] Exclusão exige confirmação.
- [ ] Exclusão usa cor/semântica destrutiva.
- [ ] Exclusão remove item da lista só após sucesso.

## Acessibilidade

- [ ] Labels explícitos.
- [ ] Foco visível.
- [ ] `aria-label` em botões de ícone.
- [ ] Status textual.
- [ ] Loading compreensível.
- [ ] Contraste validado em chips.

## Qualidade

- [ ] Código legado visual removido.
- [ ] Imports não usados removidos.
- [ ] Sem duplicação excessiva.
- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Testes existentes executados, se houver.
