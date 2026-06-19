import { describe, expect, it, vi } from "vitest";
import { createSafeLogger } from "./safeLogger";

describe("safeLogger", () => {
  it("sanitiza payload de erro em desenvolvimento", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const logger = createSafeLogger({ isDevelopment: true });

    logger.error(
      "Falha com token eyJhbGciOiJIUzI1NiJ9.abc.def",
      new Error("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def cpf 12345678901"),
      {
        feature: "documents",
        token: "secret-token",
        cpf: "12345678901",
      }
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [, payload] = errorSpy.mock.calls[0];
    expect(payload.message).not.toContain("eyJhbGciOiJIUzI1NiJ9");
    expect(payload.error.message).toContain("Bearer [REDACTED]");
    expect(payload.error.message).not.toContain("12345678901");
    expect(payload.context.token).toBe("[REDACTED]");
    expect(payload.context.cpf).toBe("[CPF_REDACTED]");
  });

  it("não escreve no console em produção", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const logger = createSafeLogger({ isDevelopment: false });

    const payload = logger.error("Erro interno", new Error("secret"), { feature: "auth" });

    expect(errorSpy).not.toHaveBeenCalled();
    expect(payload.message).toBe("Erro interno");
    expect(payload.context?.feature).toBe("auth");
  });
});
