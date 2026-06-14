# Skill — Kronos `/usuario` Identity, Security & Privacy UI

## 1. Missão

Refatorar a rota `/usuario` do front-end Kronos para deixar de ser uma página cadastral simples e passar a atuar como uma central de:

1. identidade profissional;
2. segurança da conta;
3. privacidade, LGPD e consentimento biométrico.

A implementação deve respeitar a arquitetura atual do front-end, os contratos HTTP existentes no back-end e as regras de negócio documentadas no repositório `kronos-business`.

## 2. Escopo funcional

### Dentro do escopo

- Manter a rota `/usuario`.
- Refatorar a tela atual `src/pages/Usuario.tsx`.
- Criar duas experiências reais:
  - desktop: painel de gestão pessoal;
  - mobile: app de autoatendimento.
- Consumir dados existentes:
  - conta do usuário;
  - perfil do colaborador;
  - alteração de e-mail;
  - alteração de telefone;
  - alteração de senha;
  - status de termo biométrico;
  - histórico de consentimentos;
  - exportação LGPD própria;
  - catálogo LGPD, se útil para resumo.
- Usar os mockups:
  - `kronos_usuario_desktop.png`;
  - `kronos_usuario_mobile.png`.
- Usar a diretriz:
  - `kronos_usuario_diretriz_visual.md`.
- Remover legado visual após a nova implementação estar validada.
- Garantir build, lint e testes.

### Fora do escopo

- Não criar novo contrato HTTP.
- Não alterar regra de negócio no back-end.
- Não permitir alteração de salário, papel, status, biometria administrativa, empresa ou escala.
- Não expor biometria facial, token, CPF completo, salário sem máscara ou dados sensíveis em log.
- Não transformar a versão mobile em simples redimensionamento do desktop.

## 3. Repositórios e branches

```bash
# Back-end
git -C <BACKEND_REPO> checkout PROD_HOSTINGER_V2
git -C <BACKEND_REPO> pull

# Front-end
git -C <FRONTEND_REPO> checkout feature/lgpd-compliance-new-ui
git -C <FRONTEND_REPO> pull

# Documentação
git -C <DOCS_REPO> checkout main
git -C <DOCS_REPO> pull
```

## 4. Leitura obrigatória antes de modificar código

### Documentação

No repositório `kronos-business`, branch `main`, ler:

- `05-fluxos-front-end.md`;
- documentação de regras de negócio;
- documentação de fluxos de aplicação;
- documentação de entidades;
- documentação de entradas e saídas;
- qualquer documento relacionado a LGPD, termos, perfil, usuários e colaboradores.

Também ler o arquivo de diretriz visual:

- `kronos_usuario_diretriz_visual.md`.

### Front-end

