# Prompt para Codex CLI — Refatorar `/lgpd/admin/requests/:requestId`

Você está atuando no projeto Kronos.

## Repositórios e branches

1. Back-end:
   - Repositório: `Kronos-Tech-Solutions-KTS`
   - Branch: `PROD_HOSTINGER_V2`

2. Front-end:
   - Repositório: `Kronos-Tech-Solution-User-Plataform`
   - Branch: `feature/lgpd-compliance-new-ui`

3. Documentação:
   - Repositório: `kronos-business`
   - Branch: `main`

## Objetivo

Refatorar a tela de detalhes de solicitação LGPD administrativa.

Rota real do React Router:

```text
/lgpd/admin/requests/:requestId
```

O texto de negócio pode chamar a rota de `/lgpd/admin/requests/{id}`, mas no front-end use `:requestId`.

A tela atual é `AdminLgpdRequestDetails`.

O objetivo é transformar a tela em uma experiência nova, com identidade visual Kronos, seguindo o conceito:

```text
LGPD Case Control Room
```

## Referências visuais obrigatórias

Leia antes de implementar:

```text
references/docs/kronos_lgpd_admin_request_details_diretriz_visual.md
references/mockups/kronos_lgpd_admin_request_details_desktop.png
references/mockups/kronos_lgpd_admin_request_details_mobile.png
```

## Arquivos que você deve ler no front-end

```text
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
src/service/lgpd.service.ts
src/types/legal.ts
src/constants/lgpd.constants.ts
src/components/privacy/AdminLgpdRequestDetails.tsx
src/components/privacy/AdminAnonymizationWorkflow.tsx
src/components/layout/AuthenticatedPageLayout.tsx
src/components/PageShell.tsx
src/components/header/*
src/components/ui/*
```

## Arquivos que você deve ler na documentação

```text
kronos-business/04-mapa-modulos-telas.md
```

Confirme:
- `/lgpd/admin/requests/:requestId`;
- `AdminLgpdRequestDetails`;
- roles `CTO` e `MANAGER`;
- services LGPD administrativos.

## Arquivos que você deve ler no back-end

Procure e leia:

```text
LgpdController.java
ApiPaths.java
dto/lgpd/*.java
```

Confirme os contratos:
- `GET /lgpd/admin/requests/{requestId}`;
- `PATCH /lgpd/admin/requests/{requestId}/assign`;
- `POST /lgpd/admin/requests/{requestId}/notes`;
- `POST /lgpd/admin/requests/{requestId}/complete`;
- `POST /lgpd/admin/requests/{requestId}/reject`;
- `POST /lgpd/admin/requests/{requestId}/transition-status`;
- `POST /lgpd/admin/requests/{requestId}/request-complement`;
- `POST /lgpd/admin/requests/{requestId}/cancel`;
- `GET /lgpd/admin/requests/{requestId}/anonymization-result`;
- endpoints de dry-run/apply anonymization;
- endpoint de exportação aprovada.

## Regras funcionais que não podem quebrar

Preserve todos os fluxos atuais:

1. Carregar detalhes da solicitação por `requestId`.
2. Exibir titular, empresa, solicitação, status, descrição e histórico.
3. Exibir responsável quando disponível.
4. Exibir resultado de anonimização quando existir.
5. Exibir fluxo de tratamento.
6. Avançar status via `transitionRequestStatus`.
7. Aprovar exportação apenas com justificativa e escopo.
8. Exportar dados revisados apenas com:
   - fundamento legal;
   - motivo operacional;
   - notas do revisor.
9. Concluir solicitação apenas com nota pública.
10. Rejeitar apenas com motivo e nota pública.
11. Solicitar complemento apenas com mensagem.
12. Cancelar apenas com motivo e quando a role permitir.
13. Para `ANONYMIZATION` e `DELETION`, manter fluxo de anonimização.

## Regras visuais

### Desktop

Criar uma sala de controle:

- hero institucional;
- cards de status, SLA, tipo e exportabilidade;
- coluna principal com dados do caso;
- timeline horizontal do fluxo;
- descrição pública;
- histórico de mudanças;
- resultado de anonimização;
- painel lateral com próxima ação e ações administrativas.

### Mobile

Criar fluxo guiado por cartões:

- topo compacto;
- resumo do titular;
- status/SLA;
- fluxo numerado compacto;
- descrição curta;
- ações disponíveis;
- barra inferior fixa com próxima decisão.

O mobile não deve ser uma tabela e não deve ser apenas resize do desktop.

## Segurança e LGPD

- Não logar payloads sensíveis.
- Não colocar dados pessoais no storage.
- Não remover confirmações.
- Não remover validações de justificativa.
- Não executar ação sensível por clique único sem confirmação.
- Revogar `ObjectURL` após download.
- Evitar exibir dados desnecessários no mobile.

## Arquitetura recomendada

Pode criar:

```text
src/features/lgpd-admin-request-details/
├── AdminLgpdRequestDetailsPage.tsx
├── components/
│   ├── LgpdCaseDesktop.tsx
│   ├── LgpdCaseMobile.tsx
│   ├── LgpdCaseHero.tsx
│   ├── LgpdCaseSummaryCard.tsx
│   ├── LgpdWorkflowTimeline.tsx
│   ├── LgpdCaseHistory.tsx
│   ├── LgpdCaseActionPanel.tsx
│   └── LgpdCaseMobileDecisionBar.tsx
├── hooks/
│   ├── useLgpdCaseDetails.ts
│   └── useLgpdCaseResponsiveMode.ts
├── utils/
│   └── lgpdCaseFormatters.ts
└── __tests__/
    └── lgpdCaseFormatters.test.ts
```

Adapte se o projeto tiver padrão diferente, mas mantenha organização e remova o legado.

## Testes mínimos

Criar ou ajustar testes para:

- helpers de status;
- fluxo por status;
- tipo exportável;
- ação primária por status;
- regra de cancelamento por role;
- validações obrigatórias quando possível.

## Validação obrigatória

Ao final, rode:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Se algum comando falhar por motivo preexistente, registre explicitamente.

## Entrega

No final, deixe:

- implementação refatorada;
- legado removido;
- testes adicionados;
- validações executadas;
- resumo dos arquivos alterados.

Não faça commit.
