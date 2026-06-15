# Plano de ação — Refatoração `/documentos`

## Fase 0 — Preparação

### Task 0.1 — Conferir branchs

```bash
cd <workspace>/Kronos-Tech-Solutions-KTS
git checkout PROD_HOSTINGER_V2
git pull

cd <workspace>/Kronos-Tech-Solution-User-Plataform
git checkout feature/lgpd-compliance-new-ui
git pull

cd <workspace>/kronos-business
git checkout main
git pull
```

### Task 0.2 — Copiar referências

Copie o pacote `kronos_codex_documentos_ui` para uma pasta acessível ao Codex ou informe o caminho absoluto no prompt.

Arquivos obrigatórios:

- `references/docs/kronos_documentos_diretriz_visual.md`
- `references/mockups/kronos_documentos_desktop.png`
- `references/mockups/kronos_documentos_mobile.png`

---

## Fase 1 — Leitura e mapeamento

### Task 1.1 — Ler diretriz visual

Ler o documento:

```txt
references/docs/kronos_documentos_diretriz_visual.md
```

Extrair:

- objetivo da tela;
- comportamento por role;
- diferenças desktop/mobile;
- paleta;
- tipos documentais;
- estados obrigatórios;
- regras UX.

### Task 1.2 — Ler mockups

Inspecionar:

```txt
references/mockups/kronos_documentos_desktop.png
references/mockups/kronos_documentos_mobile.png
```

Registrar:

- estrutura desktop;
- estrutura mobile;
- áreas principais;
- textos;
- densidade;
- hierarquia de botões.

### Task 1.3 — Mapear front-end

Ler:

```txt
src/pages/Documentos.tsx
src/hooks/useDocumentsPage.ts
src/service/document.service.ts
src/types/document.ts
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
```

Confirmar:

- `/documentos` e `/meus-documentos`;
- hook usado;
- payload de busca;
- lógica de role;
- fluxo de download;
- fluxo de exclusão.

### Task 1.4 — Mapear backend

Ler:

```txt
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/DocumentController.java
```

Confirmar:

- `GET /documents`;
- `GET /documents/{documentId}`;
- `DELETE /documents/{documentId}`;
- `employeeId`, `date`, `type`;
- `ANY_EMPLOYEE`.

### Task 1.5 — Mapear documentação de negócio

No `kronos-business`, ler:

```txt
04-mapa-modulos-telas.md
08-rotas-guards-permissoes.md
```

Confirmar que:

- `/documentos` e `/meus-documentos` são autenticadas;
- backend aplica escopo;
- módulo é documental.

---

## Fase 2 — Arquitetura da solução

### Task 2.1 — Definir estrutura de componentes

Escolha uma das abordagens:

**Opção A — subcomponentes no próprio arquivo**

Boa se a tela ficar moderada.

**Opção B — pasta de feature**

Recomendada se a tela ficar grande:

```txt
src/features/documents/
├── components/
│   ├── DocumentsDesktopView.tsx
│   ├── DocumentsMobileView.tsx
│   ├── DocumentScopeCards.tsx
│   ├── DocumentTypeChips.tsx
│   ├── DocumentResultsPanel.tsx
│   └── DocumentDeleteDialog.tsx
└── document-ui.helpers.ts
```

### Task 2.2 — Criar modelo visual de role

Criar helpers para:

- label da role;
- cor da role;
- texto de escopo;
- descrição de permissão.

Exemplo:

```ts
const roleScope = {
  CTO: {
    label: "CTO",
    title: "Visão administrativa",
    description: "Empresas e colaboradores",
  },
  MANAGER: {
    label: "MANAGER",
    title: "Gestão documental",
    description: "Colaboradores ativos/inativos",
  },
  PARTNER: {
    label: "PARTNER",
    title: "Acervo próprio",
    description: "Funcionário bloqueado pela sessão",
  },
};
```

### Task 2.3 — Criar helpers documentais

Centralizar:

- labels de `DocumentType`;
- cores/ícones por tipo;
- formatação de data;
- iniciais/ícone do documento;
- estado de CTA.

