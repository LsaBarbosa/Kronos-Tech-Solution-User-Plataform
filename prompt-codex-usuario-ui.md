Você é o agente de execução técnica do projeto Kronos.

## Objetivo

Refatore a rota `/usuario` no front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, criando uma nova tela de perfil do próprio usuário com duas experiências distintas:

1. **Desktop:** painel de gestão pessoal.
2. **Mobile:** app de autoatendimento.

A nova tela deve representar a central de:

- identidade profissional;
- segurança da conta;
- privacidade biométrica;
- LGPD;
- histórico de evidências;
- exportação de dados.

Não implemente apenas um redimensionamento responsivo. Desktop e mobile precisam ter navegação, densidade e fluxo próprios.

## Repositórios

Use os caminhos locais abaixo. Se forem diferentes, descubra ou pergunte antes de modificar.

```text
<BACKEND_REPO>  = /home/kronos/Documentos/Codigin/kronos/Kronos-Tech-Solutions-KTS/
<FRONTEND_REPO> = /home/kronos/Documentos/Codigin/kronos/Kronos-Tech-Solution-User-Plataform/
<DOCS_REPO>     = /home/kronos/Documentos/Codigin/kronos/kronos-business/
```

Branches obrigatórias:

```bash
git -C <BACKEND_REPO> checkout PROD_HOSTINGER_V2
git -C <FRONTEND_REPO> checkout feature/lgpd-compliance-new-ui
git -C <DOCS_REPO> checkout main
```

## Fase 0 — Leitura obrigatória sem alteração

Antes de modificar qualquer arquivo, leia e resuma internamente os arquivos abaixo.

### Documentação

No repositório `kronos-business`, branch `main`, leia:

- `05-fluxos-front-end.md`;
- documentos de regras de negócio;
- documentos de fluxos da aplicação;
- documentos de entidades;
- documentos de entradas e saídas;
- qualquer arquivo relacionado a usuário, colaborador, perfil, senha, consentimento, biometria, privacidade e LGPD.

Leia também a diretriz visual:

- `kronos_usuario_diretriz_visual.md`.

Use os mockups como referência visual:

- `kronos_usuario_desktop.png`;
- `kronos_usuario_mobile.png`.

### Back-end

No repositório `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`, leia:

- `build.gradle`;
- `src/main/java/com/kts/kronos/constants/ApiPaths.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/EmployeeController.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/TermsController.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/LgpdController.java`;
- DTOs:
  - `EmployeeDetailResponse`;
  - `UpdateEmployeePartnerRequest`;
  - `UserResponse`;
  - `ChangePasswordRequest`;
  - `BiometricConsentStatusResponse`;
  - `ConsentHistoryResponse`;
  - `LgpdEmployeeExportResponse`.

### Front-end

