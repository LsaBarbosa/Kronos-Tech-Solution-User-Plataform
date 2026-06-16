import { describe, expect, it } from "vitest";
import type { DetailedReportItem } from "@/utils/report-utils";
import {
  aggregateReportTotals,
  formatMinutesAsHHMM,
  formatMinutesAsSignedHHMM,
  getCompetenceLabel,
  getEventCategory,
  getPeriodBoundaries,
  parseSignedDurationToMinutes,
  parseUnsignedDurationToMinutes,
  STATUSES_EXCLUDED_FROM_WORKED_TOTAL,
} from "../detailed-report-export.helpers";

const baseRecord = (overrides: Partial<DetailedReportItem> = {}): DetailedReportItem => ({
  startWork: "01-06-2026",
  startHour: "08:00",
  endWork: "01-06-2026",
  endHour: "17:00",
  hoursWork: "08:00",
  balance: "00:00",
  statusRecord: "CREATED",
  edited: false,
  active: true,
  employeeId: "emp-1",
  employeeData: {
    employeeName: "Ana Souza",
    companyName: "Kronos Tech",
  },
  ...overrides,
});

describe("parseSignedDurationToMinutes", () => {
  it("parses positive HH:mm into minutes", () => {
    expect(parseSignedDurationToMinutes("08:00")).toBe(480);
    expect(parseSignedDurationToMinutes("01:30")).toBe(90);
  });

  it("parses signed durations", () => {
    expect(parseSignedDurationToMinutes("+02:15")).toBe(135);
    expect(parseSignedDurationToMinutes("-01:45")).toBe(-105);
  });

  it("returns 0 for empty/invalid input", () => {
    expect(parseSignedDurationToMinutes("")).toBe(0);
    expect(parseSignedDurationToMinutes(null)).toBe(0);
    expect(parseSignedDurationToMinutes(undefined)).toBe(0);
    expect(parseSignedDurationToMinutes("00:00")).toBe(0);
    expect(parseSignedDurationToMinutes("--:--")).toBe(0);
    expect(parseSignedDurationToMinutes("invalid")).toBe(0);
  });
});

describe("parseUnsignedDurationToMinutes", () => {
  it("always returns absolute value", () => {
    expect(parseUnsignedDurationToMinutes("08:00")).toBe(480);
    expect(parseUnsignedDurationToMinutes("-02:30")).toBe(150);
    expect(parseUnsignedDurationToMinutes("+00:45")).toBe(45);
  });
});

describe("formatMinutesAsHHMM / formatMinutesAsSignedHHMM", () => {
  it("formats unsigned minutes", () => {
    expect(formatMinutesAsHHMM(480)).toBe("08:00");
    expect(formatMinutesAsHHMM(0)).toBe("00:00");
    expect(formatMinutesAsHHMM(90)).toBe("01:30");
  });

  it("formats signed minutes with sign", () => {
    expect(formatMinutesAsSignedHHMM(0)).toBe("00:00");
    expect(formatMinutesAsSignedHHMM(60)).toBe("+01:00");
    expect(formatMinutesAsSignedHHMM(-95)).toBe("-01:35");
  });
});

