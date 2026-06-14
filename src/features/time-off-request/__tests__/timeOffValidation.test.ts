import { describe, expect, it } from "vitest";
import {
  canSubmitTimeOffRequest,
  getTimeOffStepValidationMessage,
  isTimeOffDateDisabled,
  validateTimeOffEvidenceFile,
  validateTimeOffRequest,
} from "../utils/timeOffValidation";
import { prepareEvidenceFile } from "../utils/timeOffEvidence";
import { MAX_UPLOAD_SIZE_BYTES } from "@/types/document";

describe("timeOffValidation", () => {
  it("rejects missing and inconsistent request data", () => {
    const result = validateTimeOffRequest({
      requestType: "",
      startDate: undefined,
      endDate: undefined,
      startHour: "",
      endHour: "",
      managerId: "",
      document: null,
    });

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.requestType).toBeDefined();
    expect(result.fieldErrors.startDate).toBeDefined();
  });

  it("rejects an end date before the start date", () => {
    const result = validateTimeOffRequest({
      requestType: "TIME_OFF_REQUEST",
      startDate: new Date(2026, 0, 12),
      endDate: new Date(2026, 0, 10),
      startHour: "09:00",
      endHour: "18:00",
      managerId: "manager-1",
      document: null,
    });

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.endDate).toBe("A data final não pode ser anterior à inicial.");
  });

  it("rejects same-day requests when the end time is not posterior", () => {
    const result = validateTimeOffRequest({
      requestType: "FORGOTTEN_REGISTRATION",
      startDate: new Date(2026, 0, 12),
      endDate: new Date(2026, 0, 12),
      startHour: "18:00",
      endHour: "09:00",
      managerId: "manager-1",
      document: null,
    });

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.endHour).toBe("A hora final precisa ser posterior à inicial no mesmo dia.");
  });

  it("validates evidence file constraints", () => {
    expect(validateTimeOffEvidenceFile(new File(["x"], "anexo.txt", { type: "text/plain" }))).toBe(
      "Tipo de arquivo não permitido. Use PDF, JPG, JPEG ou PNG."
    );
  });

  it("returns a distinct message when the file exceeds the size limit", () => {
    const oversizedPdf = new File([new Uint8Array(MAX_UPLOAD_SIZE_BYTES + 1)], "anexo.pdf", {
      type: "application/pdf",
    });

    expect(validateTimeOffEvidenceFile(oversizedPdf)).toBe("Arquivo muito grande. O limite é de 5MB.");
  });

  it("rejects unsupported image types before compression", async () => {
    const unsupportedImage = new File(["x"], "anexo.bmp", { type: "image/bmp" });

    await expect(prepareEvidenceFile(unsupportedImage)).resolves.toEqual({
      error: "Tipo de arquivo não permitido. Use PDF, JPG, JPEG ou PNG.",
    });
  });

  it("detects when a request can be submitted", () => {
    expect(
      canSubmitTimeOffRequest({
        requestType: "TIME_OFF_REQUEST",
        startDate: new Date(2026, 0, 12),
        endDate: new Date(2026, 0, 12),
        startHour: "09:00",
        endHour: "18:00",
        managerId: "manager-1",
        document: null,
      })
    ).toBe(true);
  });

  it("returns step messages for the guided flow", () => {
    const message = getTimeOffStepValidationMessage("manager", {
      requestType: "TIME_OFF_REQUEST",
      startDate: new Date(2026, 0, 12),
      endDate: new Date(2026, 0, 12),
      startHour: "09:00",
      endHour: "18:00",
      managerId: "",
      document: null,
    });

    expect(message).toBe("Selecione o gestor responsável.");
  });

  it("allows past dates to be selected", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    expect(isTimeOffDateDisabled(pastDate)).toBe(false);
  });

  it("accepts past dates in the request validation", () => {
    const pastStartDate = new Date(2024, 0, 10);
    const pastEndDate = new Date(2024, 0, 12);

    const result = validateTimeOffRequest({
      requestType: "FORGOTTEN_REGISTRATION",
      startDate: pastStartDate,
      endDate: pastEndDate,
      startHour: "08:00",
      endHour: "17:00",
      managerId: "manager-1",
      document: null,
    });

    expect(result.isValid).toBe(true);
  });
});
