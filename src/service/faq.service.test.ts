import { HttpResponse, http } from "msw";
import { describe, expect, it, beforeEach } from "vitest";
import { server } from "@/test/mocks/server";
import { faqFixture } from "@/test/mocks/fixtures/faq.fixture";
import { searchFaqs, getContextualFaqs, getFaqById } from "./faq.service";

describe("faq.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("searchFaqs", () => {
    it("retorna dados paginados corretamente", async () => {
      server.use(
        http.get("*/faqs/search", () =>
          HttpResponse.json(faqFixture.searchResponse)
        )
      );

      const result = await searchFaqs("ponto");

      expect(result.items).toHaveLength(2);
      expect(result.totalElements).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.page).toBe(0);
      expect(result.size).toBe(10);
    });

    it("passa query, screen, page e size como params", async () => {
      server.use(
        http.get("*/faqs/search", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("query")).toBe("ponto");
          expect(url.searchParams.get("screen")).toBe("DASHBOARD");
          expect(url.searchParams.get("page")).toBe("1");
          expect(url.searchParams.get("size")).toBe("5");
          return HttpResponse.json(faqFixture.searchResponse);
        })
      );

      await expect(searchFaqs("ponto", "DASHBOARD", 1, 5)).resolves.toMatchObject({
        totalElements: 2,
      });
    });

    it("não envia query quando a string está vazia", async () => {
      server.use(
        http.get("*/faqs/search", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.has("query")).toBe(false);
          return HttpResponse.json(faqFixture.emptySearchResponse);
        })
      );

      await expect(searchFaqs("")).resolves.toMatchObject({ totalElements: 0 });
    });

    it("trata erro 403 lançando erro padronizado", async () => {
      server.use(
        http.get("*/faqs/search", () =>
          HttpResponse.json({ detail: "Acesso negado." }, { status: 403 })
        )
      );

      await expect(searchFaqs("ponto")).rejects.toThrow();
    });

    it("trata erro 404 lançando erro padronizado", async () => {
      server.use(
        http.get("*/faqs/search", () =>
          HttpResponse.json({ detail: "Recurso não encontrado." }, { status: 404 })
        )
      );

      await expect(searchFaqs("ponto")).rejects.toThrow();
    });
  });

  describe("getContextualFaqs", () => {
    it("retorna lista de itens contextuais", async () => {
      server.use(
        http.get("*/faqs/contextual", () =>
          HttpResponse.json(faqFixture.contextualResponse)
        )
      );

      const result = await getContextualFaqs("DASHBOARD");

      expect(result.items).toHaveLength(1);
      expect(result.screen).toBe("DASHBOARD");
    });

    it("passa screen e limit corretamente", async () => {
      server.use(
        http.get("*/faqs/contextual", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("screen")).toBe("DOCUMENTS");
          expect(url.searchParams.get("limit")).toBe("3");
          return HttpResponse.json({
            items: [faqFixture.itemDocuments],
            screen: "DOCUMENTS",
          });
        })
      );

      const result = await getContextualFaqs("DOCUMENTS", 3);
      expect(result.items).toHaveLength(1);
    });

    it("trata erro 403 lançando erro padronizado", async () => {
      server.use(
        http.get("*/faqs/contextual", () =>
          HttpResponse.json({ detail: "Acesso negado." }, { status: 403 })
        )
      );

      await expect(getContextualFaqs("DASHBOARD")).rejects.toThrow();
    });

    it("trata erro 404 lançando erro padronizado", async () => {
      server.use(
        http.get("*/faqs/contextual", () =>
          HttpResponse.json({ detail: "Tela não encontrada." }, { status: 404 })
        )
      );

      await expect(getContextualFaqs("DASHBOARD")).rejects.toThrow();
    });
  });

  describe("getFaqById", () => {
    it("retorna artigo completo pelo ID", async () => {
      server.use(
        http.get("*/faqs/:faqId", () =>
          HttpResponse.json(faqFixture.item)
        )
      );

      const result = await getFaqById("faq-1");

      expect(result.id).toBe("faq-1");
      expect(result.title).toBe("Como registrar meu ponto?");
      expect(result.fullAnswer).toBeTruthy();
      expect(result.category).toMatchObject({ id: "cat-1", name: "Ponto" });
    });

    it("trata erro 403 lançando erro padronizado", async () => {
      server.use(
        http.get("*/faqs/:faqId", () =>
          HttpResponse.json({ detail: "Acesso negado." }, { status: 403 })
        )
      );

      await expect(getFaqById("faq-secreto")).rejects.toThrow();
    });

    it("trata erro 404 lançando erro padronizado", async () => {
      server.use(
        http.get("*/faqs/:faqId", () =>
          HttpResponse.json({ detail: "FAQ não encontrado." }, { status: 404 })
        )
      );

      await expect(getFaqById("faq-inexistente")).rejects.toThrow();
    });
  });
});
