import { describe, expect, it } from "vitest";
import {
  formatPhoneValue,
  getInitialsValue,
  maskCpfValue,
  maskSalaryValue,
  onlyDigits,
  shortHashValue,
} from "./mask-sensitive-data";

describe("mask-sensitive-data", () => {
  it("mantem apenas digitos", () => {
    expect(onlyDigits("(11) 99999-9999")).toBe("11999999999");
  });

  it("mascara CPF com 11 digitos", () => {
    expect(maskCpfValue("12345678901")).toBe("123.***.***-01");
  });

  it("formata telefone com 11 digitos", () => {
    expect(formatPhoneValue("11999999999")).toBe("(11) 99999-9999");
  });

  it("protege salario por padrao", () => {
    expect(maskSalaryValue(4500)).toBe("R$ ••••••");
  });

  it("encurta hash longo", () => {
    expect(shortHashValue("abcdef1234567890")).toBe("abcdef...7890");
  });

  it("extrai iniciais do nome", () => {
    expect(getInitialsValue("Maria Silva")).toBe("MS");
  });
});
