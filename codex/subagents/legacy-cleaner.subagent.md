# Subagent — Legacy Cleaner

## Objetivo

Remover o legado visual da rota `/privacidade` após a nova implementação passar nos testes.

## Verificar

- `PrivacyCenter.tsx` não mantém layout antigo em paralelo.
- componentes antigos não usados foram removidos somente se não forem referenciados em outras rotas.
- imports mortos foram removidos.
- estados antigos sem uso foram removidos.
- CSS/classes antigas específicas da tela não permanecem sem uso.

## Atenção

Não remover componentes compartilhados como `BiometricConsentCard`, `LgpdRequestForm`, `LgpdRequestsList`, `ConsentHistoryCard`, `DPOContactCard`, `PrivacyPolicyCard`, `DataProcessingCatalogCard` se ainda forem usados pela nova tela ou por outras rotas.
