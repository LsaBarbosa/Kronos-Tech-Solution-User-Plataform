# Prompt para Codex CLI — Refatorar `/privacidade`

Você está atuando no projeto Kronos.

## Contexto obrigatório

Observe primeiro os repositórios e branches:

- Back-end: `LsaBarbosa/Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Front-end: `LsaBarbosa/Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Documentação: `LsaBarbosa/kronos-business`, branch `main`.

A documentação `kronos-business` é o norteador funcional e de negócio.

## Objetivo

Refatorar a tela de **privacidade** atualmente na rota:

```text
/privacidade
```

A tela deve deixar de ser uma página longa e empilhada de componentes LGPD e passar a funcionar como um **Privacy Rights Center**.

A nova tela deve ter duas experiências distintas:

1. **Desktop:** centro de direitos e governança, com hero, métricas, painel de ações, solicitações recentes e painel lateral.
2. **Mobile:** autoatendimento por cards, fluxo vertical, ações grandes e CTA fixo inferior.

A versão mobile não deve ser apenas a versão desktop redimensionada.

## Referências visuais obrigatórias

Leia antes de implementar:

```text
references/docs/kronos_privacidade_diretriz_visual.md
references/mockups/kronos_privacidade_desktop.png
references/mockups/kronos_privacidade_mobile.png
```

Use os mockups como direção visual e a diretriz como regra de negócio.

## Arquivos que você deve ler no front-end

Leia obrigatoriamente:

```text
src/App.tsx
src/config/app-routes.ts
src/config/api-routes.ts
src/pages/PrivacyCenter.tsx
src/service/lgpd.service.ts
src/context/AuthContext.tsx
src/components/privacy/BiometricConsentCard.tsx
src/components/privacy/LgpdRequestForm.tsx
src/components/privacy/LgpdRequestsList.tsx
src/components/privacy/ConsentHistoryCard.tsx
src/components/privacy/RevocationInfoCard.tsx
src/components/privacy/DPOContactCard.tsx
src/components/privacy/PrivacyPolicyCard.tsx
src/components/privacy/DataProcessingCatalogCard.tsx
src/components/privacy/ExportConfirmationModal.tsx
src/components/privacy/ExportManifestDisplay.tsx
```

Também pesquise por usos desses componentes antes de remover qualquer arquivo.

## Arquivos que você deve observar no back-end

Leia/consulte:

```text
src/main/java/com/kts/kronos/adapter/in/web/http/LgpdController.java
src/main/java/com/kts/kronos/adapter/in/web/http/TermsController.java
src/main/java/com/kts/kronos/constants/ApiPaths.java
```

Confirme os contratos:

```text
POST   /lgpd/requests
GET    /lgpd/requests
GET    /lgpd/me/export
GET    /lgpd/processing-catalog
GET    /terms/status
GET    /terms/biometric/current
POST   /terms/accept-biometric
DELETE /terms/revoke-biometric
GET    /terms/consents/history
```

Não altere esses contratos.

## Arquitetura recomendada

Pode criar uma pasta de componentes dedicada:

```text
src/components/privacy-center/
├── PrivacyDesktop.tsx
├── PrivacyMobile.tsx
├── PrivacyHero.tsx
├── PrivacyMetricStrip.tsx
├── PrivacyActionCard.tsx
├── PrivacyGovernancePanel.tsx
├── PrivacyRecentRequests.tsx
├── PrivacyMobileActionList.tsx
└── PrivacyStickyActionBar.tsx
```

Mantenha a lógica principal em `PrivacyCenter.tsx` ou em hook dedicado somente se isso reduzir complexidade.

## Funcionalidades que devem permanecer

Preserve:

- exportação de dados pessoais via `exportMyData()`;
- confirmação antes da exportação;
- download do JSON;
- exibição do manifesto de exportação;
- criação de solicitação LGPD;
- listagem/refresh de solicitações;
- consentimento biométrico;
- histórico de termos;
- informações de revogação;
- catálogo de tratamento;
- política de privacidade;
- contato DPO.

## Desktop — implementação esperada

Crie uma tela com:

- header/sidebar existentes;
- hero institucional com título `Controle seus dados pessoais e direitos LGPD`;
- subtítulo sobre consentimento biométrico, exportação, solicitações, histórico, revogação, catálogo e DPO;
- métricas: `12 direitos`, `3 solicitações`, `1 consentimento`, `JSON exportação`;
- card/painel principal `Painel do titular`;
- cards:
  - `Consentimento biométrico`;
  - `Exportar meus dados`;
  - `Nova solicitação LGPD`;
  - `Histórico de termos`;
- lista de `Solicitações recentes`;
- painel lateral `Governança e transparência`;
- blocos:
  - `Catálogo de tratamento`;
  - `Revogação de consentimentos`;
  - `Política de privacidade`;
  - `Contato DPO`;
- botões finais `Exportar JSON` e `Criar solicitação`.

## Mobile — implementação esperada

Crie uma experiência mobile com:

- topo compacto `Privacidade`;
- subtítulo `LGPD`;
- título `Meus dados`;
- métricas: `12 direitos`, `3 pedidos`, `JSON exportar`;
- cards verticais:
  - `Consentimento biométrico`;
  - `Exportar meus dados`;
  - `Solicitação LGPD`;
  - `Histórico de termos`;
- card de aviso `DPO e política`;
- rodapé fixo com:
  - texto `Próxima ação`;
  - botão `Exportar`;
  - botão `Solicitar direito`.

## Regras de UX

- Exportação exige confirmação.
- Solicitações LGPD devem ter status textual.
- Consentimento biométrico deve indicar estado atual.
- Revogação deve explicar consequência.
- Catálogo deve explicar finalidade, base legal, retenção e sensibilidade.
- DPO deve ser facilmente encontrável.
- Mobile deve priorizar ações por cards.
- Desktop deve permitir leitura de governança e ações simultaneamente.

## Regras de segurança

- Não exibir material biométrico.
- Não criar atalhos destrutivos sem confirmação.
- Não alterar permissões.
- Não alterar endpoints.
- Não vazar dados pessoais sensíveis em métricas falsas.
- Não remover confirmação de exportação.

## Remoção do legado

Depois que a nova UI estiver implementada e validada:

- remova o layout antigo empilhado da rota `/privacidade`;
- remova imports mortos;
- remova estados sem uso;
- remova componentes novos temporários ou duplicados;
- mantenha componentes compartilhados ainda usados.

## Validação obrigatória

Execute:

```bash
npm run lint
npm run build
```

Se existirem testes configurados, execute também:

```bash
npm test
```

## Entrega esperada

Ao finalizar, reporte:

- arquivos alterados;
- componentes criados;
- contratos preservados;
- comandos executados;
- resultado dos comandos;
- pendências ou limitações.
