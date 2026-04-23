import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { loginWithFace, loginWithPassword } from "./auth.Service";

describe("auth.Service", () => {
  it("realiza login com sucesso e retorna token", async () => {
    server.use(
      http.post("*/auth/login", async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({ username: "ana", password: "senha123" });

        return HttpResponse.json({ token: "token-gerado" });
      })
    );

    await expect(
      loginWithPassword({ username: "ana", password: "senha123" })
    ).resolves.toEqual({ token: "token-gerado" });
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
    ).rejects.toThrow("Usuario ou senha invalidos.");
  });

  it("realiza login facial com sucesso e retorna token", async () => {
    server.use(
      http.post("*/auth/login-face", async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({ faceImageBase64: "imagem-base64" });

        return HttpResponse.json({ token: "token-face" });
      })
    );

    await expect(
      loginWithFace({ faceImageBase64: "imagem-base64" })
    ).resolves.toEqual({ token: "token-face" });
  });

  it("lança erro padronizado quando login facial falha", async () => {
    server.use(
      http.post("*/auth/login-face", () =>
        HttpResponse.json(
          { detail: "Face nao reconhecida." },
          { status: 401 }
        )
      )
    );

    await expect(
      loginWithFace({ faceImageBase64: "imagem-base64" })
    ).rejects.toThrow("Face nao reconhecida.");
  });
});
