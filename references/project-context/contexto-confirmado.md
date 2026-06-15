# Project context usado pelo pacote

Este pacote foi criado para executar correções pós-auditoria no front-end Kronos.

Pontos confirmados na inspeção inicial:

- `PageShell` centraliza `Sidebar`, `Header` e `main`.
- `App.tsx` usa `ProtectedRoute`, `RoleRoute`, `AuthProvider`, `CheckinProvider` e lazy routes.
- `package.json` possui scripts `lint`, `build`, `test`, `test:e2e` e `preview`.
- A auditoria base aponta P0/P1/P2/P3 com IDs FE-AUD-*.

Consulte sempre o código local, pois o workspace pode ter evoluído depois da geração deste pacote.
