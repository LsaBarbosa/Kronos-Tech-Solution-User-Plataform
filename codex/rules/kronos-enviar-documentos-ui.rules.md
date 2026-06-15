# Rules — Kronos Enviar Documentos UI

## Regras de produto

1. A rota alvo é `/enviar-documento-colaborador`.
2. A página deve representar um cofre de envio documental.
3. O tipo padrão esperado pela diretriz é `EMPLOYEE_DOCUMENTS`.
4. Formatos aceitos: PDF, JPG, JPEG e PNG.
5. Tamanho máximo: 5MB.
6. Imagens podem ser comprimidas antes do envio.
7. O envio precisa ser confirmado visualmente.
8. O arquivo deve ser limpo após sucesso.

## Regras por ROLE

### CTO

- Pode ter comunicação visual de escopo administrativo.
- Deve conseguir selecionar destinatário se o produto permitir.

### MANAGER

- Deve selecionar colaborador permitido.
- Deve visualizar envio operacional para equipe/tenant.

### PARTNER

- Não pode selecionar outro colaborador.
- Destinatário deve ser o próprio perfil.
- A tela deve explicar que o destino está bloqueado pela sessão.

## Regras técnicas

1. Manter `POST /documents`.
2. Manter `multipart/form-data`.
3. Manter query params `employeeId` e `type`.
4. Manter request part `file`.
5. Preservar `uploadDocument(file, employeeId, type)`.
6. Preservar tratamento de erro do serviço.
7. Não criar dependência nova sem necessidade.
8. Preferir componentes locais pequenos ou pasta dedicada à rota.

## Regras de UX

1. Desktop e mobile devem ser experiências diferentes.
2. Mobile não pode ser só desktop reduzido.
3. Desktop deve ter painel lateral de prévia/governança.
4. Mobile deve ter etapas e CTA fixo.
5. Erros devem ficar próximos da origem.
6. CTA desabilitado deve ter motivo visual claro.
7. Loading deve ser localizado.

## Regras de limpeza

Após a nova implementação:

- Remover blocos visuais antigos de upload simples.
- Remover imports não usados.
- Remover helpers mortos.
- Evitar duplicação entre desktop e mobile quando lógica for comum.
