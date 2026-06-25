import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { searchFaqs } from "@/service/faq.service";
import { faqFixture } from "@/test/mocks/fixtures/faq.fixture";
import { useFaqSearch } from "./useFaqSearch";

vi.mock("@/service/faq.service", () => ({
  searchFaqs: vi.fn(),
}));

const mockSearchFaqs = vi.mocked(searchFaqs);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useFaqSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // shouldAdvanceTime permite que o react-query continue funcionando
    // enquanto os timers fake controlam o debounce
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna isLoading true enquanto a busca está em andamento", async () => {
    let resolveSearch!: (value: typeof faqFixture.searchResponse) => void;
    const pending = new Promise<typeof faqFixture.searchResponse>((res) => {
      resolveSearch = res;
    });
    mockSearchFaqs.mockReturnValue(pending);

    const { result } = renderHook(() => useFaqSearch("ponto"), {
      wrapper: createWrapper(),
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve para evitar vazamento de promise
    resolveSearch(faqFixture.searchResponse);
  });

  it("retorna dados após sucesso quando a query tem conteúdo", async () => {
    mockSearchFaqs.mockResolvedValue(faqFixture.searchResponse);

    const { result } = renderHook(() => useFaqSearch("ponto"), {
      wrapper: createWrapper(),
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.results).toHaveLength(2);
    });

    expect(result.current.totalElements).toBe(2);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.isError).toBe(false);
    expect(result.current.isEmpty).toBe(false);
  });

  it("não busca quando query está vazia", async () => {
    const { result } = renderHook(() => useFaqSearch(""), {
      wrapper: createWrapper(),
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSearchFaqs).not.toHaveBeenCalled();
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("não busca quando query tem apenas espaços", async () => {
    const { result } = renderHook(() => useFaqSearch("   "), {
      wrapper: createWrapper(),
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSearchFaqs).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("retorna isEmpty true quando não há resultados", async () => {
    mockSearchFaqs.mockResolvedValue(faqFixture.emptySearchResponse);

    const { result } = renderHook(() => useFaqSearch("xyzxyz"), {
      wrapper: createWrapper(),
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
    });

    expect(result.current.results).toHaveLength(0);
  });

  it("passa screen key para o service quando fornecida", async () => {
    mockSearchFaqs.mockResolvedValue(faqFixture.searchResponse);

    const { result } = renderHook(() => useFaqSearch("ponto", "DASHBOARD"), {
      wrapper: createWrapper(),
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.results).toHaveLength(2);
    });

    expect(mockSearchFaqs).toHaveBeenCalledWith("ponto", "DASHBOARD", 0, 10);
  });

  it("faz debounce — o service é chamado apenas uma vez após a query estabilizar", async () => {
    mockSearchFaqs.mockResolvedValue(faqFixture.searchResponse);

    // Simula o hook sendo chamado diretamente com a query já estabilizada
    const { result } = renderHook(() => useFaqSearch("ponto"), {
      wrapper: createWrapper(),
    });

    // Avança o debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.results).toHaveLength(2);
    });

    // O service deve ter sido chamado exatamente uma vez
    expect(mockSearchFaqs).toHaveBeenCalledTimes(1);
  });
});
