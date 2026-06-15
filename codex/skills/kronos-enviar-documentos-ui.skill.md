# Skill — Kronos Enviar Documentos UI

## Missão

Refatorar a rota `/enviar-documento-colaborador` do front-end Kronos para uma experiência nova, segura e responsiva de upload documental.

## Contexto funcional

A tela deve deixar de parecer um formulário simples de upload e passar a funcionar como um **Secure Upload Vault**.

O fluxo central é:

1. Identificar ROLE atual.
2. Definir escopo de envio:
   - `CTO`: escopo administrativo.
   - `MANAGER`: envio operacional para colaboradores permitidos.
   - `PARTNER`: envio somente para o próprio perfil.
3. Selecionar ou fixar destinatário conforme ROLE.
4. Selecionar arquivo.
5. Validar formato e tamanho.
6. Exibir prévia e validações.
7. Enviar documento.
8. Confirmar resultado.

## Arquivos que devem ser lidos

### Front-end

```text
src/pages/DocumentoColaborador.tsx
src/hooks/useCollaboratorDocumentUpload.ts
src/service/document.service.ts
src/types/document.ts
src/config/app-routes.ts
src/App.tsx
src/context/AuthContext.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/*
```

### Back-end

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/DocumentController.java
src/main/java/com/kts/kronos/domain/model/enuns/DocumentType.java
```

### Documentação

```text
kronos-business/04-mapa-modulos-telas.md
references/docs/kronos_enviar_documentos_diretriz_visual.md
```

## Contrato obrigatório

Não alterar o contrato HTTP atual:

```http
POST /documents?employeeId=<uuid>&type=<DocumentType>
Content-Type: multipart/form-data

file=<MultipartFile>
```

Resposta esperada:

```http
201 Created
```

## Regra crítica

A tela pedida é `/enviar-documento-colaborador`, não `/enviar-documentos`.

## UX desktop

Implementar como console de upload:

- Sidebar visível.
- Header com breadcrumb e ROLE.
- Hero institucional.
- Cards de escopo por ROLE.
- Card principal com etapas:
  1. Destinatário.
  2. Arquivo.
  3. Validação.
- Dropzone grande.
- CTA `Enviar documento`.
- CTA secundário `Limpar arquivo`.
- Painel lateral:
  - prévia do arquivo;
  - validações;
  - matriz de governança por ROLE;
  - resultado esperado.

## UX mobile

Implementar como fluxo guiado:

- Topo compacto.
- Card de escopo atual.
- Etapas empilhadas:
  1. Destinatário.
  2. Arquivo.
  3. Validação.
- Box de formatos permitidos.
- Rodapé fixo com resumo e CTA.
- Sem sidebar.
- Sem tabela.
- Áreas de toque de pelo menos 44px.

## Validações visuais

- Sem destinatário: CTA desabilitado.
- Sem arquivo: dropzone neutra.
- Arquivo selecionado: mostrar nome e tamanho.
- Tipo inválido: erro vermelho.
- Arquivo acima de 5MB: erro vermelho.
- Imagem em otimização: alerta amarelo.
- Enviando: loading no CTA.
- Sucesso: mensagem verde e limpar arquivo.

## Acessibilidade

- Todo botão deve ter texto ou `aria-label`.
- Prioridade e estado não podem depender só de cor.
- Dropzone deve ser operável por teclado.
- Erros precisam aparecer próximos ao campo.
- Loading de envio deve ser anunciado semanticamente.
