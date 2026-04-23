import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { api, buildTermsRedirectUrl } from "./api";
import { server } from "@/test/mocks/server";

describe("api", () => {
  it("adiciona Authorization com o token do localStorage", async () => {
    localStorage.setItem("token", "abc-123");

    server.use(
      http.get("http://localhost:3000/health", ({ request }) => {
        return HttpResponse.json({
          authorization: request.headers.get("authorization"),
        });
      })
    );

    const response = await api.get("http://localhost:3000/health");

    expect(response.data).toEqual({ authorization: "Bearer abc-123" });
  });

  it("monta URL de redirecionamento para aceite de termos", () => {
    expect(
      buildTermsRedirectUrl(
        "https://termo.kronossolutions.tech/",
        "http://localhost:3000/dashboard"
      )
    ).toBe(
      "https://termo.kronossolutions.tech/?returnUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard"
    );
  });

  it("trata 403 TERMS_NOT_ACCEPTED preservando dados do erro", async () => {
    server.use(
      http.get("http://localhost:3000/terms-protected", () =>
        HttpResponse.json(
          {
            type: "TERMS_NOT_ACCEPTED",
            redirect_url: "https://termo.kronossolutions.tech/",
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
    });
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
});
