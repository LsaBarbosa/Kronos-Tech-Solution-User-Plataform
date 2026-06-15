# Prompt para Codex CLI — Refatorar tela `/avisos` / avisos Kronos

Você é o agente de execução do projeto Kronos.

## Contexto obrigatório

Repositórios:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`
- Documentação: `kronos-business`, branch `main`

A tarefa será implementada no front-end.

## Objetivo

Refatorar a tela de avisos, transformando-a em uma **central de comunicação interna**, com duas experiências reais:

- desktop: lista + detalhe lateral + métricas + filtros + ações administrativas;
- mobile: cards + chips + detalhe em modal/drawer + rodapé de permissão.

Não é permitido apenas redimensionar a mesma UI.

## Observação crítica sobre a rota

O pedido menciona `/aviso`, mas o código e a diretriz enviada usam `/avisos`.

Antes de implementar:

1. Leia `src/config/app-routes.ts`.
2. Leia `src/App.tsx`.
3. Confirme a rota canônica.

Se `APP_PATHS.avisos = "/avisos"` existir, refatore `/avisos`.
Não duplique tela em `/aviso`.
Se for necessário suportar `/aviso`, adicione redirect explícito para `/avisos`.

## Leia antes de codar

Referências do pacote:

- `references/docs/kronos_avisos_diretriz_visual.md`
- `references/mockups/kronos_avisos_desktop.png`
- `references/mockups/kronos_avisos_mobile.png`

Arquivos front-end:

- `package.json`
- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/pages/Avisos.tsx`
- `src/pages/CriarAviso.tsx`
- `src/hooks/useMessages.ts`
- `src/service/message.service.ts`
- `src/types/message.ts`
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- `src/components/ui/*`

Arquivos back-end para conferência de contrato, se o repo estiver disponível localmente:

- `src/main/java/com/kts/kronos/constants/ApiPaths.java`
- `src/main/java/com/kts/kronos/adapter/in/web/http/MessageController.java`
- `src/main/java/com/kts/kronos/adapter/in/web/dto/message/CreateMessageRequest.java`
- `src/main/java/com/kts/kronos/adapter/in/web/dto/message/MessageResponse.java`

## Contratos que devem permanecer

- `GET /messages?page=&size=`
- `POST /messages`
- `DELETE /messages/{messageId}`

Payload de criação:

```ts
{
  title: string;
  messageText: string;
  priority: "NORMAL" | "ALERT" | "CRITICAL";
  recipientEmployeeIds: string[];
}
```

Mensagem:

```ts
{
  messageId: string;
  title: string;
  messageText: string;
  priority: "NORMAL" | "ALERT" | "CRITICAL";
  createdAt: string;
  senderEmployeeId: string;
  recipientEmployeeId?: string;
}
```

Se o back-end retornar `senderName`, pode usar. Não depender dele se o tipo local ainda não tiver esse campo.

## Regras de permissão

- `PARTNER`: visualiza avisos recebidos, abre detalhe e pagina. Não cria e não deleta.
- `MANAGER`: pode criar e deletar, se permitido pelo contrato real.
- `CTO`: a diretriz indica permissão administrativa; confira se o back-end/front permitem. Se houver divergência, registre no relatório final e não force contrato inválido.

## UI desktop esperada

Use o mockup desktop como referência visual.

Elementos obrigatórios:

- sidebar persistente;
- header com breadcrumb/contexto;
- hero: “Comunicação interna com prioridade e destinatário”;
- métricas:
  - total de avisos;
  - alertas;
  - críticos;
  - direcionados;
- busca por título ou conteúdo;
- chips de filtro:
  - Todos;
  - Normal;
  - Alerta;
  - Crítico;
- lista ampla de avisos;
- detalhe lateral do aviso selecionado;
- CTA `Novo aviso` quando permitido;
- CTA `Deletar aviso` quando permitido;
- confirmação destrutiva antes de deletar;
- paginação.

## UI mobile esperada

Use o mockup mobile como referência visual.

Elementos obrigatórios:

- topo compacto;
- métricas resumidas;
- busca;
- chips horizontais de prioridade;
- cards empilhados;
- detalhe por modal, drawer ou tela dedicada;
- rodapé fixo com permissão atual;
- `PARTNER` deve ver mensagem de somente leitura;
- toque mínimo 44px.

## Componentização sugerida

Pode manter `src/pages/Avisos.tsx` como orquestrador e criar pasta local:

```text
src/pages/avisos/
├── AvisosDesktopView.tsx
├── AvisosMobileView.tsx
├── NoticeHero.tsx
├── NoticeMetrics.tsx
├── NoticeSearchFilters.tsx
├── NoticeCard.tsx
├── NoticeDetailPanel.tsx
├── NoticePermissionFooter.tsx
├── NoticeDeleteDialog.tsx
└── notice-ui.helpers.ts
```

A estrutura final pode variar, desde que:

- não fique monolítica;
- não duplique regra de negócio;
- seja fácil remover o legado.

## Estados obrigatórios

- carregando;
- erro;
- sem avisos;
- sem resultado no filtro;
- aviso selecionado;
- exclusão em andamento;
- paginação sem próxima/anterior.

## Segurança visual e LGPD

- Não exibir IDs técnicos.
- Não depender somente de cor para prioridade.
- Não deletar sem confirmação.
- Não logar conteúdo de mensagens em console.
- Erros não devem vazar detalhes técnicos.

## Execução

1. Rodar mapeamento.
2. Criar helpers.
3. Criar componentes.
4. Refatorar `Avisos.tsx`.
5. Validar `CriarAviso`.
6. Remover legado.
7. Rodar lint/build.
8. Produzir relatório final.

## Comandos de validação

```bash
npm install
npm run lint
npm run build
```

Se houver testes configurados:

```bash
npm test
```

## Saída final esperada

Responda com:

- arquivos alterados;
- resumo da nova arquitetura;
- como ficou desktop;
- como ficou mobile;
- contratos preservados;
- permissões por ROLE;
- validações executadas;
- divergências encontradas, especialmente `/aviso` vs `/avisos` e `CTO` no endpoint de criação/deleção.
