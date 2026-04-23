import { describe, expect, it, vi, beforeEach } from "vitest";
import { api } from "@/config/api";
import { FiscalService } from "./fiscal.service";

const createObjectURLMock = vi.fn(() => "blob:fiscal");
const revokeObjectURLMock = vi.fn();
const clickSpy = vi.fn();

describe("fiscal.service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();
    clickSpy.mockClear();

    Object.defineProperty(window.URL, "createObjectURL", {
      value: createObjectURLMock,
      configurable: true,
    });

    Object.defineProperty(window.URL, "revokeObjectURL", {
      value: revokeObjectURLMock,
      configurable: true,
    });

    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(clickSpy);
  });

  it("baixa o espelho de ponto com nome consistente", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({
      data: new Blob(["pdf"]),
      headers: {},
    } as never);

    await expect(
      FiscalService.downloadMirror("2026-04-01", "2026-04-30")
    ).resolves.toBe("Espelho_2026-04-01_2026-04-30.pdf");

    expect(getSpy).toHaveBeenCalledWith("/legal/espelho-ponto", {
      params: {
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
      responseType: "blob",
    });

    expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:fiscal");
  });

  it("baixa o AFD com nome padronizado", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({
      data: new Blob(["txt"]),
      headers: {},
    } as never);

    await expect(FiscalService.downloadAfd()).resolves.toBe("AFD.txt");

    expect(getSpy).toHaveBeenCalledWith("/legal/afd", {
      responseType: "blob",
    });
  });

  it("baixa o AEJ usando nome consistente", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({
      data: new Blob(["p7s"]),
      headers: {},
    } as never);

    await expect(
      FiscalService.downloadAej("2026-04-01", "2026-04-30")
    ).resolves.toBe("AEJ_2026-04-01_2026-04-30.p7s");

    expect(getSpy).toHaveBeenCalledWith("/legal/aej", {
      params: {
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
      responseType: "blob",
    });
  });

  it("baixa o atestado técnico com nome consistente", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({
      data: new Blob(["p7s"]),
      headers: {
        "content-disposition": 'attachment; filename="Atestado_Tecnico.p7s"',
      },
    } as never);

    await expect(FiscalService.downloadTechnicalCertificate()).resolves.toBe(
      "Atestado_Tecnico.p7s"
    );

    expect(getSpy).toHaveBeenCalledWith("/legal/technical-certificate", {
      responseType: "blob",
    });
  });

  it("normaliza erros de download", async () => {
    const getSpy = vi.spyOn(api, "get").mockRejectedValue(
      new Error("Falha inesperada")
    );

    await expect(FiscalService.downloadAfd()).rejects.toThrow("Falha inesperada");

    expect(getSpy).toHaveBeenCalledWith("/legal/afd", {
      responseType: "blob",
    });
  });
});
