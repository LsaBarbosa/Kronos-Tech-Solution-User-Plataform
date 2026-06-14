# Plano de ação — Refatoração da rota `/usuario`

## ÉPICO 01 — Preparação e entendimento

### História 01.01 — Confirmar branches e ambiente

**Objetivo:** garantir que os três repositórios estão nas branches corretas.

**Tasks:**

1. Confirmar back-end:
   ```bash
   git -C <BACKEND_REPO> checkout PROD_HOSTINGER_V2
   git -C <BACKEND_REPO> pull
   ```
2. Confirmar front-end:
   ```bash
   git -C <FRONTEND_REPO> checkout feature/lgpd-compliance-new-ui
   git -C <FRONTEND_REPO> pull
   ```
3. Confirmar documentação:
   ```bash
   git -C <DOCS_REPO> checkout main
   git -C <DOCS_REPO> pull
   ```
4. No front-end:
   ```bash
   npm install
   npm run lint
   npm run build
   ```

**Critério de aceite:** ambiente compila antes de mudanças ou falhas pré-existentes são documentadas.

---

### História 01.02 — Mapear contratos e regras

**Objetivo:** documentar quais dados a tela pode consumir e alterar.

**Tasks:**

1. Ler no back-end:
   - `ApiPaths.java`;
   - `EmployeeController.java`;
   - `UserController.java`;
   - `TermsController.java`;
   - `LgpdController.java`.

2. Confirmar endpoints:
   - `GET /users/own-profile`;
   - `GET /employee/own-profile`;
   - `PATCH /employee/update-own-profile`;
   - `PUT /users/password`;
   - `GET /terms/status`;
   - `GET /terms/biometric/current`;
   - `GET /terms/consents/history`;
   - `DELETE /terms/revoke-biometric`;
   - `GET /lgpd/me/export`;
   - `GET /lgpd/processing-catalog`.

3. Ler no front-end:
   - `src/service/user.service.ts`;
   - `src/service/session-profile.service.ts`;
   - `src/service/terms.service.ts`;
   - `src/service/lgpd.service.ts`;
   - `src/types/user.ts`;
   - `src/types/legal.ts`.

**Critério de aceite:** tabela de contratos confirmada antes de implementar.

---

### História 01.03 — Mapear tela legada

**Objetivo:** entender o que deve ser reaproveitado e removido.

**Tasks:**

1. Ler:
   - `src/pages/Usuario.tsx`;
   - `src/hooks/useUser.ts`;
   - `src/components/privacy/BiometricConsentCard.tsx`.

2. Identificar:
   - estados locais;
   - chamadas de serviço;
   - componentes reaproveitáveis;
   - imports mortos;
   - limitações atuais.

**Critério de aceite:** lista de componentes/serviços reaproveitados e lista do que será removido.

---

## ÉPICO 02 — Fundação da nova feature

### História 02.01 — Criar estrutura `features/user-profile`

**Objetivo:** isolar a nova implementação da rota `/usuario`.

**Tasks:**

1. Criar diretórios:
   ```text
   src/features/user-profile/components
   src/features/user-profile/hooks
   src/features/user-profile/mappers
   src/features/user-profile/utils
   src/features/user-profile/styles
   src/features/user-profile/__tests__
   ```

2. Criar arquivos base:
   - `useUsuarioProfileViewModel.ts`;
   - `useUsuarioResponsiveMode.ts`;
   - `usuario-profile.mapper.ts`;
   - `mask-sensitive-data.ts`;
   - `usuario-profile-formatters.ts`;
   - `usuario-profile.tokens.ts`.

3. Atualizar `src/pages/Usuario.tsx` para renderizar o novo container, mantendo a rota.

**Critério de aceite:** rota `/usuario` continua acessível e build não quebra.

---

### História 02.02 — Criar modelo de apresentação

**Objetivo:** converter DTOs em estrutura adequada para UI.

**Tasks:**

1. Criar mapper com:
   - nome;
   - iniciais;
   - papel;
   - cargo;
   - status;
   - CPF mascarado;
   - remuneração protegida;
   - local de trabalho;
   - endereço resumido;
   - e-mail;
   - telefone formatado;
   - flags de consentimento/LGPD.

2. Criar utilitários:
   - `maskCpf`;
   - `maskSalary`;
   - `formatPhone`;
   - `formatAddress`;
   - `formatRole`;
   - `summarizeHash`.

3. Criar testes unitários para utilitários.

**Critério de aceite:** máscaras e formatadores testados.

---

### História 02.03 — Criar view-model

**Objetivo:** centralizar dados e ações da tela.

**Tasks:**

1. Reaproveitar ou evoluir `useUser`.
2. Adicionar:
   - status de termo biométrico;
   - histórico de consentimentos;
   - exportação LGPD;
   - loading separado por ação;
   - erro separado por bloco.
3. Garantir que mutations usem services existentes.
4. Garantir tratamento de `401`.

**Critério de aceite:** view-model entrega dados prontos para desktop e mobile.

---

## ÉPICO 03 — Implementação desktop

### História 03.01 — Criar shell desktop

**Objetivo:** criar painel de gestão pessoal.