describe("aggregateReportTotals", () => {
  it("sums worked hours excluding PENDING and IMPLICIT_BREAK", () => {
    const totals = aggregateReportTotals([
      baseRecord({ statusRecord: "CREATED", hoursWork: "08:00", balance: "00:00" }),
      baseRecord({ statusRecord: "IMPLICIT_BREAK", hoursWork: "01:00", balance: "00:00" }),
      baseRecord({ statusRecord: "PENDING", hoursWork: "00:00", balance: "00:00" }),
      baseRecord({ statusRecord: "CREATED", hoursWork: "09:00", balance: "+01:00" }),
    ]);
    expect(totals.totalWorkedMinutes).toBe(17 * 60); // 8 + 9
  });

  it("separates positive and negative balances", () => {
    const totals = aggregateReportTotals([
      baseRecord({ statusRecord: "CREATED", balance: "+01:30" }),
      baseRecord({ statusRecord: "CREATED", balance: "-00:45" }),
      baseRecord({ statusRecord: "CREATED", balance: "+02:00" }),
    ]);
    expect(totals.positiveMinutes).toBe(90 + 120);
    expect(totals.negativeMinutes).toBe(45);
    expect(totals.totalBalanceMinutes).toBe(90 + 120 - 45);
  });

  it("counts events by category", () => {
    const totals = aggregateReportTotals([
      baseRecord({ statusRecord: "CREATED" }),
      baseRecord({ statusRecord: "ABSENCE" }),
      baseRecord({ statusRecord: "DAY_OFF" }),
      baseRecord({ statusRecord: "VACATION" }),
      baseRecord({ statusRecord: "TIME_OFF" }),
      baseRecord({ statusRecord: "PENDING" }),
      baseRecord({ statusRecord: "IMPLICIT_BREAK" }),
    ]);
    expect(totals.countsByCategory.work).toBe(1);
    expect(totals.countsByCategory.absence).toBe(1);
    expect(totals.countsByCategory.day_off).toBe(1);
    expect(totals.countsByCategory.vacation).toBe(1);
    expect(totals.countsByCategory.time_off).toBe(1);
    expect(totals.countsByCategory.pending).toBe(1);
    expect(totals.countsByCategory.implicit_break).toBe(1);
    expect(totals.pendingCount).toBe(1);
  });

  it("counts geolocation and document presence", () => {
    const totals = aggregateReportTotals([
      baseRecord({ latitude: -23.5, longitude: -46.6 }),
      baseRecord({ documentId: "doc-abc" }),
      baseRecord({ endLatitude: 1, endLongitude: 2 }),
      baseRecord(),
    ]);
    expect(totals.geoCount).toBe(2);
    expect(totals.documentCount).toBe(1);
  });

  it("excludes PENDING and IMPLICIT_BREAK from worked total but still counts them", () => {
    const totals = aggregateReportTotals([
      baseRecord({ statusRecord: "PENDING", hoursWork: "08:00" }),
      baseRecord({ statusRecord: "IMPLICIT_BREAK", hoursWork: "01:00" }),
    ]);
    expect(totals.totalWorkedMinutes).toBe(0);
    expect(totals.totalRecords).toBe(2);
  });

  it("guarantees the worked-exclusion set has exactly PENDING and IMPLICIT_BREAK", () => {
    expect(STATUSES_EXCLUDED_FROM_WORKED_TOTAL.has("PENDING")).toBe(true);
    expect(STATUSES_EXCLUDED_FROM_WORKED_TOTAL.has("IMPLICIT_BREAK")).toBe(true);
    expect(STATUSES_EXCLUDED_FROM_WORKED_TOTAL.size).toBe(2);
  });
});

describe("getEventCategory", () => {
  it("maps approvals to work category", () => {
    expect(getEventCategory("CREATED")).toBe("work");
    expect(getEventCategory("UPDATED")).toBe("work");
    expect(getEventCategory("PENDING_APPROVAL")).toBe("work");
  });

  it("maps vacation and time-off chains", () => {
    expect(getEventCategory("VACATION")).toBe("vacation");
    expect(getEventCategory("REQUEST_VACATION")).toBe("vacation");
    expect(getEventCategory("TIME_OFF")).toBe("time_off");
    expect(getEventCategory("TIME_OFF_REQUEST")).toBe("time_off");
  });

  it("falls back to other for unknown statuses", () => {
    expect(getEventCategory("UNKNOWN")).toBe("other");
    expect(getEventCategory(null)).toBe("other");
  });
});

describe("getPeriodBoundaries / getCompetenceLabel", () => {
  it("computes period start/end correctly", () => {
    const dates = [
      new Date(2026, 5, 12),
      new Date(2026, 5, 1),
      new Date(2026, 5, 30),
    ];
    const { start, end } = getPeriodBoundaries(dates);
    expect(start?.getDate()).toBe(1);
    expect(end?.getDate()).toBe(30);
  });

  it("derives competence from the earliest date", () => {
    const dates = [new Date(2026, 5, 20), new Date(2026, 5, 1)];
    expect(getCompetenceLabel(dates).toLowerCase()).toContain("junho");
    expect(getCompetenceLabel(dates)).toContain("2026");
  });

  it("returns '—' for empty input", () => {
    expect(getCompetenceLabel([])).toBe("—");
  });
});
