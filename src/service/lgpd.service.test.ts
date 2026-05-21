import { HttpResponse, http } from "msw";
import { describe, expect, it, beforeEach } from "vitest";
import { server } from "@/test/mocks/server";
import {
  createLgpdRequest,
  listLgpdRequests,
  exportEmployeeData,
  type LgpdRequestResponse,
} from "./lgpd.service";

describe("lgpd.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("cria solicitação LGPD com sucesso", async () => {
    server.use(
      http.post("*/lgpd/requests", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          requestType: "ACCESS",
          description: "Solicitar acesso aos meus dados",
        });
        return new HttpResponse(null, { status: 201 });
      })
    );

    await expect(
      createLgpdRequest({
        requestType: "ACCESS",
        description: "Solicitar acesso aos meus dados",
      })
    ).resolves.toBeUndefined();
  });

  it("lista solicitações LGPD com sucesso", async () => {
    const mockRequests: LgpdRequestResponse[] = [
      {
        requestId: "req-001",
        requestType: "ACCESS",
        status: "OPEN",
        description: "Acesso aos dados",
        openedAt: "2026-05-21T10:00:00Z",
        closedAt: null,
      },
      {
        requestId: "req-002",
        requestType: "DELETION",
        status: "COMPLETED",
        description: "Exclusão de dados",
        openedAt: "2026-05-20T10:00:00Z",
        closedAt: "2026-05-21T15:00:00Z",
      },
    ];

    server.use(
      http.get("*/lgpd/requests", () =>
        HttpResponse.json({ content: mockRequests }, { status: 200 })
      )
    );

    const result = await listLgpdRequests();
    expect(result).toEqual(mockRequests);
    expect(result).toHaveLength(2);
  });

  it("retorna array vazio quando nenhuma solicitação existe", async () => {
    server.use(
      http.get("*/lgpd/requests", () =>
        HttpResponse.json({ content: [] }, { status: 200 })
      )
    );

    const result = await listLgpdRequests();
    expect(result).toEqual([]);
  });

  it("exporta dados do colaborador como blob", async () => {
    const jsonData = JSON.stringify({ id: "emp-001" });
    const buffer = new TextEncoder().encode(jsonData);

    server.use(
      http.get("*/lgpd/employees/emp-001/export", () =>
        HttpResponse.arrayBuffer(buffer, {
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const result = await exportEmployeeData("emp-001");
    expect(result).toBeInstanceOf(Blob);
  });

  it("lança erro quando criar solicitação falha", async () => {
    server.use(
      http.post("*/lgpd/requests", () =>
        HttpResponse.json({ detail: "Erro ao criar solicitação" }, { status: 400 })
      )
    );

    await expect(
      createLgpdRequest({
        requestType: "ACCESS",
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