**Tasks:**

1. Criar `UsuarioDesktopView.tsx`.
2. Usar sidebar e header existentes, se adequados.
3. Criar fundo claro com grid técnico discreto.
4. Criar hero institucional.
5. Criar cards de resumo.

**Critério de aceite:** desktop exibe estrutura semelhante ao mockup desktop.

---

### História 03.02 — Criar cards desktop

**Objetivo:** separar dados por contexto.

**Tasks:**

1. `ProfessionalIdentityCard`:
   - nome completo;
   - CPF mascarado;
   - cargo;
   - tipo de usuário;
   - remuneração mascarada;
   - local de trabalho;
   - endereço.

2. `EditableContactCard`:
   - e-mail;
   - telefone;
   - botão editar;
   - validação;
   - feedback.

3. `SecurityPasswordCard`:
   - status de sessão;
   - alterar senha;
   - aviso de encerramento de sessão;
   - validação de confirmação.

4. `PrivacyLgpdPanel`:
   - termo biométrico;
   - histórico;
   - exportar dados;
   - revogar biometria.

**Critério de aceite:** ações ficam próximas do contexto e dados sensíveis ficam mascarados.

---

## ÉPICO 04 — Implementação mobile

### História 04.01 — Criar shell mobile

**Objetivo:** criar experiência de app de autoatendimento.

**Tasks:**

1. Criar `UsuarioMobileView.tsx`.
2. Criar header compacto.
3. Criar card superior com avatar, nome, papel e status.
4. Criar chips horizontais:
   - Identidade;
   - Contato;
   - Senha;
   - LGPD.
5. Criar bottom navigation fixa.

**Critério de aceite:** mobile não exibe sidebar e não parece desktop encolhido.

---

### História 04.02 — Criar fluxos mobile dedicados

**Objetivo:** evitar formulários longos comprimidos.

**Tasks:**

1. Criar `MobileEditContactSheet`.
2. Criar `MobilePasswordFlowSheet`.
3. Criar confirmação de revogação biométrica.
4. Criar entrada resumida para centro de privacidade/LGPD.
5. Garantir botões com no mínimo 44px.

**Critério de aceite:** ações principais são fáceis de tocar e fluxos sensíveis são separados.

---

## ÉPICO 05 — LGPD, consentimento e segurança

### História 05.01 — Integrar histórico de consentimentos

**Objetivo:** mostrar consentimento como evidência versionada.

**Tasks:**

1. Usar `getConsentHistory`.
2. Mostrar lista resumida.
3. Exibir versão/hash resumido quando existir.
4. Exibir status ativo/revogado.
5. Não exibir dado sensível bruto.

**Critério de aceite:** histórico aparece sem vazar dados sensíveis.

---

### História 05.02 — Integrar exportação de dados

**Objetivo:** permitir exportar os próprios dados.

**Tasks:**

1. Usar `exportMyData`.
2. Tratar loading e erro.
3. Preferir download JSON via Blob ou ação controlada.
4. Não renderizar JSON completo na tela principal.
5. Mostrar feedback de conclusão.

**Critério de aceite:** usuário consegue acionar exportação sem exposição indevida.

---

### História 05.03 — Preservar revogação biométrica

**Objetivo:** manter ação destrutiva segura.

**Tasks:**

1. Usar `revokeBiometricTerms`.
2. Confirmar antes de enviar.
3. Exibir consequências:
   - remove/invalida material biométrico;
   - perde login facial;
   - encerra sessão.
4. Tratar `401` pós-revogação.
5. Redirecionar para login quando aplicável.

**Critério de aceite:** revogação continua funcional e confirmada.

---

## ÉPICO 06 — Testes, acessibilidade e limpeza

### História 06.01 — Testes unitários e render

**Tasks:**

1. Testar máscaras.
2. Testar mapper.
3. Testar renderização básica desktop.
4. Testar renderização básica mobile.
5. Testar senha divergente.
6. Testar ações de contato com mocks.

**Critério de aceite:** `npm run test` passa ou limitações são documentadas.

---

### História 06.02 — Acessibilidade

**Tasks:**

1. Revisar labels.
2. Revisar `aria-label`.
3. Revisar foco.
4. Revisar `role="alert"`.
5. Revisar contraste.
6. Revisar alvo de toque mobile.

**Critério de aceite:** fluxo navegável por teclado e sem botões sem nome acessível.

---

### História 06.03 — Remover legado

**Tasks:**

1. Remover JSX antigo de `Usuario.tsx`.
2. Remover imports não usados.
3. Remover utilitários exclusivos obsoletos.
4. Buscar referências antes de deletar.
5. Rodar lint/build.

**Critério de aceite:** não há duas implementações visuais coexistindo.

---

### História 06.04 — Validação final

**Comandos:**

```bash
npm run lint
npm run test
npm run build
```

**Validação manual:**

- `/usuario` desktop;
- `/usuario` mobile;
- edição de e-mail;
- edição de telefone;
- troca de senha;
- status biométrico;
- histórico de consentimentos;
- exportação LGPD;
- revogação biométrica.

**Critério de aceite:** relatório final gerado com arquivos alterados e evidências de teste.
