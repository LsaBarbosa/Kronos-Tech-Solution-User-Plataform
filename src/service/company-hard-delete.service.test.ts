import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { hardDeleteCompany } from "./company.service";

const mockResult = {
    companyCnpj: "12345678000199",
    companyName: "Empresa Teste",
    employeesDeleted: 3,
    externalCleanupFailures: 0,
    externalFailureDetails: [],
};

describe("hardDeleteCompany", () => {
    it("chama DELETE /companies/{cnpj}/hard-delete e retorna o resultado", async () => {
        server.use(
            http.delete("*/companies/12345678000199/hard-delete", () =>
                HttpResponse.json(mockResult)
            )
        );

        const result = await hardDeleteCompany("12345678000199");

        expect(result.companyCnpj).toBe("12345678000199");
        expect(result.companyName).toBe("Empresa Teste");
        expect(result.employeesDeleted).toBe(3);
        expect(result.externalCleanupFailures).toBe(0);
        expect(result.externalFailureDetails).toHaveLength(0);
    });

    it("retorna falhas externas quando sistemas externos não responderam", async () => {
        server.use(
            http.delete("*/companies/99999999000191/hard-delete", () =>
                HttpResponse.json({
                    companyCnpj: "99999999000191",
                    companyName: "Empresa Com Falha",
                    employeesDeleted: 1,
                    externalCleanupFailures: 2,
                    externalFailureDetails: [
                        "Rekognition: face collection not found for employee abc-123",
                        "S3: object key not found for employee def-456",
                    ],
                })
            )
        );

        const result = await hardDeleteCompany("99999999000191");

        expect(result.externalCleanupFailures).toBe(2);
        expect(result.externalFailureDetails).toHaveLength(2);
    });

    it("propaga erro quando backend retorna 404", async () => {
        server.use(
            http.delete("*/companies/00000000000000/hard-delete", () =>
                HttpResponse.json({ message: "Empresa não encontrada." }, { status: 404 })
            )
        );

        await expect(hardDeleteCompany("00000000000000")).rejects.toBeDefined();
    });
});
