import { describe, expect, it } from "vitest";
import { ServiceError } from "./service-error.helper";
import { getAdministrativeErrorMessage } from "./admin-error-message.helper";

describe("admin-error-message.helper", () => {
  it("mapeia documento inválido para mensagem operacional", () => {
    const error = new ServiceError("Tipo MIME inválido.", {
      kind: "validation",
      status: 400,
    });

    expect(getAdministrativeErrorMessage(error, "document")).toBe(
      "O arquivo enviado não é aceito. Use PDF, JPG, PNG, DOC ou DOCX."
    );
  });

  it("mapeia relatório em processamento para mensagem de idempotência visual", () => {
    const error = new ServiceError(
      "Processamento em andamento. Aguarde alguns instantes e tente novamente.",
      {
      kind: "rateLimit",
      status: 429,
      }
    );

    expect(getAdministrativeErrorMessage(error, "fiscal")).toBe(
      "Processamento em andamento. Aguarde alguns instantes e tente novamente."
    );
  });

  it("mapeia indisponibilidade fiscal temporária", () => {
    const error = new ServiceError("Redis indisponível.", {
      kind: "serviceUnavailable",
      status: 503,
    });

    expect(getAdministrativeErrorMessage(error, "fiscal")).toBe(
      "Serviço temporariamente indisponível. Tente novamente em instantes."
    );
  });

  it("mapeia duplicidade de férias e abono", () => {
    expect(
      getAdministrativeErrorMessage(
        new ServiceError("Já existe registro no período.", { kind: "validation", status: 400 }),
        "vacation"
      )
    ).toBe("Já existe uma solicitação ou registro para esse período.");

    expect(
      getAdministrativeErrorMessage(
        new ServiceError("Já existe solicitação para a data.", { kind: "validation", status: 400 }),
        "timeOff"
      )
    ).toBe("Já existe registro ou solicitação para a data informada.");
  });
});
