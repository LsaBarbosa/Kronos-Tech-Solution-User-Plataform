import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canSubmitVacationRequest, getVacationValidationMessage } from "../utils/vacation-validation";

describe("vacation-validation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00-03:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exige período, datas válidas e manager", () => {
    expect(getVacationValidationMessage({ startDate: undefined, endDate: undefined, managerId: "" })).toBe(
      "Selecione o período solicitado."
    );
    expect(
      getVacationValidationMessage({
        startDate: new Date("2026-06-15T12:00:00-03:00"),
        endDate: undefined,
        managerId: "",
      })
    ).toBe("Selecione a data final.");
    expect(
      getVacationValidationMessage({
        startDate: new Date("2026-06-15T12:00:00-03:00"),
        endDate: new Date("2026-06-19T12:00:00-03:00"),
        managerId: "",
      })
    ).toBe("Selecione o manager responsável pela aprovação.");
  });

  it("bloqueia período passado ou invertido", () => {
    expect(
      getVacationValidationMessage({
        startDate: new Date("2026-06-14T12:00:00-03:00"),
        endDate: new Date("2026-06-16T12:00:00-03:00"),
        managerId: "manager-1",
      })
    ).toBe("O período precisa ser atual ou futuro.");

    expect(
      getVacationValidationMessage({
        startDate: new Date("2026-06-16T12:00:00-03:00"),
        endDate: new Date("2026-06-15T12:00:00-03:00"),
        managerId: "manager-1",
      })
    ).toBe("A data final não pode ser anterior à inicial.");
  });

  it("permite envio quando os dados estão válidos", () => {
    const selection = {
      startDate: new Date("2026-06-15T12:00:00-03:00"),
      endDate: new Date("2026-06-19T12:00:00-03:00"),
      managerId: "manager-1",
    };

    expect(getVacationValidationMessage(selection)).toBeUndefined();
    expect(canSubmitVacationRequest(selection)).toBe(true);
  });
});
