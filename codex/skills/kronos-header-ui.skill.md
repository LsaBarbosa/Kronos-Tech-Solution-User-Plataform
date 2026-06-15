# Skill — Kronos Header UI Refactor

## Missão

Implementar a nova experiência visual e funcional do `Header` global da plataforma Kronos, seguindo a diretriz de negócio e os mockups de desktop/mobile.

## Contexto técnico

Repositórios:

- Front-end: `Kronos-Tech-Solution-User-Plataform`
  - branch: `feature/lgpd-compliance-new-ui`
- Back-end: `Kronos-Tech-Solutions-KTS`
  - branch: `PROD_HOSTINGER_V2`
- Documentação: `kronos-business`
  - branch: `main`

Arquivos de referência locais deste pacote:

- `references/docs/kronos_header_diretriz_visual.md`
- `references/mockups/kronos_header_desktop.png`
- `references/mockups/kronos_header_mobile.png`

## Resultado funcional obrigatório

O novo `Header` deve exibir:

1. abertura do menu lateral;
2. marca Kronos;
3. rota/contexto atual;
4. role da sessão;
5. status de sessão protegida;
6. indicador LGPD/consentimento;
7. CTA `Registrar ponto`;
8. avisos/notificações;
9. avatar/perfil;
10. logout via menu de conta.

## Experiência desktop

No desktop, o header deve ser horizontal, completo e fixo no topo.

Composição esperada:

- esquerda: botão de menu, logo/monograma, nome Kronos, breadcrumb/contexto e role;
- centro: chip de sessão protegida, consentimento/LGPD e estado operacional;
- direita: CTA `Registrar ponto`, avisos com badge, avatar/nome/status e menu de conta.

## Experiência mobile

No mobile, o header deve ser compacto e orientado a ação rápida.

Composição esperada:

- botão de menu com destaque;
- monograma Kronos;
- rota curta;
- role em chip;
- sino/avisos com badge;
- CTA de ponto destacado, podendo ficar abaixo da barra principal se o mockup indicar;
- textos reduzidos;
- logout dentro do menu de conta/sidebar, nunca como botão solto de alto risco.

## Regras de integração

- Usar `useAuth()` para obter `status`, `user`, `role`, `biometricConsent` e `logout`.
- Usar `useCheckin()` para abrir o fluxo de ponto com `openCheckin`.
- Usar `useLocation()` e `APP_ROUTE_META`/`APP_PATHS` para inferir rota atual.
- Não duplicar regras de RBAC.
- Não criar chamadas novas ao back-end sem necessidade.
- Preferir dados já carregados no contexto.
- Se precisar de contagem de avisos, reaproveitar serviço/hook existente; caso não exista seguro, implementar fallback visual não bloqueante.
- O header não deve quebrar páginas públicas (`/login`, `/privacy/policy`, `/privacy/processing-catalog`, `/privacy/biometric-term`).

## Critérios de qualidade

- responsivo real, não apenas redimensionado;
- contraste acessível;
- foco visível;
- `aria-label` em botões iconográficos;
- navegação por teclado;
- toque mínimo de 44px no mobile;
- sem texto excessivo no mobile;
- sem logout acidental;
- sem duplicação de header/sidebar em páginas que usam `PageShell`.

## Validação

Executar:

```bash
npm run lint
npm run build
npm run test
```

Quando houver Playwright configurado:

```bash
npm run test:e2e
```
