# Skill — Kronos LGPD Admin Request Details UI

## Missão

Refatorar a tela `/lgpd/admin/requests/:requestId` para uma experiência visual e funcional alinhada ao conceito **LGPD Case Control Room**.

## Escopo

Trabalhar no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.

Componente inicial esperado:

```text
src/components/privacy/AdminLgpdRequestDetails.tsx
```

Serviço principal:

```text
src/service/lgpd.service.ts
```

## Conhecimento de domínio obrigatório

A tela representa o tratamento completo de uma solicitação LGPD administrativa.

Ela deve permitir que `CTO` e `MANAGER`:

- analisem titular, empresa, tipo, status e descrição;
- acompanhem histórico;
- visualizem fluxo de tratamento;
- avancem status com rastreabilidade;
- registrem notas públicas e internas;
- solicitem complemento;
- rejeitem com motivo e nota pública;
- cancelem somente quando permitido;
- aprovem exportação;
- exportem dados revisados com fundamento legal, motivo operacional e notas do revisor;
- consultem ou executem anonimização quando aplicável.

## Arquivos que devem ser lidos antes de implementar

### Documentação e diretriz

```text
references/docs/kronos_lgpd_admin_request_details_diretriz_visual.md
kronos-business/04-mapa-modulos-telas.md
```

### Front-end

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

### Back-end

Ler os controladores e DTOs LGPD no back-end para confirmar contratos:

```text
src/main/java/**/LgpdController.java
src/main/java/**/dto/lgpd/*.java
src/main/java/**/constants/ApiPaths.java
```

## Resultado esperado de arquitetura

Preferir extrair a tela em feature dedicada, preservando compatibilidade com a rota atual:

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

Pode adaptar a estrutura ao padrão real do projeto, desde que o legado seja removido ao final.

## Critérios de qualidade

- Desktop e mobile devem ser experiências distintas.
- Mobile não pode usar tabela.
- Desktop deve priorizar análise, histórico e ação lateral.
- Toda ação sensível deve ter validação e confirmação.
- Estados de loading, erro e não encontrado devem ser explícitos.
- O status deve ser textual e visual.
- A próxima ação deve ser evidente.
- Não vazar dados sensíveis em logs ou storage.
