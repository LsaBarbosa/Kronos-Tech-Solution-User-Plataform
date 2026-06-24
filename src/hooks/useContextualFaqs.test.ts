import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getContextualFaqs } from "@/service/faq.service";
import { faqFixture } from "@/test/mocks/fixtures/faq.fixture";
import { useContextualFaqs } from "./useContextualFaqs";

vi.mock("@/service/faq.service", () => ({
  getContextualFaqs: vi.fn(),
}));

const mockGetContextualFaqs = vi.mocked(getContextualFaqs);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useContextualFaqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama o service com a screen key correta", async () => {
    mockGetContextualFaqs.mockResolvedValue(faqFixture.contextualResponse);

    const { result } = renderHook(() => useContextualFaqs("DASHBOARD"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    expect(mockGetContextualFaqs).toHaveBeenCalledWith("DASHBOARD", 5);
  });

  it("retorna lista de itens após sucesso", async () => {
    mockGetContextualFaqs.mockResolvedValue(faqFixture.contextualResponse);

    const { result } = renderHook(() => useContextualFaqs("DASHBOARD"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    expect(result.current.items[0].id).toBe("faq-1");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isEmpty).toBe(false);
  });

  it("chama o service com limit personalizado", async () => {
    mockGetContextualFaqs.mockResolvedValue({
      items: [faqFixture.item, faqFixture.itemDocuments],
      screenKey: "DOCUMENTS",
    });

    const { result } = renderHook(() => useContextualFaqs("DOCUMENTS", 3), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    expect(mockGetContextualFaqs).toHaveBeenCalledWith("DOCUMENTS", 3);
  });

  it("retorna isEmpty true quando a lista está vazia", async () => {
    mockGetContextualFaqs.mockResolvedValue({ items: [], screenKey: "AUDIT" });

    const { result } = renderHook(() => useContextualFaqs("AUDIT"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("expõe isError true quando o service falha", async () => {
    mockGetContextualFaqs.mockRejectedValue(new Error("Falha de rede"));

    const { result } = renderHook(() => useContextualFaqs("DASHBOARD"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("não executa a query quando screen está vazio", async () => {
    const { result } = renderHook(() => useContextualFaqs(""), {
      wrapper: createWrapper(),
    });

    // isLoading deve ser false imediatamente (enabled=false)
    expect(result.current.isLoading).toBe(false);
    expect(mockGetContextualFaqs).not.toHaveBeenCalled();
  });
});
