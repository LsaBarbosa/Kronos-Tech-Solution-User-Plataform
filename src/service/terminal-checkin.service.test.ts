import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { submitTerminalCheckin } from "./terminal-checkin.service";

describe("terminal-checkin.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("envia o contrato facial atômico para /auth/checkin-face", async () => {
    server.use(
      http.post("*/auth/checkin-face", async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({
          faceImageBase64: "imagem-base64",
          latitude: -22.9,
          longitude: -43.2,
          accuracy: 18.5,
          livenessPassed: true,
        });

        return HttpResponse.json({
          loginMessage: "Login realizado com sucesso.",
          recordMessage: "Entrada às 08:01! (NSR: 123)",
          actionType: "CHECKIN",
          autoLogoutAfterSeconds: 10,
          recordedAt: "2026-06-26T08:01:00-03:00",
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
      loginMessage: "Login realizado com sucesso.",
      recordMessage: "Entrada às 08:01! (NSR: 123)",
      actionType: "CHECKIN",
      autoLogoutAfterSeconds: 10,
      recordedAt: "2026-06-26T08:01:00-03:00",
    });
  });

  it("normaliza campos ausentes da resposta", async () => {
    server.use(
      http.post("*/auth/checkin-face", () =>
        HttpResponse.json({
          actionType: "CHECKOUT",
        })
      )
    );

    await expect(
      submitTerminalCheckin({
        faceImageBase64: "imagem-base64",
        latitude: -22.9,
        longitude: -43.2,
      })
    ).resolves.toEqual({
      loginMessage: "Autenticação facial realizada com sucesso.",
      recordMessage: "Registro realizado com sucesso.",
      actionType: "CHECKOUT",
      autoLogoutAfterSeconds: 10,
      recordedAt: null,
    });
  });
});
