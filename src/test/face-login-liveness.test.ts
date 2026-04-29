/**
 * Testes de contrato — login facial com liveness (História 1.1)
 *
 * Garantias:
 * 1. loginWithFace envia `livenessPassed` no payload.
 * 2. O campo `livenessPassed` aceita booleano vindo de variável, não literal.
 * 3. Resposta sem token lança erro.
 */

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { loginWithFace } from "@/service/auth.service";
import { server } from "@/test/mocks/server";

/** Base64 mínimo que representa uma imagem simulada para testes. */
const MOCK_FACE_BASE64 = "AAABBBCCC_MOCK_IMAGE_DATA";

describe("loginWithFace — contrato de liveness (História 1.1)", () => {
  it("envia livenessPassed=true quando o estado indica que passou", async () => {
    // Simula o estado que o FaceLoginModal definiria após validateLiveness
    const livenessPassed = true;

    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post("*/auth/login-face", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ token: "face-token-ok" });
      })
    );

    await loginWithFace({ faceImageBase64: MOCK_FACE_BASE64, livenessPassed });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody).toHaveProperty("faceImageBase64", MOCK_FACE_BASE64);
    // Campo livenessPassed deve estar presente no payload enviado ao backend.
    expect(capturedBody).toHaveProperty("livenessPassed", true);
  });

  it("envia livenessPassed=false quando a validação não passou", async () => {
    // Simula o cenário onde validateLiveness retornou false
    const livenessPassed = false;

    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post("*/auth/login-face", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ token: "face-token-ok" });
      })
    );

    await loginWithFace({ faceImageBase64: MOCK_FACE_BASE64, livenessPassed });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody).toHaveProperty("livenessPassed", false);
  });

  it("lança erro quando o backend retorna resposta sem token", async () => {
    server.use(
      http.post("*/auth/login-face", () =>
        HttpResponse.json({}, { status: 200 })
      )
    );

    await expect(
      loginWithFace({ faceImageBase64: MOCK_FACE_BASE64, livenessPassed: true })
    ).rejects.toThrow("Resposta de login facial sem token.");
  });

  it("lança erro quando o backend retorna 401", async () => {
    server.use(
      http.post("*/auth/login-face", () =>
        HttpResponse.json(
          { detail: "Rosto não reconhecido." },
          { status: 401 }
        )
      )
    );

    await expect(
      loginWithFace({ faceImageBase64: MOCK_FACE_BASE64, livenessPassed: true })
    ).rejects.toThrow();
  });
});
