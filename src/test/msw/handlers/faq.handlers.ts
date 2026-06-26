import { HttpResponse, http } from "msw";
import { faqFixture } from "../../mocks/fixtures/faq.fixture";

export const faqHandlers = [
  http.get("*/faqs/search", () => HttpResponse.json(faqFixture.searchResponse)),
  http.get("*/faqs/contextual", () => HttpResponse.json(faqFixture.contextualResponse)),
  http.get("*/faqs/:faqId", () => HttpResponse.json(faqFixture.item)),
];
