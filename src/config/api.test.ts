import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { api, registerSessionExpiredHandler } from "./api";
import * as browser from "@/lib/browser";
import { server } from "@/test/mocks/server";

describe("api", () => {
  it("nao injeta Authorization header em requisicoes normais", async () => {
    localStorage.clear();

    server.use(
      http.get("http://localhost:3000/health", ({ request }) => {
        return HttpResponse.json({
          authorization: request.headers.get("authorization"),
        });
      })
    );

    const response = await api.get("http://localhost:3000/health");

    expect(response.data).toEqual({ authorization: null });
  });

  it("adiciona X-Correlation-Id em todas as requisicoes", async () => {
    server.use(
      http.get("http://localhost:3000/correlation", ({ request }) => {
        return HttpResponse.json({
          correlationId: request.headers.get("x-correlation-id"),
        });
      })
    );

    const response = await api.get("http://localhost:3000/correlation");

    expect(response.data.correlationId).toMatch(/^[-\w]+$/);
  });

  it("nao preserva Content-Type application/json em envio multipart", async () => {
    const formData = new FormData();
    formData.append("file", new File(["conteudo"], "teste.pdf", { type: "application/pdf" }));

    let observedContentType: unknown;

    const customAdapter = async (config: any) => {
      const headers = config.headers as any;

      observedContentType =
        typeof headers.get === "function"
          ? headers.get("Content-Type")
          : headers["Content-Type"] ?? headers["content-type"];

      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await api.post("http://localhost:3000/upload", formData, {
      headers: {
        "Content-Type": "application/json",
      },
      adapter: customAdapter as any,
    });

    expect(observedContentType).not.toBe("application/json");
  });

  it("trata 403 TERMS_NOT_ACCEPTED sem redirecionamento externo", async () => {
    const redirectSpy = vi.spyOn(browser, "redirectBrowserTo").mockImplementation(() => undefined);

    server.use(
      http.get("http://localhost:3000/terms-protected", () =>
        HttpResponse.json(
          {
            type: "TERMS_NOT_ACCEPTED",
            redirect_url: "https://terms.example.com/",
          },
          { status: 403 }
        )
      )
    );

    await expect(
      api.get("http://localhost:3000/terms-protected")
    ).rejects.toMatchObject({
      kind: "terms",
      status: 403,
      response: {
        status: 403,
        data: {
          type: "TERMS_NOT_ACCEPTED",
        },
      },
      redirectUrl: "https://terms.example.com/",
    });
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it("propaga responses de erro com status, payload e mensagem padronizada", async () => {
    server.use(
      http.get("http://localhost:3000/failure", () =>
        HttpResponse.json({ detail: "Falha controlada" }, { status: 500 })
      )
    );

    await expect(api.get("http://localhost:3000/failure")).rejects.toMatchObject({
      message: "Falha controlada",
      kind: "http",
      status: 500,
      response: {
        status: 500,
        data: { detail: "Falha controlada" },
      },
    });
  });

  it.each([
    [400, "validation", "Dados inválidos."],
    [401, "auth", "Sessão expirada ou acesso não autorizado."],
    [403, "auth", "Sessão expirada ou acesso não autorizado."],
    [429, "rateLimit", "Processamento em andamento. Aguarde alguns instantes e tente novamente."],
    [503, "serviceUnavailable", "Serviço temporariamente indisponível. Tente novamente em instantes."],
  ])("normaliza status HTTP %s como %s", async (status, kind, message) => {
    server.use(
      http.get("http://localhost:3000/status-normalization", () =>
        status === 400
          ? HttpResponse.json({ detail: "Dados inválidos." }, { status })
          : new HttpResponse(null, { status })
      )
    );

    await expect(api.get("http://localhost:3000/status-normalization")).rejects.toMatchObject({
      kind,
      status,
      message,
    });
  });

  it("chama callback de sessao expirada em resposta 401", async () => {
    const expiredCallback = vi.fn();
    registerSessionExpiredHandler(expiredCallback);

    server.use(
      http.get("http://localhost:3000/protected", () =>
        new HttpResponse(null, { status: 401 })
      )
    );

    await expect(api.get("http://localhost:3000/protected")).rejects.toMatchObject({
      kind: "auth",
      status: 401,
    });
    expect(expiredCallback).toHaveBeenCalledWith("expired");
  });
});
