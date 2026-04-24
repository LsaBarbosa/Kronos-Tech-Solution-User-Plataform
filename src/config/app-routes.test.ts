import { describe, expect, it } from "vitest";
import { APP_PATHS, APP_ROUTE_META } from "./app-routes";

describe("app-routes metadata", () => {
  it("centraliza paths e labels de rotas principais", () => {
    expect(APP_PATHS.dashboard).toBe("/dashboard");
    expect(APP_ROUTE_META.dashboard.label).toBe("Início");
    expect(APP_ROUTE_META.empresa.path).toBe(APP_PATHS.empresa);
    expect(APP_ROUTE_META.empresa.allowedRoles).toEqual(["CTO"]);
  });

  it("expõe breadcrumbs e visibilidade de menu para rotas secundárias", () => {
    expect(APP_ROUTE_META.empresaCriar.showInMenu).toBe(false);
    expect(APP_ROUTE_META.empresaCriar.breadcrumbs).toEqual([
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Empresa", path: APP_PATHS.empresa },
      { label: "Criar Empresa", path: APP_PATHS.empresaCriar },
    ]);
    expect(APP_ROUTE_META.criarAdministrador.allowedRoles).toEqual(["CTO", "MANAGER"]);
  });
});
