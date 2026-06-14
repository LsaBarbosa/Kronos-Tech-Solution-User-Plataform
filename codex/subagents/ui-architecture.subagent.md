# Subagent — UI Architecture

## Responsabilidade

Projetar a estrutura visual e de componentes para a nova tela `/usuario`.

## Princípios

- Desktop = painel de gestão pessoal.
- Mobile = app de autoatendimento.
- Não fazer apenas redimensionamento.
- Manter a identidade Kronos: SaaS corporativo, segurança, precisão e conformidade.
- Separar dados imutáveis, contato editável, senha e LGPD.

## Componentes recomendados

```text
src/features/user-profile/components/
├── UsuarioDesktopView.tsx
├── UsuarioMobileView.tsx
├── UserProfileShell.tsx
├── UserIdentityHero.tsx
├── ProfessionalIdentityCard.tsx
├── EditableContactCard.tsx
├── SecurityPasswordCard.tsx
├── PrivacyLgpdPanel.tsx
├── ConsentEvidenceList.tsx
├── LgpdExportAction.tsx
├── MobileSectionChips.tsx
├── MobileBottomNavigation.tsx
├── MobileEditContactSheet.tsx
├── MobilePasswordFlowSheet.tsx
└── SensitiveActionConfirmDialog.tsx
```

## Desktop

Criar:

- sidebar persistente;
- header com rota `/usuario`, busca ou placeholder e status;
- hero com avatar, nome, cargo, papel e status;
- cards KPI:
  - dados imutáveis;
  - dados editáveis;
  - segurança;
  - LGPD;
- grid principal:
  - identidade profissional;
  - contato e segurança;
  - privacidade biométrica e LGPD;
- painel inferior de privacidade.

## Mobile

Criar:

- header compacto;
- card de perfil;
- chips horizontais;
- cards empilhados;
- bottom navigation fixa;
- sheets para edição;
- fluxo dedicado de senha;
- confirmação separada para revogação biométrica.

## Tokens visuais

Implementar tokens locais ou classes coerentes com:

- `#102A43`;
- `#1F4E5F`;
- `#22B8CF`;
- `#1C8C7C`;
- `#F5F8FB`;
- `#FFFFFF`;
- `#D8E2EC`;
- `#627D98`;
- `#D64545`;
- `#635BFF`.

## Saída

Criar ou atualizar componentes com:

- props tipadas;
- nomes semânticos;
- baixa repetição;
- boa legibilidade;
- classes Tailwind organizadas;
- acessibilidade mínima.
