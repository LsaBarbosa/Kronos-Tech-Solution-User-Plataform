import { HttpResponse, http } from "msw";
import { describe, expect, it, beforeEach } from "vitest";
import { server } from "@/test/mocks/server";
import { loginWithFace, loginWithPassword } from "./auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("realiza login com sucesso", async () => {
    server.use(
      http.post("*/auth/login", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ username: "ana", password: "senha123" });
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(
      loginWithPassword({ username: "ana", password: "senha123" })
    ).resolves.toBeUndefined();
  });

  it("lança erro padronizado quando credenciais sao invalidas", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json(
          { detail: "Usuario ou senha invalidos." },
          { status: 401 }
        )
      )
    );

    await expect(
      loginWithPassword({ username: "ana", password: "errada" })
    ).rejects.toThrow();
  });

  it("realiza login facial com sucesso", async () => {
    const livenessPassed = Boolean("captured-face");

    server.use(
      http.post("*/auth/login-face", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          faceImageBase64: "imagem-base64",
          livenessPassed,
        });
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(
      loginWithFace({ faceImageBase64: "imagem-base64", livenessPassed })
    ).resolves.toBeUndefined();
  });

  it("lança erro padronizado quando login facial falha", async () => {
    const livenessPassed = Boolean("captured-face");

    server.use(
      http.post("*/auth/login-face", () =>
        HttpResponse.json(
          { detail: "Face nao reconhecida." },
          { status: 401 }
        )
      )
    );

    await expect(
      loginWithFace({ faceImageBase64: "imagem-base64", livenessPassed })
    ).rejects.toThrow();
  });

  it("lança erro quando status code nao eh 204", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({ token: "token" }, { status: 200 })
      )
    );

    await expect(
      loginWithPassword({ username: "ana", password: "senha123" })
    ).rejects.toThrow("Login falhou. Resposta inesperada do servidor.");
  });
});
