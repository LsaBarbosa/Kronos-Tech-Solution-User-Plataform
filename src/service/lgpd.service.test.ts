import { HttpResponse, http } from "msw";
import { describe, expect, it, beforeEach } from "vitest";
import { server } from "@/test/mocks/server";
import {
  createLgpdRequest,
  listLgpdRequests,
  exportEmployeeData,
  type LgpdRequestResponse,
} from "./lgpd.service";
import { LgpdEmployeeExportResponse } from "@/types/legal";

describe("lgpd.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("cria solicitação LGPD com sucesso", async () => {
    server.use(
      http.post("*/lgpd/requests", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          type: "ACCESS",
          description: "Solicitar acesso aos meus dados",
        });
        return new HttpResponse(null, { status: 201 });
      })
    );

    await expect(
      createLgpdRequest({
        type: "ACCESS",
        description: "Solicitar acesso aos meus dados",
      })
    ).resolves.toBeUndefined();
  });

  it("lista solicitações LGPD com sucesso", async () => {
    const mockRequests: LgpdRequestResponse[] = [
      {
        requestId: "req-001",
        employeeId: "emp-001",
        requestedByUserId: "user-001",
        companyId: "company-001",
        requestType: "ACCESS",
        status: "OPEN",
        description: "Acesso aos dados",
        resolutionNotes: null,
        createdAt: "2026-05-21T10:00:00Z",
        updatedAt: "2026-05-21T10:00:00Z",
        resolvedAt: null,
        resolvedByUserId: null,
      },
      {
        requestId: "req-002",
        employeeId: "emp-001",
        requestedByUserId: "user-001",
        companyId: "company-001",
        requestType: "DELETION",
        status: "COMPLETED",
        description: "Exclusão de dados",
        resolutionNotes: "Atendido",
        createdAt: "2026-05-20T10:00:00Z",
        updatedAt: "2026-05-21T15:00:00Z",
        resolvedAt: "2026-05-21T15:00:00Z",
        resolvedByUserId: "user-002",
      },
    ];

    server.use(
      http.get("*/lgpd/requests", () => HttpResponse.json(mockRequests, { status: 200 }))
    );

    const result = await listLgpdRequests();
    expect(result).toEqual(mockRequests);
    expect(result).toHaveLength(2);
  });

  it("retorna array vazio quando nenhuma solicitação existe", async () => {
    server.use(
      http.get("*/lgpd/requests", () => HttpResponse.json([], { status: 200 }))
    );

    const result = await listLgpdRequests();
    expect(result).toEqual([]);
  });

  it("exporta dados do colaborador com manifesto real do back-end", async () => {
    const mockExportResponse: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "export-123",
        exportedAt: "2026-05-23T10:00:00Z",
        requestedByUserId: "user-001",
        targetEmployeeId: "emp-001",
        includePreciseGeolocation: true,
        sections: ["employee", "documents", "timeRecords"],
        warnings: ["Este arquivo contém dados pessoais"],
      },
      employee: {
        employeeId: "emp-001",
        fullName: "João Silva",
        jobPosition: "Desenvolvedor",
        email: "joao@example.com",
      },
      user: {
        userId: "user-001",
        username: "joao.silva",
        email: "joao@example.com",
        role: "PARTNER",
      },
      company: {
        companyId: "company-001",
        cnpj: "12.345.678/0001-90",
        tradeName: "Tech Solutions",
      },
      documents: [],
      timeRecords: [],
      messages: [],
      auditLogs: [],
      legalConsents: [],
      exportedAt: "2026-05-23T10:00:00Z",
    };

    server.use(
      http.get("*/lgpd/employees/emp-001/export", () =>
        HttpResponse.json(mockExportResponse, { status: 200 })
      )
    );

    const result = await exportEmployeeData("emp-001");
    expect(result).toEqual(mockExportResponse);
    expect(result.manifest).toBeDefined();
    expect(result.manifest.exportId).toBe("export-123");
    expect(result.manifest.includePreciseGeolocation).toBe(true);
    expect(result.manifest.sections).toContain("documents");
  });

  it("lança erro quando criar solicitação falha", async () => {
    server.use(
      http.post("*/lgpd/requests", () =>
        HttpResponse.json({ detail: "Erro ao criar solicitação" }, { status: 400 })
      )
    );

    await expect(
      createLgpdRequest({
        type: "ACCESS",
        description: "Solicitar acesso",
      })
    ).rejects.toThrow();
  });

  it("lança erro quando listar solicitações falha", async () => {
    server.use(
      http.get("*/lgpd/requests", () =>
        HttpResponse.json({ detail: "Erro ao listar solicitações" }, { status: 500 })
      )
    );

    await expect(listLgpdRequests()).rejects.toThrow();
  });
});
