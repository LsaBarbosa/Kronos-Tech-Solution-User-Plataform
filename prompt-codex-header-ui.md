# Prompt para Codex CLI — Refatoração do Header global Kronos

Você está no projeto Kronos.

## Repositórios e branches

Antes de implementar, confira se está nas branches corretas:

- Back-end: `Kronos-Tech-Solutions-KTS`
  - branch: `PROD_HOSTINGER_V2`
- Front-end: `Kronos-Tech-Solution-User-Plataform`
  - branch: `feature/lgpd-compliance-new-ui`
- Documentação: `kronos-business`
  - branch: `main`

A implementação deve ocorrer no front-end.

## Objetivo

Refatorar o elemento global `Header` para criar uma barra corporativa premium, segura, responsiva e orientada a ação, conforme:

- `references/docs/kronos_header_diretriz_visual.md`
- `references/mockups/kronos_header_desktop.png`
- `references/mockups/kronos_header_mobile.png`

O header deve ser usado nas rotas autenticadas da aplicação e deve conectar:

- navegação;
- sessão;
- role;
- LGPD/consentimento;
- check-in/registro de ponto;
- avisos;
- perfil;
- logout.

## Leitura obrigatória

Leia estes arquivos antes de editar:

```text
references/docs/kronos_header_diretriz_visual.md
references/mockups/kronos_header_desktop.png
references/mockups/kronos_header_mobile.png

src/components/Header.tsx
src/components/PageShell.tsx
src/components/Sidebar.tsx
src/App.tsx
src/config/app-routes.ts
src/utils/layout-colors.ts
src/context/AuthContext.tsx
src/context/CheckinContext.tsx
src/context/CheckinContextDef.ts
src/components/checkin/CheckinModal.tsx
src/service/session-profile.service.ts
src/service/terms.service.ts
src/service/messages.service.ts
src/pages/Dashboard.tsx
src/pages/Avisos.tsx
```

Se algum arquivo não existir, procure pelo equivalente antes de criar algo novo.

## Diagnóstico esperado

O header atual é simples e precisa ser substituído por uma implementação orientada a sessão e contexto. Não preserve visual antigo se ele conflitar com a diretriz.

## Implementação obrigatória

### 1. Novo `Header`

Refatore `src/components/Header.tsx` para exibir:

- menu lateral;
- marca Kronos;
- rota atual;
- role atual;
- status de sessão;
- status LGPD/consentimento;
- botão `Registrar ponto`;
- notificações/avisos;
- avatar/perfil;
- logout em menu seguro.

### 2. Componentização

Crie componentes auxiliares se necessário:

```text
src/components/header/HeaderBrand.tsx
src/components/header/HeaderRouteContext.tsx
src/components/header/HeaderSessionStatus.tsx
src/components/header/HeaderRoleChip.tsx
src/components/header/HeaderCheckinAction.tsx
src/components/header/HeaderNotifications.tsx
src/components/header/HeaderAccountMenu.tsx
src/components/header/header.helpers.ts
```

A estrutura pode ser ajustada ao padrão real do projeto, mas evite deixar um `Header.tsx` monolítico.

### 3. Desktop

Desktop deve ter layout horizontal completo:

- zona esquerda: menu, marca, rota e role;
- zona central: sessão protegida e LGPD/consentimento;
- zona direita: registrar ponto, notificações, avatar/perfil e conta/logout.

### 4. Mobile

Mobile deve ser experiência própria:

- header compacto;
- menu destacado;
- marca curta;
- role chip;
- avisos por badge;
- CTA de ponto destacado;
- textos resumidos;
- nada de tabela ou cópia reduzida do desktop.

### 5. Sessão e role

Use `useAuth()`.

Regras:

- `status === "checking"`: mostrar skeleton/chip de verificação.
- `status === "authenticated"`: mostrar sessão protegida.
- `role` desconhecida: mostrar chip neutro `Perfil`.
- `biometricConsent` disponível: mostrar contexto LGPD/consentimento.
- nunca exibir salário, CPF ou dado sensível no header.

### 6. Registrar ponto

Use `useCheckin().openCheckin`.

Não reimplemente check-in. O botão deve apenas abrir o fluxo existente.

### 7. Notificações

Procure serviço/hook existente de mensagens/avisos.

Critério:

- se houver contagem de não lidos, exibir badge real;
- se só houver mensagens recentes, exibir badge calculado de forma segura;
- se falhar, mostrar ícone neutro sem quebrar o header.

### 8. Logout

Use `logout()` do `AuthContext`.

Logout deve ficar dentro de menu de conta, não como botão solto principal.

Após logout, navegar para `/login`.

### 9. Integração global

Verifique `PageShell`.

- Se `PageShell` já envolve páginas autenticadas, manter `Header` nele.
- Se páginas autenticadas importam `Header` diretamente e geram duplicidade, refatore para evitar duplicidade.
- Não colocar header autenticado no `/login`, `/privacy/policy`, `/privacy/processing-catalog` ou `/privacy/biometric-term`, porque são rotas públicas.

### 10. Estilos

Atualize `src/utils/layout-colors.ts` ou classes locais para suportar:

- header fixo;
- fundo claro/escuro conforme mockup;
- borda superior ciano/azul;
- chips;
- badge;
- avatar;
- estado mobile;
- CTA azul.

Use a paleta da diretriz.

## Regras de segurança

- Não alterar back-end.
- Não alterar contrato de autenticação.
- Não alterar contrato de check-in.
- Não alterar RBAC.
- Não expor dados sensíveis.
- Não deixar header renderizado após sessão expirada.
- Não quebrar links públicos de LGPD.

## Testes

Execute:

```bash
npm run lint
npm run build
npm run test
```

Se existir E2E configurado:

```bash
npm run test:e2e
```

## Critérios de aceite

A tarefa só está completa quando:

- desktop segue `kronos_header_desktop.png`;
- mobile segue `kronos_header_mobile.png`;
- header está nas rotas autenticadas;
- header não aparece no login público;
- menu lateral abre;
- CTA `Registrar ponto` abre o check-in;
- role aparece;
- sessão protegida aparece;
- notificações aparecem;
- perfil/avatar aparece;
- logout funciona;
- não existe header duplicado;
- lint/build/test passam;
- legado foi removido.
