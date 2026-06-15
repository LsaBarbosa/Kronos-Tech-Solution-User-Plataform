# Agent — Kronos Header UI

## Papel

Você é o agente principal de implementação da refatoração do `Header` global da plataforma Kronos.

## Objetivo

Transformar o header atual em uma barra global de comando, segura, responsiva e alinhada à identidade visual nova da plataforma.

## Entradas obrigatórias

Leia antes de editar:

1. `references/docs/kronos_header_diretriz_visual.md`
2. `references/mockups/kronos_header_desktop.png`
3. `references/mockups/kronos_header_mobile.png`
4. `src/components/Header.tsx`
5. `src/components/PageShell.tsx`
6. `src/components/Sidebar.tsx`
7. `src/context/AuthContext.tsx`
8. `src/context/CheckinContext.tsx`
9. `src/config/app-routes.ts`
10. `src/utils/layout-colors.ts`
11. `src/components/checkin/CheckinModal.tsx`
12. `src/service/session-profile.service.ts`
13. `src/service/messages.service.ts` ou arquivo equivalente, caso exista
14. `src/service/terms.service.ts`

## Ordem de execução

1. Mapear uso atual do `Header`.
2. Identificar páginas autenticadas que usam `PageShell`.
3. Identificar páginas que ainda importam `Header` diretamente.
4. Criar arquitetura do novo header.
5. Implementar componentes auxiliares.
6. Integrar dados de sessão.
7. Integrar CTA de ponto.
8. Integrar notificações.
9. Integrar menu de conta.
10. Ajustar responsividade desktop/mobile.
11. Remover legado.
12. Testar.

## Saídas esperadas

Arquitetura sugerida:

```text
src/components/Header.tsx
src/components/header/
├── HeaderBrand.tsx
├── HeaderRouteContext.tsx
├── HeaderSessionStatus.tsx
├── HeaderRoleChip.tsx
├── HeaderCheckinAction.tsx
├── HeaderNotifications.tsx
├── HeaderAccountMenu.tsx
└── header.helpers.ts
```

A estrutura pode variar se o projeto já possuir padrão equivalente.

## Regras de decisão

- Se `PageShell` já é o layout autenticado, manter o header nele.
- Se existirem páginas autenticadas sem `PageShell`, avaliar migração incremental para layout comum.
- Se a refatoração de layout global for grande demais, manter integração via `Header` e registrar pendência técnica.
- Não bloquear a tela por falha na contagem de avisos.
- `Registrar ponto` deve sempre acionar `openCheckin`.
- `Sair` deve usar `logout()` e navegar para `/login`.

## Revisão obrigatória

- O header aparece em todas as rotas autenticadas relevantes?
- O login público permanece sem header autenticado?
- Desktop e mobile têm experiências diferentes?
- A role aparece?
- O status de sessão aparece?
- O CTA de ponto aparece?
- Notificações têm badge?
- Logout não é acidental?
- O build passa?
