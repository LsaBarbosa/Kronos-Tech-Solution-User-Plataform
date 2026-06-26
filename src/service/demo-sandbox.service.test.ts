import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  createDemoSandbox,
  deleteDemoSandbox,
  fetchDemoStatus,
  validateDemoSandbox,
} from "./demo-sandbox.service";

const counters = {
  companies: 1,
  users: 1,
  employees: 1,
  pointRecords: 20,
  documents: 6,
  requests: 3,
  files: 6,
  sessions: 1,
  cacheKeys: 0,
};

const cleanValidation = { clean: true, issues: [] };

describe("demo-sandbox.service", () => {
  it("busca status do demo sandbox", async () => {
    server.use(
      http.get("*/cto/demo/status", () =>
        HttpResponse.json({
          enabled: true,
          killSwitch: false,
          exists: false,
          companyName: "Kronos Teste",
          username: "kronos_teste",
          sandboxKey: "KRONOS_TESTE",
          lastOperation: null,
          validation: null,
        })
      )
    );

    const result = await fetchDemoStatus();

    expect(result.enabled).toBe(true);
    expect(result.exists).toBe(false);
    expect(result.sandboxKey).toBe("KRONOS_TESTE");
  });

  it("cria sandbox e retorna operationId e contadores", async () => {
    server.use(
      http.post("*/cto/demo/create", () =>
        HttpResponse.json({
          operationId: "abc-123",
          status: "SUCCESS",
          companyName: "Kronos Teste",
          username: "kronos_teste",
          initialPasswordAvailable: true,
          created: counters,
          validation: cleanValidation,
        })
      )
    );

    const result = await createDemoSandbox();

    expect(result.status).toBe("SUCCESS");
    expect(result.created.pointRecords).toBe(20);
    expect(result.validation.clean).toBe(true);
  });

  it("deleta sandbox e retorna contadores de remoção", async () => {
    server.use(
      http.delete("*/cto/demo/purge", () =>
        HttpResponse.json({
          operationId: "xyz-456",
          status: "SUCCESS",
          removed: counters,
          validation: cleanValidation,
        })
      )
    );

    const result = await deleteDemoSandbox();

    expect(result.status).toBe("SUCCESS");
    expect(result.removed.companies).toBe(1);
    expect(result.validation.clean).toBe(true);
  });

  it("valida sandbox e retorna resultado limpo", async () => {
    server.use(
      http.post("*/cto/demo/validate", () =>
        HttpResponse.json(cleanValidation)
      )
    );

    const result = await validateDemoSandbox();

    expect(result.clean).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("valida sandbox com resíduos retorna issues", async () => {
    server.use(
      http.post("*/cto/demo/validate", () =>
        HttpResponse.json({
          clean: false,
          issues: [{ type: "ORPHAN_USER", description: "Usuário kronos_teste sem empresa." }],
        })
      )
    );

    const result = await validateDemoSandbox();

    expect(result.clean).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe("ORPHAN_USER");
  });

  it("propaga erro 403 ao tentar criar sem role CTO", async () => {
    server.use(
      http.post("*/cto/demo/create", () =>
        HttpResponse.json({ detail: "Acesso negado." }, { status: 403 })
      )
    );

    await expect(createDemoSandbox()).rejects.toMatchObject({ status: 403 });
  });
});
