import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardTodayPanel from "./DashboardTodayPanel";
import { useTodayTimeRecordStatus } from "@/hooks/useTodayTimeRecordStatus";
import type { TodayTimeRecordStatusResponse } from "@/types/today-time-record";

const openCheckinMock = vi.fn();
const refreshTodayMock = vi.fn();

const baseStatus: TodayTimeRecordStatusResponse = {
  date: "18-06-2026",
  status: "READY_TO_CHECKOUT",
  nextAction: "CHECK_OUT",
  lastRecordAt: "2026-06-18T12:01:00-03:00",
  lastRecordType: "CHECK_OUT",
  records: [
    {
      id: 1,
      actionType: "CHECK_IN",
      recordedAt: "2026-06-18T08:02:00-03:00",
      status: "CREATED",
      source: "BIOMETRIC",
    },
  ],
  source: "PERSISTED",
  timezone: "America/Sao_Paulo",
};

vi.mock("@/hooks/useCheckin", () => ({
  useCheckin: () => ({
    openCheckin: openCheckinMock,
    state: {
      status: "idle",
      lastAttemptAt: null,
    },
  }),
}));

vi.mock("@/hooks/useTodayTimeRecordStatus", () => ({
  useTodayTimeRecordStatus: vi.fn(),
}));

const mockUseTodayTimeRecordStatus = vi.mocked(useTodayTimeRecordStatus);

describe("DashboardTodayPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza estado de carregamento", () => {
    mockUseTodayTimeRecordStatus.mockReturnValue({
      todayStatus: null,
      isLoadingToday: true,
      todayError: null,
      refreshToday: refreshTodayMock,
    });

    render(
      <DashboardTodayPanel
        variant="desktop"
        onOpenMirror={vi.fn()}
        onOpenReport={vi.fn()}
      />
    );

    expect(screen.getByTestId("today-loading")).toBeInTheDocument();
  });

  it("renderiza estado de erro e permite retry", () => {
    mockUseTodayTimeRecordStatus.mockReturnValue({
      todayStatus: null,
      isLoadingToday: false,
      todayError: "Falha ao consultar o endpoint.",
      refreshToday: refreshTodayMock,
    });

    render(
      <DashboardTodayPanel
        variant="desktop"
        onOpenMirror={vi.fn()}
        onOpenReport={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));
    expect(refreshTodayMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza estado vazio sem registros", () => {
    mockUseTodayTimeRecordStatus.mockReturnValue({
      todayStatus: {
        ...baseStatus,
        status: "READY_TO_CHECKIN",
        nextAction: "CHECK_IN",
        lastRecordAt: null,
        lastRecordType: null,
        records: [],
      },
      isLoadingToday: false,
      todayError: null,
      refreshToday: refreshTodayMock,
    });

    render(
      <DashboardTodayPanel
        variant="mobile"
        onOpenMirror={vi.fn()}
        onOpenReport={vi.fn()}
      />
    );

    expect(screen.getByTestId("today-empty")).toHaveTextContent(
      "Nenhuma marcacao registrada ate agora."
    );
  });

  it("renderiza a timeline e metadados de source/timezone", () => {
    mockUseTodayTimeRecordStatus.mockReturnValue({
      todayStatus: baseStatus,
      isLoadingToday: false,
      todayError: null,
      refreshToday: refreshTodayMock,
    });

    render(
      <DashboardTodayPanel
        variant="desktop"
        onOpenMirror={vi.fn()}
        onOpenReport={vi.fn()}
      />
    );

    expect(screen.getByText("Linha do tempo do dia")).toBeInTheDocument();
    expect(screen.getByText("America/Sao_Paulo")).toBeInTheDocument();
    expect(screen.getByText("Banco principal")).toBeInTheDocument();
    expect(screen.getByText("Entrada")).toBeInTheDocument();
  });

  it("dispara openCheckin pelo CTA principal", () => {
    mockUseTodayTimeRecordStatus.mockReturnValue({
      todayStatus: baseStatus,
      isLoadingToday: false,
      todayError: null,
      refreshToday: refreshTodayMock,
    });

    render(
      <DashboardTodayPanel
        variant="desktop"
        onOpenMirror={vi.fn()}
        onOpenReport={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Registrar saida/i }));
    expect(openCheckinMock).toHaveBeenCalledTimes(1);
  });

  it("mantem o CTA de check-in disponivel apos duas marcacoes validas", () => {
    mockUseTodayTimeRecordStatus.mockReturnValue({
      todayStatus: {
        ...baseStatus,
        status: "COMPLETED",
        nextAction: "VIEW_REPORT",
        lastRecordType: "CHECK_OUT",
        records: [
          {
            id: 1,
            actionType: "CHECK_IN",
            recordedAt: "2026-06-18T08:02:00-03:00",
            status: "CREATED",
            source: "BIOMETRIC",
          },
          {
            id: 2,
            actionType: "CHECK_OUT",
            recordedAt: "2026-06-18T12:01:00-03:00",
            status: "CREATED",
            source: "BIOMETRIC",
          },
        ],
      },
      isLoadingToday: false,
      todayError: null,
      refreshToday: refreshTodayMock,
    });

    render(
      <DashboardTodayPanel
        variant="mobile"
        onOpenMirror={vi.fn()}
        onOpenReport={vi.fn()}
      />
    );

    const actionButtons = screen.getAllByRole("button", { name: /Registrar entrada/i });
    expect(actionButtons).toHaveLength(2);
    expect(actionButtons[0]).toBeEnabled();
    expect(actionButtons[1]).toBeEnabled();

    fireEvent.click(actionButtons[0]);
    fireEvent.click(actionButtons[1]);
    expect(openCheckinMock).toHaveBeenCalledTimes(2);
  });

  it("mantem o CTA habilitado quando o backend exige aceite do termo biometrico", () => {
    mockUseTodayTimeRecordStatus.mockReturnValue({
      todayStatus: {
        ...baseStatus,
        status: "TERMS_REQUIRED",
        nextAction: "ACCEPT_TERMS",
      },
      isLoadingToday: false,
      todayError: null,
      refreshToday: refreshTodayMock,
    });

    render(
      <DashboardTodayPanel
        variant="desktop"
        onOpenMirror={vi.fn()}
        onOpenReport={vi.fn()}
      />
    );

    const actionButton = screen.getByRole("button", { name: /Aceitar termo biometrico/i });
    expect(actionButton).toBeEnabled();

    fireEvent.click(actionButton);
    expect(openCheckinMock).toHaveBeenCalledTimes(1);
  });
});
