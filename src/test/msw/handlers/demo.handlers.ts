import { HttpResponse, http } from "msw";

const demoStatus = {
  enabled: true,
  killSwitch: false,
  exists: true,
  companyName: "Kronos Teste",
  username: "kronos_teste",
  sandboxKey: "KRONOS_TESTE",
  lastOperation: {
    operation: "CREATE",
    status: "SUCCESS",
    finishedAt: "2026-06-01T10:00:00",
  },
  validation: { clean: true, issues: [] },
};

const demoCounters = {
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

const demoValidation = { clean: true, issues: [] };

export const demoHandlers = [
  http.get("*/cto/demo/status", () => HttpResponse.json(demoStatus)),

  http.post("*/cto/demo/create", () =>
    HttpResponse.json({
      operationId: "11111111-0000-0000-0000-000000000001",
      status: "SUCCESS",
      companyName: "Kronos Teste",
      username: "kronos_teste",
      initialPasswordAvailable: true,
      created: demoCounters,
      validation: demoValidation,
    })
  ),

  http.delete("*/cto/demo/purge", () =>
    HttpResponse.json({
      operationId: "11111111-0000-0000-0000-000000000002",
      status: "SUCCESS",
      removed: demoCounters,
      validation: demoValidation,
    })
  ),

  http.post("*/cto/demo/validate", () => HttpResponse.json(demoValidation)),
];
