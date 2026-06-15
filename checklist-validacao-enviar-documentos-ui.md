# Checklist de validação — `/enviar-documento-colaborador`

## Rota

- [ ] `/enviar-documento-colaborador` renderiza a nova UI.
- [ ] `DocumentoColaborador.tsx` foi refatorado.
- [ ] `/enviar-documentos` não foi alterada indevidamente.
- [ ] Breadcrumb e texto da tela indicam envio documental.

## Contrato

- [ ] `POST /documents` preservado.
- [ ] `employeeId` enviado como query param.
- [ ] `type` enviado como query param.
- [ ] `file` enviado em `multipart/form-data`.
- [ ] `uploadDocument(file, employeeId, type)` preservado.

## Desktop

- [ ] Sidebar visível.
- [ ] Header visível.
- [ ] Hero institucional.
- [ ] Cards CTO, MANAGER e PARTNER.
- [ ] Card principal com etapas.
- [ ] Dropzone grande.
- [ ] Painel lateral de prévia e governança.
- [ ] Botões `Enviar documento` e `Limpar arquivo`.

## Mobile

- [ ] Sem sidebar.
- [ ] Topo compacto.
- [ ] Card de escopo atual.
- [ ] Etapas empilhadas.
- [ ] Rodapé fixo.
- [ ] CTA grande.
- [ ] Sem tabela.
- [ ] Toque mínimo de 44px.

## ROLE

- [ ] PARTNER não seleciona outro colaborador.
- [ ] PARTNER vê próprio perfil como destino.
- [ ] MANAGER seleciona colaborador permitido.
- [ ] CTO tem comunicação visual de escopo administrativo, quando aplicável.
- [ ] Regra de destino fica clara.

## Upload

- [ ] PDF aceito.
- [ ] JPG aceito.
- [ ] JPEG aceito.
- [ ] PNG aceito.
- [ ] Arquivo inválido bloqueia envio.
- [ ] Arquivo acima de 5MB bloqueia envio.
- [ ] Imagem pode ser comprimida.
- [ ] Nome e tamanho aparecem na prévia.
- [ ] Remover arquivo funciona.
- [ ] Sucesso limpa arquivo.
- [ ] Erro aparece próximo ao campo e/ou toast.

## Acessibilidade

- [ ] Botões com texto ou `aria-label`.
- [ ] Dropzone acessível por teclado.
- [ ] Estados têm texto, não só cor.
- [ ] Loading anunciado no CTA.
- [ ] Contraste validado.
- [ ] Foco visível.

## Qualidade

- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Testes executados quando disponíveis.
- [ ] Sem imports mortos.
- [ ] Sem console errors.
- [ ] Legado visual removido.
