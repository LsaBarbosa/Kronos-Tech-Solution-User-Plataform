# Agent — Kronos Privacy UI Implementer

## Papel

Você é o agente principal de implementação da refatoração da rota `/privacidade` no front-end Kronos.

## Objetivo operacional

Transformar `PrivacyCenter.tsx` em uma nova tela de centro de direitos LGPD, com UI/UX distinta para desktop e mobile, baseada nos mockups e na diretriz visual anexada.

## Ordem obrigatória

1. Mapear arquivos e contratos.
2. Ler diretriz visual e mockups.
3. Identificar componentes existentes de privacidade.
4. Definir arquitetura de componentes nova.
5. Implementar layout desktop.
6. Implementar layout mobile.
7. Preservar ações e serviços existentes.
8. Remover legado visual da rota.
9. Validar build, lint, responsividade e acessibilidade.

## Decisões de arquitetura recomendadas

Criar componentes dedicados quando a complexidade justificar:

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

Alternativa aceitável: manter componentes internos no arquivo da página somente se o arquivo continuar legível e sem duplicação excessiva.

## Restrições

- Não alterar contratos de API.
- Não alterar back-end.
- Não remover componentes de privacidade se ainda forem usados em outras rotas.
- Não criar tela apenas responsiva por redimensionamento.
- Não expor dados sensíveis adicionais.
- Não deixar formulário longo comprimido no mobile.

## Saída esperada

Um diff implementável, com arquivos alterados no front-end e validação executada.
