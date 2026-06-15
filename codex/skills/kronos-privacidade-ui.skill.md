# Skill — Kronos `/privacidade` UI Refactor

## Missão

Refatorar a rota `/privacidade` como **Privacy Rights Center**, preservando contratos HTTP, regras LGPD, componentes de privacidade existentes e comportamento funcional atual.

## Entrada obrigatória

Antes de implementar, leia:

1. `references/docs/kronos_privacidade_diretriz_visual.md`
2. `references/mockups/kronos_privacidade_desktop.png`
3. `references/mockups/kronos_privacidade_mobile.png`
4. `src/pages/PrivacyCenter.tsx`
5. `src/service/lgpd.service.ts`
6. `src/config/api-routes.ts`
7. `src/config/app-routes.ts`
8. `src/components/privacy/*`
9. documentação do `kronos-business` sobre rotas, LGPD e privacidade.

## Resultado esperado

A tela `/privacidade` deve comunicar:

- conformidade LGPD;
- controle do titular;
- governança de consentimento;
- exportação de dados pessoais;
- solicitação de direitos;
- histórico de consentimentos;
- catálogo de tratamento;
- política de privacidade;
- contato com DPO.

## Experiência desktop

Implementar como painel de privacidade:

- sidebar/header existentes preservados;
- hero institucional conforme mockup;
- métricas superiores: direitos, solicitações, consentimento, exportação JSON;
- painel principal com cards de ação:
  - Consentimento biométrico;
  - Exportar meus dados;
  - Nova solicitação LGPD;
  - Histórico de termos;
- lista de solicitações recentes;
- painel lateral de governança:
  - Catálogo de tratamento;
  - Revogação de consentimentos;
  - Política de privacidade;
  - Contato DPO;
- CTAs: `Exportar JSON`, `Criar solicitação`.

## Experiência mobile

Implementar como autoatendimento:

- sem tabela;
- sem replicar a composição desktop;
- topo compacto;
- indicadores resumidos;
- cards verticais para cada direito/ação;
- CTA fixo inferior com ações principais;
- abrir detalhes, formulários e confirmações por modal/bottom sheet ou fluxo dedicado.

## Regras funcionais

- Exportação deve exigir confirmação antes de baixar JSON.
- Exportação deve usar `exportMyData()`.
- Solicitações devem usar `createLgpdRequest()` e `listLgpdRequests()`.
- Histórico deve usar os componentes/serviços existentes de consentimento.
- Consentimento biométrico deve continuar usando `BiometricConsentCard` ou abstração equivalente.
- Revogação deve explicar consequências antes da ação.
- Catálogo deve explicar finalidade, base legal, retenção e sensibilidade.
- DPO deve permanecer facilmente encontrável.

## Regras de segurança

- Não exibir biometria facial ou material biométrico.
- Não expor dados sensíveis além do necessário.
- Não alterar permissões de back-end.
- Não remover confirmação de exportação.
- Não transformar ação destrutiva em clique único.

## Critérios de aceite

- `/privacidade` funciona em desktop e mobile com experiências distintas.
- O build do front-end passa.
- O lint não introduz erros novos.
- A tela preserva exportação, solicitação LGPD, consentimento, histórico, catálogo, política e DPO.
- O legado visual antigo não permanece ativo na rota.
