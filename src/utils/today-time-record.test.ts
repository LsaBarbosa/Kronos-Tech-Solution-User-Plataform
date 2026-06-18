import { describe, expect, it } from "vitest";
import {
  formatTodayRecordedAt,
  getTodayActionTypeLabel,
  getTodayNextActionLabel,
  getTodayPendingCount,
  getTodaySequenceSummary,
  getTodayStatusLabel,
  getTodayWorkedTimeLabel,
} from "./today-time-record";
import type { TodayTimeRecordStatusResponse } from "@/types/today-time-record";

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
      recordedAt: "2026-06-18T08:00:00-03:00",
      status: "CREATED",
      source: "BIOMETRIC",
    },
    {
      id: 1,
      actionType: "CHECK_OUT",
      recordedAt: "2026-06-18T12:01:00-03:00",
      status: "PENDING",
      source: "BIOMETRIC",
    },
  ],
  source: "PERSISTED",
  timezone: "America/Sao_Paulo",
};

describe("today-time-record utils", () => {
  it("formata labels principais do dominio", () => {
    expect(getTodayStatusLabel("READY_TO_CHECKOUT")).toBe("Jornada em andamento");
    expect(getTodayNextActionLabel("CHECK_OUT")).toBe("Registrar saida");
    expect(getTodayActionTypeLabel("CHECK_IN")).toBe("Entrada");
  });

  it("conta pendencias e resume a sequencia", () => {
    expect(getTodayPendingCount(baseStatus)).toBe(1);

    expect(getTodaySequenceSummary(baseStatus)).toMatchObject({
      label: "Revisar",
    });
  });

  it("calcula o tempo trabalhado a partir da timeline", () => {
    expect(getTodayWorkedTimeLabel(baseStatus)).toBe("04h01");
  });

  it("formata horario de marcacao com fallback", () => {
    expect(formatTodayRecordedAt("2026-06-18T08:02:00-03:00")).toMatch(/08:02/);
    expect(formatTodayRecordedAt("18-06-2026")).toBe("18/06/2026");
    expect(formatTodayRecordedAt("valor-bruto")).toBe("valor-bruto");
  });
});
