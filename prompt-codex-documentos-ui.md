# Prompt para Codex CLI — Refatorar `/documentos`

Você é o agente de implementação da nova UI/UX da rota `/documentos` da plataforma Kronos.

## Contexto

A plataforma Kronos é um SaaS corporativo de jornada, ponto eletrônico, documentos, conformidade, LGPD, relatórios legais, colaboradores, empresas e gestão operacional.

A tela `/documentos` deve deixar de ser um formulário simples de busca e passar a ser uma **central de busca documental segura**, com experiências diferentes para desktop e mobile.

## Repositórios obrigatórios

Observe primeiro:

```txt
Back-end:
Kronos-Tech-Solutions-KTS
branch: PROD_HOSTINGER_V2

Front-end:
Kronos-Tech-Solution-User-Plataform
branch: feature/lgpd-compliance-new-ui

Documentação:
kronos-business
branch: main
```

## Referências visuais obrigatórias

Leia antes de implementar:

```txt
kronos_codex_documentos_ui/references/docs/kronos_documentos_diretriz_visual.md
kronos_codex_documentos_ui/references/mockups/kronos_documentos_desktop.png
kronos_codex_documentos_ui/references/mockups/kronos_documentos_mobile.png
```

## Objetivo da implementação

Refatorar a tela `buscar documentos` atualmente na rota:

```txt
/documentos
```

Preservar também compatibilidade com:

```txt
/meus-documentos
```

quando esta rota reutilizar o mesmo componente.

## Arquivos front-end que você deve ler

Leia obrigatoriamente:

```txt
src/pages/Documentos.tsx
src/hooks/useDocumentsPage.ts
src/service/document.service.ts
src/types/document.ts
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
src/components/PageShell.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
```

Leia componentes do design system em `src/components/ui` conforme necessidade, especialmente:

```txt
button
card
input
select
dialog/alert-dialog
badge
skeleton
popover
```

## Arquivos back-end que você deve ler

No back-end, confirme contrato em:

```txt
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/DocumentController.java
src/main/java/com/kts/kronos/domain/model/enuns/DocumentType.java
src/main/java/com/kts/kronos/application/port/in/usecase/DocumentUseCase.java
```

## Documentos do `kronos-business` que você deve ler

```txt
04-mapa-modulos-telas.md
08-rotas-guards-permissoes.md
03-atores-permissoes.md
```

Procure também qualquer menção a documentos, permissões, LGPD, retenção ou dados sensíveis.

## Contratos que devem ser preservados

Não alterar contrato HTTP:

```txt
GET    /documents?employeeId=&date=&type=
GET    /documents/{documentId}?employeeId=
DELETE /documents/{documentId}?employeeId=
GET    /employee?active=
```

A tela atual usa:

```txt
useDocumentsPage
fetchDocuments
downloadDocument
deleteDocument
fetchEmployeesForSelection
```

Preserve essa base. Ajuste apenas o necessário para a nova experiência.

## Nova experiência desktop

Implementar uma tela com comportamento de **Secure Document Vault / console documental**.

A versão desktop deve conter:

1. Sidebar e header.
2. Hero institucional com texto:
   - `Busca documental`;
   - `Encontre documentos trabalhistas com escopo seguro`;
   - explicação sobre colaborador, tipo, status e visibilidade.
3. Cards de escopo:
   - `CTO` — visão administrativa;
   - `MANAGER` — gestão documental;
   - `PARTNER` — acervo próprio.
4. Card principal `Console de busca` com:
   - status funcionário;
   - funcionário;
   - tipo documental;
   - data;
   - resultado/paginação quando aplicável;
   - chips de taxonomia documental;
   - botão `Buscar documentos`;
   - botão `Limpar filtros`.
5. Painel lateral `Resultados` com:
   - lista de documentos;
   - download;
   - exclusão quando permitido;
   - estado vazio;
   - loading;
   - bloco de governança.

## Nova experiência mobile

A versão mobile deve ser uma experiência própria, não o desktop reduzido.

Criar fluxo guiado:

1. Topo:
   - `Documentos`;
   - `Busca segura`;
   - badge da role.

2. Card `Escopo atual`:
   - role;
   - escopo;
   - restrição aplicada.

3. Card `1. Tipo de documento`:
   - chips/toggles de tipo documental.

4. Card `2. Filtros`:
   - data opcional;
   - funcionário bloqueado para `PARTNER`;
   - seleção de funcionário para roles permitidas, se couber no mobile.

5. Card `3. Resultados`:
   - cards de documento;
   - ação de download;
   - exclusão apenas quando permitida.

6. Rodapé fixo:
   - resumo;
   - `PDF/arquivo`;
   - `Seguro`;
   - botão `Buscar documentos`.

## Regras por ROLE

### CTO

- Mostrar comunicação visual de escopo administrativo.
- Pode selecionar funcionário se o backend/serviço atual permitir.
- Pode buscar por tipo e data.
- Pode baixar e excluir quando backend permitir.

### MANAGER

- Mostrar visão gerencial do tenant/equipe.
- Seleciona funcionário permitido.
- Pode baixar e excluir quando backend permitir.

### PARTNER

- Não pode selecionar outro funcionário.
- Deve ver `Documentos próprios`.
- Funcionário fica bloqueado pela sessão.
- Pode buscar tipo e data.
- Pode baixar documentos próprios.
- Não exibir controles de troca de colaborador.

## Tipos documentais obrigatórios

A UI deve contemplar:

```txt
PAYSLIP — Contracheque
TIME_OFF — Abono de Horas
DOCUMENTS — Documentos
EMPLOYEE_DOCUMENTS — Documentos Pessoais
POINT_RECORD_RECEIPT — Comprovante de Ponto
BIOMETRIC_CONSENT_TERM — Termo de Consentimento Biométrico
SERVICE_CONTRACT_TERMS — Termo de Contrato de Serviço
```

## Estados obrigatórios

Implemente ou preserve:

- sem funcionário selecionado;
- sem tipo documental;
- carregando funcionários;
- buscando documentos;
- sem documentos;
- com documentos;
- erro de busca;
- download iniciado;
- exclusão confirmada;
- exclusão cancelada.

## Segurança visual e LGPD

A tela deve comunicar:

- documentos são dados sensíveis;
- download e exclusão são ações controladas;
- exclusão é destrutiva;
- partner tem acervo próprio;
- manager/CTO dependem de escopo e permissão.

Não exibir conteúdo interno dos documentos.

## Acessibilidade

Obrigatório:

- `aria-label` em botões somente com ícone;
- botões com toque mínimo de 44px no mobile;
- foco visível;
- status com texto, não só cor;
- confirmação destrutiva acessível;
- mensagens de loading/erro legíveis.

## Implementação sugerida

Você pode criar componentes em:

```txt
src/features/documents/components/
```

Sugestão:

```txt
DocumentsDesktopView.tsx
DocumentsMobileView.tsx
DocumentScopeCards.tsx
DocumentTypeChips.tsx
DocumentResultsPanel.tsx
DocumentDeleteDialog.tsx
```

Ou manter subcomponentes no próprio `Documentos.tsx` se o arquivo continuar legível.

## Validação

Execute:

```bash
npm run lint
npm run build
```

Execute testes existentes se houver.

## Entrega esperada

Ao finalizar, responda com:

1. arquivos alterados;
2. resumo da nova UX desktop;
3. resumo da nova UX mobile;
4. contratos preservados;
5. validações executadas;
6. pendências.