No repositório `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, leia:

- `package.json`;
- `src/App.tsx`;
- `src/config/app-routes.ts`;
- `src/config/api-routes.ts`;
- `src/config/api.ts`;
- `src/pages/Usuario.tsx`;
- `src/hooks/useUser.ts`;
- `src/service/user.service.ts`;
- `src/service/session-profile.service.ts`;
- `src/service/terms.service.ts`;
- `src/service/lgpd.service.ts`;
- `src/types/user.ts`;
- `src/types/legal.ts`;
- `src/components/Header.tsx`;
- `src/components/Sidebar.tsx`;
- `src/components/privacy/BiometricConsentCard.tsx`;
- `src/components/privacy/RevokeBiometricConsentDialog.tsx`;
- componentes disponíveis em `src/components/ui`.

Ao terminar a leitura, produza um resumo no terminal:

```text
Resumo de leitura:
- contratos confirmados:
- arquivos front-end críticos:
- regras LGPD:
- restrições de edição:
- riscos:
- plano de implementação:
```

Não modifique arquivos antes desse resumo.

## Contratos HTTP obrigatórios

Preserve os contratos existentes. A nova UI deve consumir os mesmos endpoints:

```text
GET    /users/own-profile
GET    /employee/own-profile
PATCH  /employee/update-own-profile
PUT    /users/password
GET    /terms/status
GET    /terms/biometric/current
GET    /terms/consents/history
DELETE /terms/revoke-biometric
GET    /lgpd/me/export
GET    /lgpd/processing-catalog
POST   /lgpd/requests       # somente se precisar criar solicitação formal
```

Não altere o back-end, salvo se encontrar incompatibilidade real que impossibilite a tela. Se isso ocorrer, pare, descreva o problema e proponha correção mínima.

## Regras de negócio obrigatórias

A tela `/usuario` deve permitir:

- consultar dados do próprio usuário;
- consultar dados funcionais do próprio colaborador;
- editar e-mail;
- editar telefone;
- alterar senha;
- consultar status do consentimento biométrico;
- consultar histórico de consentimentos;
- exportar dados LGPD próprios;
- revogar biometria com confirmação.

A tela `/usuario` não pode permitir edição de:

- empresa;
- role/papel;
- salário;
- status ativo;
- escala;
- biometria administrativa;
- dados de outro colaborador.

## Regras de segurança e LGPD

- CPF sempre mascarado.
- Remuneração mascarada ou protegida por padrão.
- Biometria facial nunca aparece.
- Hash completo não aparece; usar resumo curto se necessário.
- Não fazer `console.log` de dados pessoais, senha, token, exportação LGPD ou payload biométrico.
- Revogação biométrica deve ser ação destrutiva com confirmação.
- Troca de senha deve avisar que a sessão será encerrada.
- Exportação LGPD não deve despejar o JSON completo na tela principal.

## Diretriz visual

Use esta paleta:

```text
Azul Profundo: #102A43
Azul Petróleo: #1F4E5F
Ciano Tech: #22B8CF
Teal Confiança: #1C8C7C
Fundo Claro: #F5F8FB
Superfície: #FFFFFF
Borda Fria: #D8E2EC
Texto Secundário: #627D98
Risco: #D64545
LGPD/Rastreabilidade: #635BFF
```

O visual deve transmitir:

- SaaS corporativo premium;
- tecnologia;
- segurança;
- precisão;
- conformidade;
- gestão de jornada;
- confiança.

Cards devem ter cantos entre 20px e 28px, sombras suaves e acentos sóbrios.

## Arquitetura front-end desejada

Mantenha `src/pages/Usuario.tsx` como entrypoint da rota, mas mova a complexidade para `src/features/user-profile`.

Crie, se fizer sentido:

```text
src/features/user-profile/components/UsuarioDesktopView.tsx
src/features/user-profile/components/UsuarioMobileView.tsx
src/features/user-profile/components/UserProfileShell.tsx
src/features/user-profile/components/UserIdentityHero.tsx
src/features/user-profile/components/ProfessionalIdentityCard.tsx
src/features/user-profile/components/EditableContactCard.tsx
src/features/user-profile/components/SecurityPasswordCard.tsx
src/features/user-profile/components/PrivacyLgpdPanel.tsx
src/features/user-profile/components/ConsentEvidenceList.tsx
src/features/user-profile/components/LgpdExportAction.tsx
src/features/user-profile/components/MobileSectionChips.tsx
src/features/user-profile/components/MobileBottomNavigation.tsx
src/features/user-profile/components/MobileEditContactSheet.tsx
src/features/user-profile/components/MobilePasswordFlowSheet.tsx
src/features/user-profile/components/SensitiveActionConfirmDialog.tsx
src/features/user-profile/hooks/useUsuarioProfileViewModel.ts
src/features/user-profile/hooks/useUsuarioResponsiveMode.ts
src/features/user-profile/hooks/useUsuarioPrivacyActions.ts
src/features/user-profile/mappers/usuario-profile.mapper.ts
src/features/user-profile/utils/mask-sensitive-data.ts
src/features/user-profile/utils/usuario-profile-formatters.ts
src/features/user-profile/styles/usuario-profile.tokens.ts
```

A estrutura pode variar, mas se variar explique por quê.

## Experiência desktop obrigatória

Implemente desktop como painel de gestão pessoal:

- sidebar persistente;
- header superior;
- hero com nome, cargo/papel e status;
- cards de resumo;
- grid de identidade profissional;
- contato editável;
- segurança em bloco próprio;
- LGPD e biometria em painel visível;
- ações próximas ao contexto;
- densidade média/alta.

## Experiência mobile obrigatória

Implemente mobile como app de autoatendimento:

- sem sidebar;
- header compacto;
- card superior com avatar, nome, papel e status;
- chips horizontais: Identidade, Contato, Senha, LGPD;
- cards empilhados;
- bottom navigation fixa;
- edição por bottom sheet ou etapa dedicada;
- senha por fluxo dedicado;
- revogação biométrica em confirmação separada;
- botões com mínimo 44px.

## Implementação por etapas

### Etapa 1 — Base

1. Crie a estrutura `src/features/user-profile`.
2. Crie mappers e formatadores.
3. Adicione testes para máscaras/formatadores.
4. Faça `src/pages/Usuario.tsx` renderizar a nova feature.

### Etapa 2 — View-model

1. Centralize dados de:
   - conta;
   - perfil;
   - termo biométrico;
   - histórico de consentimentos;
   - exportação LGPD.
2. Preserve services existentes.
3. Separe loading por ação:
   - carregar perfil;
   - salvar contato;
   - trocar senha;
   - carregar consentimentos;
   - exportar dados;
   - revogar biometria.

### Etapa 3 — Desktop

1. Crie layout desktop completo.
2. Implemente cards.
3. Garanta mascaramento.
4. Integre ações.

### Etapa 4 — Mobile

1. Crie layout mobile próprio.
2. Implemente chips e bottom navigation.
3. Implemente sheets/fluxos dedicados.
4. Teste em larguras mobile.

### Etapa 5 — Privacidade

1. Exiba status do termo.
2. Exiba histórico resumido de consentimentos.
3. Implemente exportação LGPD própria.
4. Preserve revogação biométrica.

### Etapa 6 — Remover legado

1. Remova JSX antigo da tela `/usuario`.
2. Remova imports mortos.
3. Remova utilitários obsoletos exclusivos da antiga tela.
4. Não remova serviços compartilhados.

### Etapa 7 — Validar

Execute:

```bash
cd <FRONTEND_REPO>
npm run lint
npm run test
npm run build
```

Se algum comando falhar por problema pré-existente, documente com evidência. Se falhar por alteração feita nesta tarefa, corrija.

## Critérios de aceite

A tarefa só termina quando:

- `/usuario` abre em desktop;
- `/usuario` abre em mobile;
- desktop e mobile têm experiências distintas;
- e-mail edita e salva;
- telefone edita e salva;
- senha valida, envia e trata encerramento de sessão;
- status biométrico aparece;
- histórico de consentimentos é acessível;
- exportação LGPD própria é acessível;
- revogação biométrica exige confirmação;
- CPF e remuneração ficam mascarados/protegidos;
- nenhuma biometria facial aparece;
- não há logs sensíveis;
- legado visual antigo foi removido;
- lint passa;
- build passa;
- testes passam ou limitação é documentada.

## Relatório final obrigatório

Ao concluir, responda com:

```text
Implementação concluída

Arquivos criados:
-

Arquivos alterados:
-

Arquivos removidos:
-

Contratos usados:
-

Testes executados:
- lint:
- test:
- build:

Validação visual:
- desktop:
- mobile:

Riscos/pêndencias:
-
```

Execute agora seguindo as fases acima.