No repositório `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, ler:

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
- componentes existentes em `src/components/ui`.

### Back-end

No repositório `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`, ler:

- `build.gradle`;
- `src/main/java/com/kts/kronos/constants/ApiPaths.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/EmployeeController.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/UserController.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/TermsController.java`;
- `src/main/java/com/kts/kronos/adapter/in/web/http/LgpdController.java`;
- DTOs de:
  - `EmployeeDetailResponse`;
  - `UpdateEmployeePartnerRequest`;
  - `UserResponse`;
  - `ChangePasswordRequest`;
  - `BiometricConsentStatusResponse`;
  - `ConsentHistoryResponse`;
  - `LgpdEmployeeExportResponse`.

## 5. Contratos HTTP que devem ser preservados

| Bloco da tela | Método | Endpoint | Observação |
|---|---:|---|---|
| Conta | `GET` | `/users/own-profile` | Dados básicos da conta: `userId`, `username`, `role`, `active`, `employeeId`. |
| Perfil | `GET` | `/employee/own-profile` | Dados funcionais e pessoais do colaborador. |
| Contato | `PATCH` | `/employee/update-own-profile` | Apenas campos autorizados: e-mail, telefone e endereço. |
| Senha | `PUT` | `/users/password` | Troca senha, expira cookie e invalida sessão. |
| Termo biométrico | `GET` | `/terms/status` | Status versionado do consentimento. |
| Termo atual | `GET` | `/terms/biometric/current` | Versão e hash do texto legal atual. |
| Histórico de consentimentos | `GET` | `/terms/consents/history` | Evidências versionadas. |
| Revogação biométrica | `DELETE` | `/terms/revoke-biometric` | Ação sensível, exige confirmação e encerra sessão. |
| Exportação LGPD própria | `GET` | `/lgpd/me/export` | Exporta dados do titular autenticado. |
| Requisição LGPD | `POST` | `/lgpd/requests` | Usar somente se a UI criar solicitação formal. |
| Catálogo LGPD | `GET` | `/lgpd/processing-catalog` | Pode ser usado no painel de privacidade. |

## 6. Arquitetura sugerida no front-end

Manter `src/pages/Usuario.tsx` como entrypoint da rota, mas mover a complexidade para uma feature isolada.

Estrutura sugerida:

```text
src/
├── pages/
│   └── Usuario.tsx
├── features/
│   └── user-profile/
│       ├── components/
│       │   ├── UsuarioDesktopView.tsx
│       │   ├── UsuarioMobileView.tsx
│       │   ├── UserProfileShell.tsx
│       │   ├── UserIdentityHero.tsx
│       │   ├── ProfessionalIdentityCard.tsx
│       │   ├── EditableContactCard.tsx
│       │   ├── SecurityPasswordCard.tsx
│       │   ├── PrivacyLgpdPanel.tsx
│       │   ├── ConsentEvidenceList.tsx
│       │   ├── LgpdExportAction.tsx
│       │   ├── MobileSectionChips.tsx
│       │   ├── MobileBottomNavigation.tsx
│       │   ├── MobileEditContactSheet.tsx
│       │   ├── MobilePasswordFlowSheet.tsx
│       │   └── SensitiveActionConfirmDialog.tsx
│       ├── hooks/
│       │   ├── useUsuarioProfileViewModel.ts
│       │   ├── useUsuarioResponsiveMode.ts
│       │   └── useUsuarioPrivacyActions.ts
│       ├── mappers/
│       │   └── usuario-profile.mapper.ts
│       ├── utils/
│       │   ├── mask-sensitive-data.ts
│       │   └── usuario-profile-formatters.ts
│       ├── styles/
│       │   └── usuario-profile.tokens.ts
│       └── __tests__/
│           ├── usuario-profile.mapper.test.ts
│           ├── mask-sensitive-data.test.ts
│           └── UsuarioProfile.test.tsx
```

A estrutura pode ser ajustada se o projeto já possuir convenções próprias. O princípio obrigatório é separar:

- container de dados;
- apresentação desktop;
- apresentação mobile;
- serviços;
- formatação/máscaras;
- ações sensíveis;
- testes.

## 7. Experiência desktop

Implementar como painel de gestão pessoal.

Elementos obrigatórios:

- sidebar persistente à esquerda;
- header superior com rota, busca ou ação contextual e status de sessão;
- hero institucional com nome, papel, status e mensagem de centralização;
- cards de resumo:
  - campos imutáveis;
  - campos editáveis;
  - segurança;
  - LGPD ativo;
- grid principal:
  - identidade profissional;
  - contato e segurança;
  - privacidade biométrica e LGPD;
- ações visíveis próximas do contexto;
- painel LGPD no rodapé ou seção ampla inferior.

Comportamento esperado:

- dados imutáveis com aparência de leitura, não formulário;
- edição de contato por botão explícito;
- senha em bloco próprio;
- revogação biométrica separada, destrutiva e confirmada;
- exportação de dados com feedback de sucesso/erro.

## 8. Experiência mobile

Implementar como app de autoatendimento.

Elementos obrigatórios:

- sem sidebar;
- header compacto com identidade da plataforma;
- card superior com avatar, nome, papel e status;
- chips horizontais:
  - Identidade;
  - Contato;
  - Senha;
  - LGPD;
- cards empilhados e resumidos;
- bottom navigation fixa;
- ações com alvos de toque de no mínimo 44px;
- edição em bottom sheet ou etapa dedicada;
- troca de senha em fluxo dedicado;
- revogação biométrica em confirmação explícita.

Comportamento esperado:

- leitura rápida;
- navegação por seção;
- pouca densidade visual;
- sem formulário longo comprimido;
- botões grandes;
- mensagens curtas;
- campos sensíveis sempre mascarados.

## 9. Paleta visual obrigatória

| Token | Hex | Uso |
|---|---:|---|
| `--kronos-blue-deep` | `#102A43` | sidebar, texto principal, ações de segurança |
| `--kronos-blue-petrol` | `#1F4E5F` | gradientes institucionais |
| `--kronos-cyan-tech` | `#22B8CF` | foco, acentos, indicadores |
| `--kronos-teal-trust` | `#1C8C7C` | sucesso, conta ativa, conformidade |
| `--kronos-bg` | `#F5F8FB` | fundo geral |
| `--kronos-surface` | `#FFFFFF` | cards e painéis |
| `--kronos-border` | `#D8E2EC` | bordas frias |
| `--kronos-text-secondary` | `#627D98` | labels e textos auxiliares |
| `--kronos-risk` | `#D64545` | ações destrutivas |
| `--kronos-lgpd` | `#635BFF` | LGPD e rastreabilidade |

Usar Tailwind/classes existentes quando possível. Criar tokens locais apenas se o projeto não tiver equivalente.

## 10. Regras de dados sensíveis

- CPF sempre mascarado.
- Remuneração mascarada ou protegida por padrão.
- Biometria nunca exibida.
- Não renderizar base64 facial, chave S3, token JWT ou dados internos de sessão.
- Não registrar payload sensível no console.
- Revogação biométrica exige confirmação.
- Exportação LGPD exige feedback e não deve vazar dados na tela principal.

## 11. Critérios de aceite

### Funcionais

- `/usuario` carrega conta, perfil e consentimento.
- E-mail pode ser editado e salvo.
- Telefone pode ser editado e salvo.
- Senha pode ser alterada e usuário é encaminhado para login/sessão expirada.
- Status biométrico é exibido.
- Histórico de consentimentos é acessível.
- Exportação LGPD própria é acionável.
- Revogação biométrica continua encerrando sessão.

### UX

- Desktop e mobile têm experiências distintas.
- Mobile não usa sidebar.
- Desktop não é apenas mobile ampliado.
- Cards seguem blocos de identidade, contato, segurança e privacidade.
- Ações sensíveis são visualmente separadas.

### Técnicos

- `npm run lint` passa.
- `npm run test` passa, quando houver testes configurados.
- `npm run build` passa.
- Nenhum contrato HTTP é alterado.
- Legado visual da página `/usuario` é removido.
