import { describe, expect, it } from "vitest";
import type { DemoCreateResponse, DemoPurgeResponse, DemoStatusResponse, DemoValidationResult } from "@/types/demo";

describe("CTODemoSandbox types", () => {
  it("DemoStatusResponse has required fields", () => {
    const status: DemoStatusResponse = {
      enabled: true,
      killSwitch: false,
      exists: true,
      companyName: "Kronos Teste",
      username: "kronos_teste",
      sandboxKey: "KRONOS_TESTE",
      lastOperation: { operation: "CREATE", status: "SUCCESS", finishedAt: null },
      validation: { clean: true, issues: [] },
    };

    expect(status.sandboxKey).toBe("KRONOS_TESTE");
    expect(status.exists).toBe(true);
    expect(status.killSwitch).toBe(false);
  });

  it("DemoCreateResponse tracks seed counters", () => {
    const response: DemoCreateResponse = {
      operationId: "op-1",
      status: "SUCCESS",
      companyName: "Kronos Teste",
      username: "kronos_teste",
      initialPasswordAvailable: true,
      created: {
        companies: 1,
        users: 1,
        employees: 1,
        pointRecords: 20,
        documents: 6,
        requests: 3,
        files: 6,
        sessions: 0,
        cacheKeys: 0,
      },
      validation: { clean: true, issues: [] },
    };

    expect(response.created.pointRecords).toBe(20);
    expect(response.created.documents).toBe(6);
    expect(response.validation.clean).toBe(true);
  });

  it("DemoPurgeResponse tracks removed counters", () => {
    const response: DemoPurgeResponse = {
      operationId: "op-2",
      status: "SUCCESS",
      removed: {
        companies: 1,
        users: 1,
        employees: 1,
        pointRecords: 20,
        documents: 6,
        requests: 3,
        files: 6,
        sessions: 1,
        cacheKeys: 0,
      },
      validation: { clean: true, issues: [] },
    };

    expect(response.removed.sessions).toBe(1);
    expect(response.validation.clean).toBe(true);
  });

  it("DemoValidationResult with issues is not clean", () => {
    const result: DemoValidationResult = {
      clean: false,
      issues: [
        { type: "ORPHAN_USER", description: "Usuário sem empresa detectado." },
        { type: "ORPHAN_FILES", description: "Arquivos em /opt/kronos/sandbox ainda existem." },
      ],
    };

    expect(result.clean).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0].type).toBe("ORPHAN_USER");
  });

  it("disabled sandbox blocks operations when killSwitch is active", () => {
    const status: DemoStatusResponse = {
      enabled: true,
      killSwitch: true,
      exists: true,
      companyName: "Kronos Teste",
      username: "kronos_teste",
      sandboxKey: "KRONOS_TESTE",
      lastOperation: null,
      validation: null,
    };

    const canCreate = !status.killSwitch && status.enabled;
    const canDelete = !status.killSwitch && status.exists;

    expect(canCreate).toBe(false);
    expect(canDelete).toBe(false);
  });
});
