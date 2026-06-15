# Prompt para Codex CLI — Kronos `/enviar-documento-colaborador`

Você deve atuar no projeto Kronos como agente de implementação e revisão da nova UI/UX da rota `/enviar-documento-colaborador`.

## 1. Repositórios e branches

Use:

```text
Back-end:
repo: Kronos-Tech-Solutions-KTS
branch: PROD_HOSTINGER_V2

Front-end:
repo: Kronos-Tech-Solution-User-Plataform
branch: feature/lgpd-compliance-new-ui

Documentação:
repo: kronos-business
branch: main
```

## 2. Objetivo

Refatorar a tela `enviar documentos` atualmente na rota:

```text
/enviar-documento-colaborador
```

A nova tela deve ser um **cofre de envio documental seguro**, com duas experiências reais:

- desktop: console de upload;
- mobile: fluxo guiado.

Não basta redimensionar o mesmo layout.

## 3. Arquivos de referência obrigatórios

Leia antes de implementar:

```text
references/docs/kronos_enviar_documentos_diretriz_visual.md
references/mockups/kronos_enviar_documentos_desktop.png
references/mockups/kronos_enviar_documentos_mobile.png
```

## 4. Arquivos do front-end que você deve ler

```text
src/App.tsx
src/config/app-routes.ts
src/pages/DocumentoColaborador.tsx
src/pages/EnviarDocumentos.tsx
src/hooks/useCollaboratorDocumentUpload.ts
src/hooks/useDocumentUpload.ts
src/service/document.service.ts
src/types/document.ts
src/context/AuthContext.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/*
```

## 5. Arquivos do back-end que você deve ler

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/DocumentController.java
src/main/java/com/kts/kronos/domain/model/enuns/DocumentType.java
```

## 6. Arquivos da documentação que você deve ler

```text
kronos-business/04-mapa-modulos-telas.md
```

## 7. Ponto crítico sobre a rota

O front-end possui:

```text
/enviar-documentos             -> EnviarDocumentos
/enviar-documento-colaborador  -> DocumentoColaborador
```

A tarefa atual é a rota:

```text
/enviar-documento-colaborador
```

Logo, o alvo principal é:

```text
src/pages/DocumentoColaborador.tsx
```

Não implemente na tela errada.

## 8. Contrato HTTP que deve ser preservado

Não altere o back-end e não altere o contrato:

```http
POST /documents?employeeId=<uuid>&type=<DocumentType>
Content-Type: multipart/form-data

file=<arquivo>
```

O service atual `uploadDocument(file, employeeId, type)` deve continuar funcionando.

## 9. Regras visuais e funcionais

Implemente conforme a diretriz:

- Tipo padrão esperado: `EMPLOYEE_DOCUMENTS`.
- Máximo: 5MB.
- Aceitos: PDF, JPG, JPEG, PNG.
- Imagens podem ser comprimidas antes do envio.
- Sem arquivo ou sem destinatário: CTA desabilitado.
- Arquivo inválido: erro vermelho próximo ao campo.
- Envio em andamento: loading no CTA.
- Sucesso: limpar arquivo e mostrar confirmação.

## 10. ROLE

### PARTNER

- Não pode selecionar outro colaborador.
- Destinatário é o próprio colaborador da sessão.
- Mostrar card: `Destino: próprio perfil`.

### MANAGER

- Pode selecionar colaborador permitido.
- Mostrar contexto: envio operacional para equipe/tenant.

### CTO

- Comunicar escopo administrativo.
- Se o front atual não permite CTO selecionar colaborador, não force alteração sem confirmar permissão existente; mantenha compatibilidade.

## 11. Desktop

Construir experiência desktop com:

- Sidebar.
- Header/breadcrumb.
- Hero grande.
- Cards CTO/MANAGER/PARTNER.
- Card `Cofre de envio`.
- Etapas:
  1. Destinatário.
  2. Arquivo.
  3. Validação.
- Dropzone.
- Botões:
  - `Enviar documento`;
  - `Limpar arquivo`.
- Painel lateral:
  - preview do arquivo;
  - validações;
  - governança por ROLE;
  - resultado esperado.

## 12. Mobile

Construir experiência mobile com:

- topo compacto;
- card `Escopo atual`;
- etapas empilhadas;
- box de formatos permitidos;
- rodapé fixo com resumo e CTA;
- sem tabela;
- sem sidebar;
- alvo mínimo de toque de 44px.

## 13. Remoção do legado

Depois de implementar:

- remova o card antigo de upload simples;
- remova instruções genéricas antigas;
- remova imports não usados;
- remova duplicações desnecessárias;
- deixe somente a nova implementação.

## 14. Validação

Execute:

```bash
npm run lint
npm run build
```

Se houver testes:

```bash
npm test
```

## 15. Entrega esperada

No final, responda com:

- arquivos alterados;
- comandos executados;
- comportamento validado;
- contrato preservado;
- riscos ou pendências.
