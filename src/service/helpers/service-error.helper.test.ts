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
    const error = normalizeHttpResponseError(429, {
      detail: "Relatório já está em processamento.",
    });

    expect(error).toMatchObject({
      kind: "rateLimit",
      status: 429,
      message: "Relatório já está em processamento.",
    });
  });

  it("extrai title e error quando detail nao existe", () => {
    const titleError = normalizeHttpResponseError(400, {
      title: "Título do erro.",
    });
    const errorField = normalizeHttpResponseError(400, {
      error: "Campo error prioritário.",
    });

    expect(titleError.message).toBe("Título do erro.");
    expect(errorField.message).toBe("Campo error prioritário.");
  });

  it("converte 429 sem corpo em rate limit com mensagem padrão", () => {
    const error = normalizeHttpResponseError(429);

    expect(error).toMatchObject({
      kind: "rateLimit",
      status: 429,
      message: "Processamento em andamento. Aguarde alguns instantes e tente novamente.",
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

  it("mantém detalhe do backend para 503 quando existir", () => {
    const error = normalizeHttpResponseError(503, {
      detail: "Redis indisponível para lock fiscal.",
    });

    expect(error).toMatchObject({
      kind: "serviceUnavailable",
      status: 503,
      message: "Redis indisponível para lock fiscal.",
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

  it("usa fallback da UI para erro axios sem mensagem legivel", () => {
    expect(getServiceErrorMessage(axiosError(503), "Mensagem de fallback")).toBe(
      "Serviço temporariamente indisponível. Tente novamente em instantes."
    );
  });

  it("converte 409 em conflito com mensagem amigável", () => {
    const error = normalizeServiceError(axiosError(409));
    expect(error).toMatchObject({
      kind: "conflict",
      status: 409,
      message: "Já existe um registro com esses dados.",
    });
  });

  it("mantém detalhe do backend para 409 quando existir", () => {
    const error = normalizeHttpResponseError(409, {
      detail: "CPF já cadastrado no sistema.",
    });
    expect(error).toMatchObject({
      kind: "conflict",
      status: 409,
      message: "CPF já cadastrado no sistema.",
    });
  });
});
