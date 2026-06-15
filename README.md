# Kronos — Pacote Codex CLI — Header global

## Objetivo

Refatorar o componente global `Header` do front-end `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, transformando-o em uma barra global de orientação, sessão, segurança e ação rápida da plataforma.

O novo header deve seguir a diretriz visual `references/docs/kronos_header_diretriz_visual.md` e os mockups:

- `references/mockups/kronos_header_desktop.png`
- `references/mockups/kronos_header_mobile.png`

## Escopo

### Alterar

- `src/components/Header.tsx`
- `src/utils/layout-colors.ts`
- `src/components/PageShell.tsx`, se necessário
- componentes auxiliares novos sob `src/components/header/`
- testes relacionados ao header, navegação, sessão, role, logout e CTA de ponto

### Preservar

- contrato de autenticação atual;
- `AuthContext`;
- `CheckinContext`;
- `ProtectedRoute`;
- `RoleRoute`;
- `APP_PATHS`;
- `APP_ROUTE_META`;
- `Sidebar`;
- `CheckinModal`;
- comportamento de logout;
- fluxo de registro de ponto existente.

### Não fazer

- não alterar endpoints do back-end;
- não alterar RBAC de rotas;
- não mover regras de autorização para o front-end;
- não remover a proteção real do back-end;
- não criar header autenticado em rotas públicas que possuem identidade própria, como `/login`, salvo se o workspace já tiver arquitetura explícita para isso;
- não recriar a aplicação;
- não alterar páginas fora do necessário para integração do header global.

## Resultado esperado

O header deve ficar presente nas telas autenticadas, com:

- menu lateral;
- marca Kronos;
- rota/contexto atual;
- role da sessão;
- status de sessão protegida;
- indicador LGPD/consentimento;
- CTA `Registrar ponto`;
- avisos/notificações com badge;
- avatar/perfil;
- logout em menu seguro;
- experiência desktop e mobile realmente diferentes.

## Execução recomendada

1. Leia a diretriz visual.
2. Inspecione `src/components/Header.tsx`.
3. Inspecione `src/components/PageShell.tsx`.
4. Inspecione `src/context/AuthContext.tsx`.
5. Inspecione `src/context/CheckinContext.tsx`.
6. Inspecione `src/config/app-routes.ts`.
7. Inspecione `src/components/Sidebar.tsx`.
8. Implemente o novo header.
9. Remova o legado do header antigo.
10. Execute lint, build e testes.
11. Valide desktop/mobile contra os mockups.
