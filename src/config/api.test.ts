import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { api, registerSessionExpiredHandler } from "./api";
import * as browser from "@/lib/browser";
import * as csrfService from "@/service/csrf.service";
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

  it.each([
    ["code", "TERMS_NOT_ACCEPTED"],
    ["type", "TERMS_NOT_ACCEPTED"],
  ])("trata 403 TERMS_NOT_ACCEPTED em %s sem redirecionamento externo", async (field, value) => {
    const redirectSpy = vi.spyOn(browser, "redirectBrowserTo").mockImplementation(() => undefined);

    server.use(
      http.get("http://localhost:3000/terms-protected", () =>
        HttpResponse.json(
          {
            [field]: value,
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
          [field]: value,
        },
      },
      redirectUrl: "https://terms.example.com/",
    });
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it.each(["CSRF_TOKEN_INVALID", "CSRF_INVALID"])(
    "invalida cache de CSRF quando o back retorna %s",
    async (code) => {
      const invalidateSpy = vi.spyOn(csrfService, "invalidateCsrfToken");

      server.use(
        http.post("http://localhost:3000/csrf-protected", () =>
          HttpResponse.json({ code }, { status: 403 })
        )
      );

      await expect(api.post("http://localhost:3000/csrf-protected", {})).rejects.toMatchObject({
        status: 403,
      });
      expect(invalidateSpy).toHaveBeenCalled();
      invalidateSpy.mockRestore();
    }
  );

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

  it("shouldCallSessionExpiredHandlerWithBiometricConsentRevokedWhen401HasRevocationHeader", async () => {
    const expiredCallback = vi.fn();
    registerSessionExpiredHandler(expiredCallback);

    server.use(
      http.get("http://localhost:3000/protected", () =>
        new HttpResponse(null, {
          status: 401,
          headers: {
            "x-session-revoked-reason": "BIOMETRIC_CONSENT_REVOKED",
          },
        })
      )
    );

    await expect(api.get("http://localhost:3000/protected")).rejects.toMatchObject({
      kind: "auth",
      status: 401,
    });
    expect(expiredCallback).toHaveBeenCalledWith("biometric_consent_revoked");
  });

  it("shouldCallSessionExpiredHandlerWithRevokedWhen401HasSessionRevokedCode", async () => {
    const expiredCallback = vi.fn();
    registerSessionExpiredHandler(expiredCallback);

    server.use(
      http.get("http://localhost:3000/protected", () =>
        HttpResponse.json(
          { code: "SESSION_REVOKED" },
          { status: 401 }
        )
      )
    );

    await expect(api.get("http://localhost:3000/protected")).rejects.toMatchObject({
      kind: "auth",
      status: 401,
    });
    expect(expiredCallback).toHaveBeenCalledWith("revoked");
  });

  it("shouldCallSessionExpiredHandlerWithExpiredWhen401HasNoRevocationSignal", async () => {
    const expiredCallback = vi.fn();
    registerSessionExpiredHandler(expiredCallback);

    server.use(
      http.get("http://localhost:3000/protected", () =>
        HttpResponse.json({}, { status: 401 })
      )
    );

    await expect(api.get("http://localhost:3000/protected")).rejects.toMatchObject({
      kind: "auth",
      status: 401,
    });
    expect(expiredCallback).toHaveBeenCalledWith("expired");
  });
});
