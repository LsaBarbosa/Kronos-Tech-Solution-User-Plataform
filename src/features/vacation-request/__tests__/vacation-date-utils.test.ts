import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatVacationDate,
  formatVacationShortDate,
  getVacationPeriodSummary,
  getVacationRangeDayChips,
  isVacationDateDisabled,
} from "../utils/vacation-date-utils";

describe("vacation-date-utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00-03:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formata datas no padrão brasileiro", () => {
    const date = new Date("2026-06-15T12:00:00-03:00");

    expect(formatVacationDate(date)).toBe("15 jun 2026");
    expect(formatVacationShortDate(date)).toBe("15 jun");
  });

  it("monta o resumo do período selecionado", () => {
    const summary = getVacationPeriodSummary(
      new Date("2026-06-15T12:00:00-03:00"),
      new Date("2026-06-19T12:00:00-03:00")
    );

    expect(summary).toMatchObject({
      startLabel: "15 jun 2026",
      endLabel: "19 jun 2026",
      periodLabel: "15 jun → 19 jun",
      dayCount: 5,
      businessDays: 5,
      weekendCount: 0,
      isValid: true,
    });
  });

  it("gera chips para cada dia do intervalo", () => {
    const chips = getVacationRangeDayChips(
      new Date("2026-06-18T12:00:00-03:00"),
      new Date("2026-06-21T12:00:00-03:00")
    );

    expect(chips).toHaveLength(4);
    expect(chips.map((chip) => chip.dayLabel)).toEqual(["18", "19", "20", "21"]);
    expect(chips.some((chip) => chip.isWeekend)).toBe(true);
  });

  it("bloqueia datas passadas e permite a data atual", () => {
    expect(isVacationDateDisabled(new Date("2026-06-14T12:00:00-03:00"))).toBe(true);
    expect(isVacationDateDisabled(new Date("2026-06-15T12:00:00-03:00"))).toBe(false);
    expect(isVacationDateDisabled(new Date("2026-06-16T12:00:00-03:00"))).toBe(false);
  });
});
