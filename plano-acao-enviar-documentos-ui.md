# Plano de ação — Refatoração `/enviar-documento-colaborador`

## Fase 0 — Preparação

### Task 0.1 — Validar branchs

- Back-end: `PROD_HOSTINGER_V2`
- Front-end: `feature/lgpd-compliance-new-ui`
- Documentação: `main`

### Task 0.2 — Confirmar rota e componente

Ler:

```text
src/config/app-routes.ts
src/App.tsx
```

Confirmar:

```text
/enviar-documento-colaborador -> DocumentoColaborador
```

Não refatorar a rota errada `/enviar-documentos` sem necessidade.

---

## Fase 1 — Leitura de contrato e regras

### Task 1.1 — Ler diretriz visual

```text
references/docs/kronos_enviar_documentos_diretriz_visual.md
```

Extrair:

- objetivo da tela;
- comportamento por ROLE;
- desktop;
- mobile;
- validações;
- paleta;
- estados obrigatórios.

### Task 1.2 — Ler contrato do back-end

```text
ApiPaths.java
DocumentController.java
DocumentType.java
```

Confirmar:

```http
POST /documents?employeeId=&type=
multipart/form-data file
```

### Task 1.3 — Ler implementação atual

```text
src/pages/DocumentoColaborador.tsx
src/hooks/useCollaboratorDocumentUpload.ts
src/service/document.service.ts
src/types/document.ts
```

Mapear:

- estado;
- validações;
- compressão;
- role;
- destino;
- upload;
- erro e sucesso.

---

## Fase 2 — Desenho da arquitetura front-end

### Task 2.1 — Separar apresentação e lógica

Preservar lógica do hook e mover complexidade visual para componentes.

Sugestão:

```text
src/pages/document-upload/
├── DocumentUploadDesktop.tsx
├── DocumentUploadMobile.tsx
├── UploadHero.tsx
├── UploadScopeCards.tsx
├── UploadStep.tsx
├── UploadDropzone.tsx
├── UploadPreviewPanel.tsx
├── UploadMobileFooter.tsx
└── upload-ui.helpers.ts
```

Ou manter componentes no mesmo arquivo se o padrão do projeto preferir menor fragmentação.

### Task 2.2 — Definir view model

Criar helpers para:

- nome da ROLE;
- descrição do escopo;
- nome do destinatário;
- estado das etapas;
- validações do arquivo;
- tamanho em MB;
- CTA habilitado/desabilitado.

---

## Fase 3 — Implementação desktop

### Task 3.1 — Hero

Criar hero igual ao conceito do mockup:

- breadcrumb visual: `Kronos / Documentos / Enviar documento`;
- badge `Upload documental`;
- cards CTO, MANAGER, PARTNER;
- título: `Envie documentos pessoais com validação e controle`;
- subtítulo: destino, anexo, compressão, tamanho e confirmação.

### Task 3.2 — Cofre de envio

Card principal:

1. Destinatário.
2. Arquivo.
3. Validação.
4. Dropzone.
5. Botões:
   - `Enviar documento`;
   - `Limpar arquivo`.

### Task 3.3 — Prévia e governança

Painel lateral:

- nome do arquivo;
- tipo e tamanho;
- validações:
  - formato permitido;
  - abaixo de 5MB;
  - destinatário selecionado;
  - tipo definido;
- cards de ROLE;
- resultado esperado.

---

## Fase 4 — Implementação mobile

### Task 4.1 — Layout mobile próprio

Sem sidebar. Usar:

- topo escuro;
- card de escopo atual;
- etapas empilhadas;
- card de formatos;
- footer fixo.

### Task 4.2 — Rodapé fixo

Mostrar:

- estado: `Pronto para enviar` ou motivo bloqueante;
- tipo documental;
- chip `Seguro`;
- CTA `Enviar documento`.

---

## Fase 5 — Regras de ROLE

### Task 5.1 — PARTNER

- Destinatário fixo no próprio perfil.
- Não exibir select de colaboradores.
- Exibir: `Destino: próprio perfil`.

### Task 5.2 — MANAGER

- Exibir filtro/lista de colaboradores permitidos.
- Exibir contexto de envio para equipe.

### Task 5.3 — CTO

- Exibir comunicação visual de escopo administrativo.
- Se o front/hook atual ainda não diferenciar CTO de MANAGER, manter compatibilidade e não quebrar contrato.

---

## Fase 6 — Estados e validações

### Task 6.1 — Estados obrigatórios

Implementar visualmente:

- sem destinatário;
- sem arquivo;
- arquivo selecionado;
- tipo inválido;
- arquivo acima de 5MB;
- otimizando imagem;
- enviando;
- sucesso.

### Task 6.2 — Erros próximos ao campo

Evitar erro apenas em toast. Toast pode continuar, mas a tela precisa comunicar o estado.

---

## Fase 7 — Remoção do legado

### Task 7.1 — Remover layout antigo

Remover:

- card único antigo;
- instruções genéricas antigas;
- título visual antigo;
- imports mortos.

### Task 7.2 — Limpar código

Executar:

```bash
npm run lint
npm run build
```

Se houver testes:

```bash
npm test
```

---

## Fase 8 — Validação final

### Task 8.1 — Cenários manuais

- PARTNER envia documento próprio.
- MANAGER seleciona colaborador e envia.
- Arquivo inválido.
- Arquivo acima de 5MB.
- Remover arquivo.
- Loading de envio.
- Sucesso limpa arquivo.
- Desktop e mobile visualmente diferentes.

### Task 8.2 — Entrega

Informar:

- arquivos alterados;
- contrato preservado;
- comandos executados;
- riscos remanescentes.
