# Plano de ação — Header global Kronos

## Task 01 — Preparação e leitura

### Objetivo

Confirmar o escopo real do header e sua integração no front-end.

### Ler

- `references/docs/kronos_header_diretriz_visual.md`
- `references/mockups/kronos_header_desktop.png`
- `references/mockups/kronos_header_mobile.png`
- `src/components/Header.tsx`
- `src/components/PageShell.tsx`
- `src/App.tsx`
- `src/config/app-routes.ts`

### Saída

- mapa de componentes;
- lista de páginas autenticadas;
- lista de rotas públicas que não devem receber header autenticado.

---

## Task 02 — Mapear sessão, role e check-in

### Objetivo

Preservar contratos existentes.

### Ler

- `src/context/AuthContext.tsx`
- `src/context/CheckinContext.tsx`
- `src/components/checkin/CheckinModal.tsx`
- `src/service/session-profile.service.ts`
- `src/service/terms.service.ts`

### Saída

- campos disponíveis para o header:
  - `status`;
  - `user`;
  - `role`;
  - `biometricConsent`;
  - `logout`;
  - `openCheckin`.

---

## Task 03 — Mapear avisos/notificações

### Objetivo

Identificar fonte segura para badge de avisos.

### Ler

- `src/pages/Avisos.tsx`
- hook de avisos, caso exista;
- service de mensagens, caso exista;
- dashboard hook, caso já use avisos.

### Decisão

- Se houver serviço seguro para mensagens não lidas, usar.
- Se não houver, criar componente preparado para receber `count` sem chamada bloqueante.
- Não deixar falha de avisos derrubar o header.

---

## Task 04 — Criar arquitetura visual

### Objetivo

Separar o header em partes menores.

### Implementar preferencialmente

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

### Saída

- componentes reaproveitáveis;
- `Header.tsx` como orquestrador.

---

## Task 05 — Implementar desktop

### Objetivo

Criar header horizontal completo conforme mockup desktop.

### Requisitos

- fixo no topo;
- menu lateral;
- marca Kronos;
- rota/contexto;
- role chip;
- sessão protegida;
- CTA `Registrar ponto`;
- notificações;
- avatar/perfil;
- logout no menu.

---

## Task 06 — Implementar mobile

### Objetivo

Criar experiência mobile distinta.

### Requisitos

- compacto;
- menu com destaque;
- logo curta;
- role chip;
- badge de avisos;
- CTA de ponto prioritário;
- sem excesso textual;
- toque mínimo de 44px.

---

## Task 07 — Integrar com layout global

### Objetivo

Garantir presença nas telas autenticadas.

### Validar

- `PageShell` contém `Header`.
- Páginas autenticadas que usam `Header` diretamente são migradas ou mantidas sem duplicação.
- Não existe duplo header.
- Rotas públicas mantêm identidade própria.

---

## Task 08 — Ajustar estilos

### Objetivo

Atualizar `layout-colors.ts` e classes do header.

### Requisitos

- paleta da diretriz;
- borda/top accent;
- chips;
- badges;
- estados mobile/desktop;
- espaçamento superior do conteúdo.

---

## Task 09 — Remover legado

### Objetivo

Eliminar implementação antiga depois de validar a nova.

### Remover

- classes antigas não usadas;
- imports mortos;
- header duplicado;
- helpers antigos sem uso.

---

## Task 10 — Testes e validação

### Comandos

```bash
npm run lint
npm run build
npm run test
```

Se houver E2E:

```bash
npm run test:e2e
```

### Validar manualmente

- desktop;
- mobile;
- role `PARTNER`;
- role `MANAGER`;
- role `CTO`;
- abrir menu;
- abrir check-in;
- abrir menu de conta;
- logout;
- sessão carregando;
- badge de avisos.
