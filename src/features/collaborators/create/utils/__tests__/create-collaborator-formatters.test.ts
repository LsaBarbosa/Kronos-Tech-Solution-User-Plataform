import { describe, expect, it } from "vitest";
import {
  cepMask,
  cpfMask,
  currencyMask,
  formatJourney,
  formatScheduleSummary,
  getCpfVerificationLabel,
  getHomeOfficeLabel,
  getUsernameVerificationLabel,
  phoneMask,
} from "../create-collaborator-formatters";

describe("create-collaborator-formatters", () => {
  it("aplica máscaras de CPF, telefone, CEP e moeda", () => {
    expect(cpfMask("12345678901")).toBe("123.456.789-01");
    expect(phoneMask("11999999999")).toBe("(11) 99999-9999");
    expect(cepMask("01001000")).toBe("01001-000");
    expect(currencyMask("4200")).toBe("R$ 42,00");
  });

  it("monta os resumos de escala e jornada", () => {
    expect(formatScheduleSummary("TRADITIONAL_5X2", ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"])).toContain(
      "Tradicional 5x2"
    );
    expect(
      formatJourney({
        workStartTime: "08:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        workEndTime: "17:00",
      })
    ).toBe("Entrada 08:00 · Intervalo 12:00 - 13:00 · Saída 17:00");
  });

  it("descreve os estados de CPF, username e home office", () => {
    expect(getCpfVerificationLabel("available")).toMatchObject({ label: "CPF verificado" });
    expect(getUsernameVerificationLabel("unavailable")).toMatchObject({ label: "Username indisponível" });
    expect(getHomeOfficeLabel("true")).toMatchObject({ title: "Dispensa geolocalização" });
  });
});