---

## Fase 3 — Implementação desktop

### Task 3.1 — Hero desktop

Implementar hero com:

- breadcrumb/contexto;
- título: `Encontre documentos trabalhistas com escopo seguro`;
- subtítulo sobre colaborador, tipo, status e visibilidade;
- cards CTO, MANAGER, PARTNER.

### Task 3.2 — Console de busca

Implementar card principal com:

- cards de escopo por role;
- status funcionário;
- funcionário;
- tipo;
- data;
- resultado por página;
- ação `Buscar Documentos`;
- ação `Limpar filtros`.

### Task 3.3 — Tipos documentais

Implementar chips para:

- Contracheque;
- Abono;
- Geral;
- Consentimento;
- Comprovante;
- Documentos Pessoais;
- Termo de Serviço.

Os chips devem atualizar `selectedDocumentType`.

### Task 3.4 — Painel de resultados

Implementar painel lateral com:

- título `Resultados`;
- subtítulo sobre download e exclusão;
- skeleton durante busca;
- estado vazio;
- lista de documentos;
- botão de download;
- botão de exclusão quando permitido;
- bloco `Governança`.

### Task 3.5 — Confirmação de exclusão

Substituir `window.confirm`, se houver dialog no design system.

A confirmação deve conter:

- nome do arquivo;
- aviso de ação sensível;
- botão cancelar;
- botão excluir.

---

## Fase 4 — Implementação mobile

### Task 4.1 — Topo mobile

Implementar topo compacto com:

- logo/símbolo Kronos;
- título `Documentos`;
- subtítulo `Busca segura`;
- badge da role.

### Task 4.2 — Card de escopo atual

Mostrar:

- role atual;
- título do escopo;
- descrição de restrição.

Para `PARTNER`:

```txt
Documentos próprios
Funcionário bloqueado pela sessão
```

### Task 4.3 — Etapas

Criar cards:

1. **Tipo de documento**  
   chips/toggle de categorias.

2. **Filtros**  
   data opcional e funcionário bloqueado/selecionado.

3. **Resultados**  
   cards de documentos com download.

### Task 4.4 — Rodapé fixo

Mostrar:

- resumo do estado;
- chips `PDF/arquivo` e `Seguro`;
- botão `Buscar documentos`.

O botão deve respeitar validações.

---

## Fase 5 — Estados e permissões

### Task 5.1 — CTA

Desabilitar busca quando:

- `selectedDocumentType` vazio;
- `selectedEmployeeId` vazio para `CTO/MANAGER`;
- `isSearching`;
- `isFetchingEmployees`.

### Task 5.2 — Partner

Garantir que `PARTNER`:

- recebe `selectedEmployeeId` da sessão;
- não vê select de funcionário;
- vê mensagem de escopo próprio.

### Task 5.3 — Loading e vazio

Implementar:

- skeleton de resultados;
- estado sem documentos;
- estado de erro reaproveitando feedback existente.

---

## Fase 6 — Limpeza do legado

### Task 6.1 — Remover tela antiga

Remover:

- layout antigo de formulário simples;
- cards antigos de instrução;
- lista antiga sem hierarquia;
- imports não usados.

### Task 6.2 — Garantir consistência

Não deixar dois layouts renderizando a mesma coisa em breakpoints conflitantes.

---

## Fase 7 — Validação

### Task 7.1 — Testes manuais

Validar:

- CTO com seleção de funcionário;
- MANAGER com seleção de funcionário;
- PARTNER sem seleção de funcionário;
- busca sem tipo;
- busca com tipo;
- filtro por data;
- download;
- exclusão confirmada;
- estado sem documentos.

### Task 7.2 — Comandos

```bash
npm run lint
npm run build
```

Executar testes existentes se houver.

### Task 7.3 — Revisão final

Confirmar:

- desktop não é formulário antigo;
- mobile não é desktop encolhido;
- mockups foram respeitados;
- contratos HTTP preservados;
- documentação seguida.
