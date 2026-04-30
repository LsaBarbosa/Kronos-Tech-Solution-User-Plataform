import { HttpResponse, http } from "msw";
import { legalFixture } from "../../mocks/fixtures/legal.fixture";

export const legalHandlers = [
  http.get("*/legal/technical-certificate", () => new HttpResponse(legalFixture.technicalCertificate)),
  http.get("*/legal/afd", () => new HttpResponse(legalFixture.afd)),
  http.get("*/legal/aej", () => new HttpResponse(legalFixture.aej)),
  http.get("*/legal/espelho-ponto", () => new HttpResponse(legalFixture.mirror)),
];
