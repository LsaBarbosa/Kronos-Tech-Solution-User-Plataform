# Checklist de validação — Correção Front-end Kronos

## Ambiente

- [ ] Branch `feature/lgpd-compliance-new-ui` confirmada.
- [ ] `git status --short` registrado antes das alterações.
- [ ] `auditoria-front-end.md` lido.
- [ ] `kronos-business` consultado.
- [ ] Back-end consultado apenas para contratos.

## FE-AUD-001 — PageShell

- [ ] `CriarEmpresa` sem import direto de `Header`/`Sidebar`.
- [ ] `BuscarEmpresa` sem import direto de `Header`/`Sidebar`.
- [ ] `AtualizarEmpresa` sem import direto de `Header`/`Sidebar`.
- [ ] `CriarAviso` sem import direto de `Header`/`Sidebar`.
- [ ] `EnviarDocumentos` sem import direto de `Header`/`Sidebar`.
- [ ] `CriarManager` sem import direto de `Header`/`Sidebar`.
- [ ] `NotFound` não vaza header autenticado para público.
- [ ] Formulários e ações preservados.
- [ ] Mobile sem CTA encoberto.
- [ ] Desktop sem overflow horizontal.

## FE-AUD-004 — Vitest

- [ ] `api-contract-guard.test.ts` verde.
- [ ] `README.md` original preservado ou teste atualizado com justificativa.
- [ ] Suite completa executada.

## FE-AUD-002 — Código morto

- [ ] Busca por `dashboard-cards-config` executada.
- [ ] Busca por `dashboard-tone-colors` executada.
- [ ] Arquivos removidos ou justificativa documentada.

## FE-AUD-003 — Testes approvals

- [ ] Testes para `vacation-approvals` criados.
- [ ] Testes para `time-off-approvals` criados.
- [ ] Casos de status cobertos.
- [ ] Casos de data/período cobertos.
- [ ] Casos de dados ausentes cobertos.

## Segurança e dependências

- [ ] `npm audit --audit-level=moderate` executado antes.
- [ ] `npm audit fix` sem `--force` executado quando seguro.
- [ ] `npm audit --audit-level=moderate` executado depois.
- [ ] Nenhum dado sensível introduzido em storage.
- [ ] CSRF preservado.
- [ ] `withCredentials` preservado.
- [ ] Confirmações sensíveis preservadas.

## Lint e hooks

- [ ] Warning de `AvisosPage` resolvido.
- [ ] Warning de `CheckinContext` resolvido ou justificado.
- [ ] `useCheckin` continua funcionando.

## Responsividade e acessibilidade

- [ ] Sem uso direto de `window.innerWidth` em produção ou justificado.
- [ ] Viewport 390x844 validado.
- [ ] Viewport 430x932 validado.
- [ ] Viewport 1366x768 validado.
- [ ] Viewport 1536x864 validado.
- [ ] Viewport 1920x1080 validado.
- [ ] Foco visível em ações principais.
- [ ] Botões de ícone com `aria-label`.

## Comandos finais

- [ ] `npm run lint`.
- [ ] `npx tsc --noEmit`.
- [ ] `npm run build`.
- [ ] `npx vitest run`.
- [ ] `npm audit --audit-level=moderate`.

## Relatório final

- [ ] `correção-front-end.md` criado na raiz do front-end.
- [ ] Achados corrigidos listados.
- [ ] Achados não corrigidos listados.
- [ ] Arquivos alterados listados.
- [ ] Testes criados/alterados listados.
- [ ] Comandos e resultados registrados.
- [ ] Riscos remanescentes registrados.
