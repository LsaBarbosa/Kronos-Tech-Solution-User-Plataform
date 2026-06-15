import { describe, expect, it } from "vitest";
import {
  calculateVacationSpan,
  formatVacationDateLabel,
  formatVacationPeriodLabel,
  getInitials,
  getVacationApprovalStatus,
  mapVacationRequestToViewModel,
} from "../utils/vacation-approval-formatters";

describe("vacation approval formatters", () => {
  it("normaliza os status da fila", () => {
    expect(getVacationApprovalStatus("REQUEST_VACATION")).toBe("pending");
    expect(getVacationApprovalStatus("PENDING_APPROVAL")).toBe("pending");
    expect(getVacationApprovalStatus("VACATION")).toBe("approved");
    expect(getVacationApprovalStatus("VACATION_REJECTED")).toBe("rejected");
  });

  it("formata datas e período", () => {
    expect(formatVacationDateLabel("2026-06-01")).toBe("01/06/2026");
    expect(formatVacationDateLabel("01-06-2026")).toBe("01/06/2026");
    expect(formatVacationPeriodLabel("2026-06-01", "2026-06-07")).toBe("01/06/2026 → 07/06/2026");
  });

  it("calcula dias corridos, úteis e finais de semana", () => {
    const span = calculateVacationSpan("2026-06-01", "2026-06-07");

    expect(span.calendarDays).toBe(7);
    expect(span.businessDays).toBe(5);
    expect(span.weekendDays).toBe(2);
  });

  it("gera iniciais e view-model da solicitação", () => {
    expect(getInitials("Mariana Costa")).toBe("MC");

    const viewModel = mapVacationRequestToViewModel({
      employeeId: "emp-1",
      employeeName: "Mariana Costa",
      startDate: "2026-06-01",
      endDate: "2026-06-07",
      status: "REQUEST_VACATION",
      timeRecordIdsForApproval: [11, 12, 13],
    });

    expect(viewModel.key).toContain("emp-1");
    expect(viewModel.employeeInitials).toBe("MC");
    expect(viewModel.calendarDays).toBe(7);
    expect(viewModel.recordsCount).toBe(3);
    expect(viewModel.canDecide).toBe(true);
  });
});

