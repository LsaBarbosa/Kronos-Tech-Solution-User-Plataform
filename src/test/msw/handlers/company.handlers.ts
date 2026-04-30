import { HttpResponse, http } from "msw";
import { companyFixture } from "../../mocks/fixtures/company.fixture";

export const companyHandlers = [
  http.get("*/companies", () => HttpResponse.json(companyFixture.list)),
  http.get("*/companies/check-cnpj", () => new HttpResponse(null, { status: 404 })),
  http.get("*/companies/:cnpj", () => HttpResponse.json(companyFixture.list.companies[0])),
  http.post("*/companies", () => new HttpResponse(null, { status: 201 })),
  http.patch("*/companies/:cnpj", () => new HttpResponse(null, { status: 204 })),
  http.patch("*/companies/:cnpj/toggle-activate", () => new HttpResponse(null, { status: 204 })),
];
