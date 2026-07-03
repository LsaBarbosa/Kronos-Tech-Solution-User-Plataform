import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { toggleCompanyStatus } from "./company.service";

describe("toggleCompanyStatus", () => {
    it("chama PATCH /companies/{cnpj}/toggle-activate e retorna void em sucesso", async () => {
        server.use(
            http.patch("*/companies/12345678000199/toggle-activate", () =>
                new HttpResponse(null, { status: 204 })
            )
        );

        await expect(toggleCompanyStatus("12345678000199")).resolves.toBeUndefined();
    });

    it("inativa empresa inativa (toggle idempotente — backend decide o sentido)", async () => {
        server.use(
            http.patch("*/companies/99999999000191/toggle-activate", () =>
                new HttpResponse(null, { status: 204 })
            )
        );

        await expect(toggleCompanyStatus("99999999000191")).resolves.toBeUndefined();
    });

    it("propaga erro 403 quando chamado por role não-CTO", async () => {
        server.use(
            http.patch("*/companies/12345678000199/toggle-activate", () =>
                HttpResponse.json({ message: "Acesso negado." }, { status: 403 })
            )
        );

        await expect(toggleCompanyStatus("12345678000199")).rejects.toBeDefined();
    });

    it("propaga erro 404 quando empresa não existe", async () => {
        server.use(
            http.patch("*/companies/00000000000000/toggle-activate", () =>
                HttpResponse.json({ message: "Empresa não encontrada." }, { status: 404 })
            )
        );

        await expect(toggleCompanyStatus("00000000000000")).rejects.toBeDefined();
    });
});
