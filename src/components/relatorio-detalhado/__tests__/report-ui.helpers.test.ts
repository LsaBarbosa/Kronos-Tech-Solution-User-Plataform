import { describe, expect, it } from "vitest";
import { formatSelectedDatesLabel, isValidReferenceTime, summarizeDetailedReport } from "@/components/relatorio-detalhado/report-ui.helpers";
import type { DetailedReportItem } from "@/utils/report-utils";

const buildRecord = (overrides: Partial<DetailedReportItem> = {}): DetailedReportItem =>
  ({
    startWork: "13-06-2026",
    startHour: "08:00",
    endWork: "13-06-2026",
    endHour: "17:00",
    hoursWork: "08:00",
    balance: "+01:00",
    statusRecord: "CREATED",
    edited: false,
    active: true,
    employeeId: "employee-1",
    employeeData: {
      employeeName: "Pessoa Exemplo",
      companyName: "Kronos",
    },
    ...overrides,
  }) as DetailedReportItem;

describe("report-ui.helpers", () => {
  it("validates the reference time format", () => {
    expect(isValidReferenceTime("08:00")).toBe(true);
    expect(isValidReferenceTime("8:00")).toBe(false);
    expect(isValidReferenceTime("25:00")).toBe(false);
  });

  it("summarizes selected dates with overflow indicator", () => {
    const label = formatSelectedDatesLabel([
      new Date(2026, 5, 13),
      new Date(2026, 5, 14),
      new Date(2026, 5, 15),
      new Date(2026, 5, 16),
    ]);

    expect(label).toContain("+1");
  });

  it("summarizes detailed report totals using unique days for balance", () => {
    const summary = summarizeDetailedReport(
      [
        buildRecord({ hoursWork: "08:00", balance: "+01:00", statusRecord: "CREATED" }),
        buildRecord({ hoursWork: "07:30", balance: "+02:00", statusRecord: "CREATED" }),
        buildRecord({
          startWork: "14-06-2026",
          endWork: "14-06-2026",
          hoursWork: "04:30",
          balance: "-00:30",
          statusRecord: "ABSENCE",
        }),
      ],
      [new Date(2026, 5, 13), new Date(2026, 5, 14)]
    );

    expect(summary.totalRecords).toBe(3);
    expect(summary.totalWorkedHours).toBe("20:00");
    expect(summary.totalBalance).toBe("+00:30");
    expect(summary.mostRecurringStatus).toBe("Criado");
    expect(summary.periodLabel).toBe("13/06/2026 a 14/06/2026");
  });
});
