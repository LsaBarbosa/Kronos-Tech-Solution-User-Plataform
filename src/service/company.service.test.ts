import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  checkCompanyCnpjAvailability,
  createCompany,
  fetchCompanyDetails,
  fetchCompanyList,
  getGeolocationFromCEP,
  toggleCompanyStatus,
  updateCompany,
} from "./company.service";
import type { CompanyData, CompanyListItem, CompanyUpdatePayload } from "@/types/company";

const companyListItem: CompanyListItem = {
  id: "company-1",
  name: "Kronos Tech",
  cnpj: "12345678000190",
  email: "contato@kronos.test",
  active: true,
  address: {
    street: "Rua Central",
    number: "100",
    postalCode: "01001000",
    city: "Sao Paulo",
    state: "SP",
  },
  location: {
    latitude: -23.55,
    longitude: -46.63,
  },
};

const companyDetails: CompanyData = {
  ...companyListItem,
  address: {
    ...companyListItem.address,
    neighborhood: "Centro",
  },
  activeEmployees: 8,
  inactiveEmployees: 2,
};

describe("company.service", () => {
  it("lista empresas usando envelope companies", async () => {
    server.use(
      http.get("*/companies", () =>
        HttpResponse.json({ companies: [companyListItem] })
      )
    );

    await expect(fetchCompanyList()).resolves.toEqual([companyListItem]);
  });

  it("busca detalhes de empresa por CNPJ", async () => {
    server.use(
      http.get("*/companies/:cnpj", ({ params }) => {
        expect(params.cnpj).toBe("12345678000190");
        return HttpResponse.json({ data: companyDetails });
      })
    );

    await expect(fetchCompanyDetails("12345678000190")).resolves.toEqual(
      companyDetails
    );
  });

  it("aceita detalhes de empresa sem location no contrato de leitura", async () => {
    server.use(
      http.get("*/companies/:cnpj", ({ params }) => {
        expect(params.cnpj).toBe("12345678000190");
        return HttpResponse.json({
          data: {
            ...companyDetails,
            location: undefined,
          },
        });
      })
    );

    const detailsWithoutLocation = await fetchCompanyDetails("12345678000190");

    expect(detailsWithoutLocation.cnpj).toBe("12345678000190");
    expect("location" in detailsWithoutLocation).toBe(false);
  });

  it("verifica disponibilidade de CNPJ pelo endpoint oficial", async () => {
    server.use(
      http.get("*/companies/check-cnpj", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("cnpj")).toBe("12345678000190");
        return new HttpResponse(null, { status: 404 });
      })
    );

    await expect(checkCompanyCnpjAvailability("12345678000190")).resolves.toBe(true);
  });

  it("cria empresa com payload oficial", async () => {
    const payload = {
      name: "Kronos Tech",
      cnpj: "12345678000190",
      email: "contato@kronos.test",
      address: {
        postalCode: "01001000",
        number: "100",
      },
      location: {
        latitude: -23.55,
        longitude: -46.63,
      },
    };

    server.use(
      http.post("*/companies", async ({ request }) => {
        await expect(request.json()).resolves.toEqual(payload);
        return new HttpResponse(null, { status: 201 });
      })
    );

    await expect(createCompany(payload)).resolves.toBeUndefined();
  });

  it("atualiza empresa com payload correto", async () => {
    const payload: CompanyUpdatePayload = {
      name: "Kronos Atualizada",
      email: "novo@kronos.test",
      active: true,
      address: {
        postalCode: "01311000",
        number: "200",
      },
      location: {
        latitude: -23.56,
        longitude: -46.65,
      },
    };

    server.use(
      http.patch("*/companies/:cnpj", async ({ params, request }) => {
        expect(params.cnpj).toBe("12345678000190");
        await expect(request.json()).resolves.toEqual(payload);
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(updateCompany("12345678000190", payload)).resolves.toBeUndefined();
  });

  it("alterna status da empresa sem enviar body", async () => {
    server.use(
      http.patch("*/companies/:cnpj/toggle-activate", async ({ params, request }) => {
        expect(params.cnpj).toBe("12345678000190");
        await expect(request.text()).resolves.toBe("");
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(toggleCompanyStatus("12345678000190")).resolves.toBeUndefined();
  });

  it("resolve geolocalização pelo endpoint interno do backend", async () => {
    server.use(
      http.post("*/geolocation/resolve", async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          postalCode: "01001000",
          number: "100",
        });

        return HttpResponse.json({
          latitude: -23.55052,
          longitude: -46.633308,
        });
      })
    );

    await expect(getGeolocationFromCEP("01001000", "100")).resolves.toEqual({
      latitude: -23.55052,
      longitude: -46.633308,
    });
  });

  it("propaga erro padronizado quando empresa nao existe", async () => {
    server.use(
      http.get("*/companies/:cnpj", () =>
        HttpResponse.json(
          { detail: "Empresa nao encontrada." },
          { status: 404 }
        )
      )
    );

    await expect(fetchCompanyDetails("00000000000000")).rejects.toMatchObject({
      kind: "http",
      status: 404,
      message: "Empresa nao encontrada.",
      response: {
        status: 404,
        data: { detail: "Empresa nao encontrada." },
      },
    });
  });

  it("falha ao resolver geolocalização com CEP inválido", async () => {
    server.use(
      http.post("*/geolocation/resolve", () =>
        HttpResponse.json(
          { detail: "CEP não encontrado ou inválido." },
          { status: 404 }
        )
      )
    );

    await expect(getGeolocationFromCEP("00000000", "100")).rejects.toThrow(
      "CEP não encontrado ou inválido."
    );
  });
});
