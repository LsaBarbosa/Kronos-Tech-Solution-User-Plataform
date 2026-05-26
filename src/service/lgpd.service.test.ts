import { HttpResponse, http } from "msw";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { server } from "@/test/mocks/server";
import {
  createLgpdRequest,
  listLgpdRequests,
  exportEmployeeData,
  exportMyData,
  exportApprovedLgpdRequestData,
  getDataProcessingCatalog,
  type LgpdRequestResponse,
} from "./lgpd.service";
import { LgpdEmployeeExportResponse, DataProcessingPurpose } from "@/types/legal";

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

  it("retorna catálogo de processamento de dados válido", async () => {
    const mockCatalog: DataProcessingPurpose[] = [
      {
        code: "BIOMETRIC_AUTHENTICATION",
        dataCategory: "BIOMETRIC",
        legalBasis: "CONSENT",
        purpose: "Autenticação biométrica",
        retentionPolicyCode: "RETENTION_BIOMETRIC_ACTIVE_CONSENT",
        sensitive: true,
        active: true,
      },
      {
        code: "TIME_RECORD_GEOLOCATION",
        dataCategory: "GEOLOCATION",
        legalBasis: "LEGAL_OBLIGATION",
        purpose: "Comprovação de marcação de ponto",
        retentionPolicyCode: "RETENTION_TIME_RECORD",
        sensitive: false,
        active: true,
      },
    ];

    server.use(
      http.get("*/lgpd/processing-catalog", () =>
        HttpResponse.json(mockCatalog, { status: 200 })
      )
    );

    const result = await getDataProcessingCatalog();
    expect(result).toEqual(mockCatalog);
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe("BIOMETRIC_AUTHENTICATION");
    expect(result[1].sensitive).toBe(false);
  });

  it("retorna array vazio quando catálogo de processamento é vazio", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () => HttpResponse.json([], { status: 200 }))
    );

    const result = await getDataProcessingCatalog();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("retorna array vazio quando resposta é null", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () => HttpResponse.json(null, { status: 200 }))
    );

    const result = await getDataProcessingCatalog();
    expect(result).toEqual([]);
  });

  it("retorna array vazio quando resposta é undefined", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () =>
        HttpResponse.json(undefined, { status: 200 })
      )
    );

    const result = await getDataProcessingCatalog();
    expect(result).toEqual([]);
  });

  it("retorna array vazio quando resposta não é array", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () =>
        HttpResponse.json({ items: [] }, { status: 200 })
      )
    );

    const result = await getDataProcessingCatalog();
    expect(result).toEqual([]);
  });

  it("filtra itens inválidos do catálogo de processamento", async () => {
    const invalidCatalog = [
      {
        code: "VALID_CODE",
        dataCategory: "IDENTIFICATION",
        legalBasis: "CONTRACT",
        purpose: "Valid purpose",
        retentionPolicyCode: "RETENTION_VALID",
        sensitive: false,
        active: true,
      },
      {
        code: "", // Código vazio - inválido
        dataCategory: "BIOMETRIC",
        legalBasis: "CONSENT",
        purpose: "Invalid due to empty code",
        retentionPolicyCode: "RETENTION_BIOMETRIC",
        sensitive: true,
        active: true,
      },
      {
        code: "MISSING_FIELDS",
        dataCategory: "IDENTIFICATION",
        // missing legalBasis - inválido
        purpose: "Invalid due to missing field",
        retentionPolicyCode: "RETENTION",
        sensitive: false,
        active: true,
      },
    ];

    server.use(
      http.get("*/lgpd/processing-catalog", () =>
        HttpResponse.json(invalidCatalog, { status: 200 })
      )
    );

    const result = await getDataProcessingCatalog();
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("VALID_CODE");
  });

  it("lança erro quando servidor retorna 500", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () =>
        HttpResponse.json({ detail: "Erro ao buscar catálogo" }, { status: 500 })
      )
    );

    await expect(getDataProcessingCatalog()).rejects.toThrow();
  });

  it("lança erro quando requisição retorna 401 (Unauthorized)", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () =>
        HttpResponse.json({ detail: "Não autenticado" }, { status: 401 })
      )
    );

    await expect(getDataProcessingCatalog()).rejects.toThrow();
  });

  it("lança erro quando requisição retorna 403 (Forbidden)", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () =>
        HttpResponse.json({ detail: "Sem permissão" }, { status: 403 })
      )
    );

    await expect(getDataProcessingCatalog()).rejects.toThrow();
  });

  it("lança erro quando requisição falha com exceção inesperada", async () => {
    server.use(
      http.get("*/lgpd/processing-catalog", () => {
        throw new Error("Erro inesperado do servidor");
      })
    );

    await expect(getDataProcessingCatalog()).rejects.toThrow();
  });

  it("exporta dados próprios do usuário via /lgpd/me/export", async () => {
    const mockExportResponse: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "export-own-123",
        exportedAt: "2026-05-23T10:00:00Z",
        requestedByUserId: "user-001",
        targetEmployeeId: "emp-001",
        includePreciseGeolocation: false,
        sections: ["employee", "documents"],
        warnings: ["Dados minimizados"],
      },
      employee: {
        employeeId: "emp-001",
        fullName: "João Silva",
        jobPosition: "Desenvolvedor",
        email: "joao@company.com",
      },
    };

    server.use(
      http.get("*/lgpd/me/export", () =>
        HttpResponse.json(mockExportResponse, { status: 200 })
      )
    );

    const result = await exportMyData();
    expect(result.manifest.exportId).toBe("export-own-123");
    expect(result.manifest.includePreciseGeolocation).toBe(false);
  });

  it("exporta dados aprovados para request APPROVED_FOR_EXPORT", async () => {
    const mockExportResponse: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "export-admin-123",
        exportedAt: "2026-05-23T10:00:00Z",
        requestedByUserId: "user-admin",
        targetEmployeeId: "emp-001",
        includePreciseGeolocation: false,
        sections: ["employee", "documents", "timeRecords"],
        warnings: [],
      },
      employee: {
        employeeId: "emp-001",
        fullName: "Maria Santos",
        jobPosition: "Gerente",
        email: "maria@company.com",
      },
    };

    const requestId = "req-approved-001";
    const payload = {
      includePreciseGeolocation: false,
      legalBasis: "Art. 7, II, LGPD",
      operationalReason: "Auditoria de conformidade",
      reviewerNotes: "Revisado e aprovado pelo jurídico",
    };

    server.use(
      http.post(`*/lgpd/admin/requests/${requestId}/export`, async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual(payload);
        return HttpResponse.json(mockExportResponse, { status: 200 });
      })
    );

    const result = await exportApprovedLgpdRequestData(requestId, payload);
    expect(result.manifest.exportId).toBe("export-admin-123");
    expect(result.manifest.requestedByUserId).toBe("user-admin");
  });

  it("não envia employeeId ao chamar exportMyData", async () => {
    const mockExportResponse: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "export-123",
        exportedAt: "2026-05-23T10:00:00Z",
        includePreciseGeolocation: false,
        sections: [],
      },
    };

    let requestUrl = "";
    server.use(
      http.get("*/lgpd/me/export", ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json(mockExportResponse, { status: 200 });
      })
    );

    await exportMyData();
    expect(requestUrl).toContain("/lgpd/me/export");
    expect(requestUrl).not.toContain("employeeId");
  });
});
