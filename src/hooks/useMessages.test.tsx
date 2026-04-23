import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { deleteMessage, fetchMessages } from "@/service/message.service";
import { useMessages } from "./useMessages";

const navigateMock = vi.fn();
const toastMock = vi.fn();
const logoutMock = vi.fn();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/service/message.service", () => ({
  fetchMessages: vi.fn(),
  deleteMessage: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockUseToast = vi.mocked(useToast);
const mockFetchMessages = vi.mocked(fetchMessages);
const mockDeleteMessage = vi.mocked(deleteMessage);

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockUseToast.mockReturnValue({ toast: toastMock } as any);
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "MANAGER",
      token: "token-valido",
      isAuthenticated: true,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: logoutMock,
    });
  });

  it("carrega a lista de mensagens", async () => {
    mockFetchMessages.mockResolvedValue([
      {
        messageId: "msg-1",
        title: "Aviso",
        messageText: "Conteudo",
        priority: "NORMAL",
        createdAt: "2026-04-23T10:00:00Z",
        senderEmployeeId: "emp-1",
      },
    ]);

    const { result } = renderHook(() => useMessages(), { wrapper });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    expect(result.current.userRole).toBe("MANAGER");
  });

  it("exclui mensagem e atualiza o estado local", async () => {
    mockFetchMessages
      .mockResolvedValueOnce([
        {
          messageId: "msg-1",
          title: "Aviso",
          messageText: "Conteudo",
          priority: "NORMAL",
          createdAt: "2026-04-23T10:00:00Z",
          senderEmployeeId: "emp-1",
        },
      ])
      .mockResolvedValueOnce([]);
    mockDeleteMessage.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMessages(), { wrapper });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    await act(async () => {
      result.current.handleOpenMessage(result.current.messages[0]);
    });

    await act(async () => {
      result.current.handleConfirmDelete();
    });

    await act(async () => {
      await result.current.handleDeleteMessage();
    });

    expect(mockDeleteMessage).toHaveBeenCalledWith("msg-1", expect.any(Object));
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.isConfirmDeleteDialogOpen).toBe(false);
  });
});
