import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { resolveCompanyGeolocation } from "./geolocation.service";

describe("geolocation.service", () => {
  it("resolve coordenadas pelo backend e normaliza a precisão", async () => {
    server.use(
      http.post("*/geolocation/resolve", async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          postalCode: "01001000",
          number: "100",
        });

        return HttpResponse.json({
          latitude: -23.5505199,
          longitude: -46.6333084,
        });
      })
    );

    await expect(
      resolveCompanyGeolocation("01001000", "100")
    ).resolves.toEqual({
      latitude: -23.55052,
      longitude: -46.633308,
    });
  });

  it("propaga a mensagem do backend quando o endereço é inválido", async () => {
    server.use(
      http.post("*/geolocation/resolve", () =>
        HttpResponse.json(
          { detail: "CEP não encontrado ou inválido." },
          { status: 404 }
        )
      )
    );

    await expect(
      resolveCompanyGeolocation("00000000", "10")
    ).rejects.toThrow("CEP não encontrado ou inválido.");
  });

  it("falha quando o backend não retorna coordenadas numéricas", async () => {
    server.use(
      http.post("*/geolocation/resolve", () =>
        HttpResponse.json({ latitude: null, longitude: -46.633308 })
      )
    );

    await expect(
      resolveCompanyGeolocation("01001000", "100")
    ).rejects.toThrow("Localização não encontrada para o endereço informado.");
  });
});
