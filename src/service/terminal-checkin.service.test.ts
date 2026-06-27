import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { submitTerminalCheckin } from "./terminal-checkin.service";

describe("terminal-checkin.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("autentica com face e reusa a mesma foto para registrar o ponto", async () => {
    let loginBody: Record<string, unknown> | null = null;
    let checkinBody: Record<string, unknown> | null = null;

    server.use(
      http.post("*/auth/login-face", async ({ request }) => {
        loginBody = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
      http.post("*/records/checkin", async ({ request }) => {
        checkinBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          actionType: "CHECKIN",
          message: "Entrada às 08:01! (NSR: 123)",
        });
      })
    );

    await expect(
      submitTerminalCheckin({
        faceImageBase64: "imagem-base64",
        latitude: -22.9,
        longitude: -43.2,
        accuracy: 18.5,
        livenessPassed: true,
      })
    ).resolves.toEqual({
      loginMessage: "Autenticação facial realizada com sucesso.",
      recordMessage: "Entrada às 08:01! (NSR: 123)",
      actionType: "CHECKIN",
      autoLogoutAfterSeconds: 10,
      recordedAt: null,
    });

    expect(loginBody).toEqual({
      faceImageBase64: "imagem-base64",
      livenessPassed: true,
    });
    expect(checkinBody).toEqual({
      faceImageBase64: "imagem-base64",
      latitude: -22.9,
      longitude: -43.2,
    });
  });

  it("interrompe o fluxo quando a autenticacao facial falha", async () => {
    const checkinSpy: { called: boolean } = { called: false };

    server.use(
      http.post("*/auth/login-face", () =>
        HttpResponse.json({ detail: "Face nao reconhecida." }, { status: 401 })
      ),
      http.post("*/records/checkin", async () => {
        checkinSpy.called = true;
        return HttpResponse.json({
          actionType: "CHECKOUT",
          message: "Nao deveria chegar aqui.",
        });
      })
    );

    await expect(
      submitTerminalCheckin({
        faceImageBase64: "imagem-base64",
        latitude: -22.9,
        longitude: -43.2,
      })
    ).rejects.toThrow();

    expect(checkinSpy.called).toBe(false);
  });
});
