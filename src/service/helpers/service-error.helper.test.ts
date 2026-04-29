import { describe, expect, it } from "vitest";
import {
  getServiceErrorMessage,
  normalizeHttpResponseError,
  normalizeServiceError,
} from "./service-error.helper";

const axiosError = (status?: number, data?: unknown) => ({
  isAxiosError: true,
  name: "AxiosError",
  message: "Request failed",
  response: status ? { status, data } : undefined,
  toJSON: () => ({}),
});

describe("service-error.helper", () => {
  it("converte 400 em mensagem de validação", () => {
    const error = normalizeServiceError(
      axiosError(400, { detail: "CPF inválido." })
    );

    expect(error).toMatchObject({
      kind: "validation",
      status: 400,
      message: "CPF inválido.",
      response: {
        status: 400,
        data: { detail: "CPF inválido." },
      },
    });
  });

  it("converte 401 e 403 em erro de autenticação", () => {
    const unauthorized = normalizeServiceError(axiosError(401));
    const forbidden = normalizeServiceError(axiosError(403));

    expect(unauthorized).toMatchObject({
      kind: "auth",
      status: 401,
      message: "Sessão expirada ou acesso não autorizado.",
    });
    expect(forbidden).toMatchObject({
      kind: "auth",
      status: 403,
      message: "Sessão expirada ou acesso não autorizado.",
    });
  });

  it("converte 429 em rate limit com mensagem amigável", () => {
    const error = normalizeServiceError(
      axiosError(429, { detail: "Processamento em andamento." })
    );

    expect(error).toMatchObject({
      kind: "rateLimit",
      status: 429,
      message: "Processamento em andamento.",
    });
  });

  it("converte 503 em indisponibilidade temporária", () => {
    const error = normalizeServiceError(axiosError(503));

    expect(error).toMatchObject({
      kind: "serviceUnavailable",
      status: 503,
      message: "Serviço temporariamente indisponível. Tente novamente em instantes.",
    });
  });

  it("usa fallback genérico quando não há corpo legível", () => {
    const error = normalizeHttpResponseError(500);

    expect(error).toMatchObject({
      kind: "http",
      status: 500,
      message: "Erro de API (Status 500).",
    });
  });

  it("extrai mensagem comum para a UI", () => {
    const error = normalizeHttpResponseError(400, {
      errors: {
        username: ["Nome de usuário obrigatório."],
      },
    });

    expect(getServiceErrorMessage(error)).toBe("Nome de usuário obrigatório.");
  });
});
