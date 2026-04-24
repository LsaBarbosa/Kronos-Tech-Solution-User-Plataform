import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/config/api";
import { server } from "@/test/mocks/server";
import {
  deleteDocument,
  downloadDocument,
  fetchDocuments,
  fetchEmployeesForSelection,
  fetchEmployeeDocuments,
  fetchUserDocuments,
  uploadDocument,
} from "./document.service";

let createObjectURLMock: ReturnType<typeof vi.fn>;
let revokeObjectURLMock: ReturnType<typeof vi.fn>;

describe("document.service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    createObjectURLMock = vi.fn(() => "blob:documento");
    revokeObjectURLMock = vi.fn();
    Object.defineProperty(window.URL, "createObjectURL", {
      value: createObjectURLMock,
      configurable: true,
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      value: revokeObjectURLMock,
      configurable: true,
    });
  });

  it("lista documentos pelo envelope real da API", async () => {
    server.use(
      http.get("*/documents", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("employeeId")).toBe("emp-1");
        expect(url.searchParams.get("type")).toBe("PAYSLIP");
        expect(url.searchParams.get("date")).toBe("2026-04-23");

        return HttpResponse.json({
          documents: [
            {
              documentId: "doc-1",
              fileName: "contracheque.pdf",
              uploadedAt: "2026-04-23T10:00:00Z",
              documentType: "PAYSLIP",
            },
          ],
        });
      })
    );

    await expect(
      fetchDocuments({ employeeId: "emp-1", type: "PAYSLIP", date: "2026-04-23" })
    ).resolves.toEqual([
      {
        id: "doc-1",
        name: "contracheque.pdf",
        createdAt: "2026-04-23T10:00:00Z",
        type: "PAYSLIP",
      },
    ]);
  });

  it("lista documentos do usuario e do colaborador usando wrappers oficiais", async () => {
    server.use(
      http.get("*/documents", ({ request }) => {
        const url = new URL(request.url);
        const employeeId = url.searchParams.get("employeeId");
        const type = url.searchParams.get("type");

        if (employeeId) {
          expect(employeeId).toBe("emp-1");
          expect(type).toBe("EMPLOYEE_DOCUMENTS");
        } else {
          expect(type).toBe("EMPLOYEE_DOCUMENTS");
        }

        return HttpResponse.json({
          documents: [
            {
              id: employeeId ? "doc-1" : "doc-2",
              name: employeeId ? "holerite.pdf" : "documento-geral.pdf",
              createdAt: "2026-04-23T10:00:00Z",
              type: "EMPLOYEE_DOCUMENTS",
            },
          ],
        });
      })
    );

    await expect(fetchUserDocuments("EMPLOYEE_DOCUMENTS")).resolves.toEqual([
      {
        id: "doc-2",
        name: "documento-geral.pdf",
        createdAt: "2026-04-23T10:00:00Z",
        type: "EMPLOYEE_DOCUMENTS",
      },
    ]);

    await expect(fetchEmployeeDocuments("emp-1", { type: "EMPLOYEE_DOCUMENTS" })).resolves.toEqual([
      {
        id: "doc-1",
        name: "holerite.pdf",
        createdAt: "2026-04-23T10:00:00Z",
        type: "EMPLOYEE_DOCUMENTS",
      },
    ]);
  });

  it("faz upload multipart com file, type e employeeId", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValue({} as never);

    await expect(
      uploadDocument(
        new File(["conteudo"], "arquivo.pdf", { type: "application/pdf" }),
        "emp-1",
        "PAYSLIP"
      )
    ).resolves.toBeUndefined();

    expect(postSpy).toHaveBeenCalledWith(
      "/documents",
      expect.any(FormData)
    );

    const [, formData] = postSpy.mock.calls[0];
    expect((formData as FormData).get("employeeId")).toBe("emp-1");
    expect((formData as FormData).get("type")).toBe("PAYSLIP");

    const file = (formData as FormData).get("file");
    expect(file).toBeInstanceOf(File);
    expect((file as File).name).toBe("arquivo.pdf");
  });

  it("bloqueia upload com tipo de arquivo inválido antes da chamada HTTP", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValue({} as never);

    await expect(
      uploadDocument(
        new File(["conteudo"], "arquivo.exe", { type: "application/octet-stream" }),
        "emp-1",
        "PAYSLIP"
      )
    ).rejects.toThrow("Tipo de arquivo não permitido.");

    expect(postSpy).not.toHaveBeenCalled();
  });

  it("baixa documento respeitando o nome do arquivo retornado", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    server.use(
      http.get("*/documents/doc-1", () =>
        new HttpResponse("conteudo", {
          status: 200,
          headers: {
            "Content-Disposition": 'attachment; filename="contracheque.pdf"',
          },
        })
      )
    );

    await expect(downloadDocument("doc-1", "fallback.pdf", "emp-1")).resolves.toMatchObject(
      {
        fileName: "contracheque.pdf",
      }
    );

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:documento");
  });

  it("exclui documento pelo endpoint correto", async () => {
    server.use(
      http.delete("*/documents/doc-1", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(deleteDocument("doc-1", "emp-1")).resolves.toBeUndefined();
  });

  it("busca colaboradores ativos para seleção", async () => {
    server.use(
      http.get("*/employee", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("active")).toBe("true");

        return HttpResponse.json({
          employees: [
            {
              employeeId: "emp-1",
              fullName: "Maria Silva",
            },
          ],
        });
      })
    );

    await expect(fetchEmployeesForSelection()).resolves.toEqual([
      {
        employeeId: "emp-1",
        fullName: "Maria Silva",
      },
    ]);
  });
});
