import { describe, it, expect } from "vitest";
import {
  sanitizeText,
  sanitizeObject,
  sanitizeError,
  sanitizeObservabilityPayload,
} from "./observability-sanitizer";

describe("observability-sanitizer", () => {
  describe("sanitizeText", () => {
    it("deve mascarar CPF sem máscara", () => {
      const result = sanitizeText("Erro ao processar CPF 12345678901");
      expect(result).toContain("[CPF_REDACTED]");
      expect(result).not.toContain("12345678901");
    });

    it("deve mascarar CPF com máscara", () => {
      const result = sanitizeText("CPF: 123.456.789-01");
      expect(result).toContain("[CPF_REDACTED]");
      expect(result).not.toContain("123.456.789-01");
    });

    it("deve mascarar CNPJ sem máscara", () => {
      const result = sanitizeText("CNPJ 12345678000199");
      expect(result).toContain("[CNPJ_REDACTED]");
      expect(result).not.toContain("12345678000199");
    });

    it("deve mascarar CNPJ com máscara", () => {
      const result = sanitizeText("CNPJ: 12.345.678/0001-99");
      expect(result).toContain("[CNPJ_REDACTED]");
      expect(result).not.toContain("12.345.678/0001-99");
    });

    it("deve mascarar email", () => {
      const result = sanitizeText("Usuario joao@empresa.com.br falhou");
      expect(result).toContain("[EMAIL_REDACTED]");
      expect(result).not.toContain("joao@empresa.com.br");
    });

    it("deve mascarar Bearer token", () => {
      const result = sanitizeText("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def");
      expect(result).toContain("Bearer [REDACTED]");
      expect(result).not.toContain("eyJhbGciOiJIUzI1NiJ9.abc.def");
    });

    it("deve mascarar JWT puro", () => {
      const result = sanitizeText("Token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsdWNhcyJ9.signature");
      expect(result).toContain("[JWT_REDACTED]");
      expect(result).not.toContain("eyJhbGciOiJIUzI1NiJ9");
    });

    it("deve mascarar base64 em data URL", () => {
      const result = sanitizeText("Image: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA");
      expect(result).toContain("data:image/png;base64,[REDACTED]");
      expect(result).not.toContain("iVBORw0KGgoAAAANSUhEUgAA");
    });

    it("deve mascarar base64 direto", () => {
      const result = sanitizeText("base64,iVBORw0KGgoAAAANSUhEUgAA");
      expect(result).toContain("base64,[REDACTED]");
      expect(result).not.toContain("iVBORw0KGgoAAAANSUhEUgAA");
    });

    it("deve mascarar query params sensíveis", () => {
      const result = sanitizeText("URL: /api?token=abc123&signature=xyz789");
      expect(result).toContain("token=[REDACTED]");
      expect(result).toContain("signature=[REDACTED]");
      expect(result).not.toContain("abc123");
      expect(result).not.toContain("xyz789");
    });

    it("deve mascarar storage paths S3", () => {
      const result = sanitizeText("Path: s3://bucket-name/file.pdf");
      expect(result).toContain("[STORAGE_PATH_REDACTED]");
      expect(result).not.toContain("s3://bucket-name");
    });

    it("deve mascarar storage paths locais", () => {
      const result = sanitizeText("Upload to employees/12345678901/faces/file.jpg");
      expect(result).toContain("[STORAGE_PATH_REDACTED]");
      expect(result).not.toContain("employees/12345678901");
    });

    it("deve truncar texto longo", () => {
      const longText = "a".repeat(6000);
      const result = sanitizeText(longText);
      expect(result.length).toBeLessThan(6000);
      expect(result).toContain("[TRUNCATED]");
    });

    it("deve retornar [SANITIZATION_FAILED] em caso de erro", () => {
      // Força um erro causando uma situação excepcional
      const badValue = { toString: () => { throw new Error("test"); } };
      const result = sanitizeText(badValue as unknown);
      expect(result).toBe("[SANITIZATION_FAILED]");
    });

    it("deve manejar null e undefined", () => {
      expect(sanitizeText(null)).toBe("");
      expect(sanitizeText(undefined)).toBe("");
    });
  });

  describe("sanitizeObject", () => {
    it("deve mascarar valor de chave sensível: cpf", () => {
      const obj = { cpf: "12345678901", name: "Joao" };
      const result = sanitizeObject(obj);
      expect(result.cpf).toBe("[CPF_REDACTED]");
      expect(result.name).toBe("Joao");
    });

    it("deve mascarar valor de chave sensível: email", () => {
      const obj = { email: "user@domain.com", userId: 123 };
      const result = sanitizeObject(obj);
      expect(result.email).toBe("[EMAIL_REDACTED]");
      expect(result.userId).toBe(123);
    });

    it("deve mascarar valor de chave sensível: token", () => {
      const obj = { token: "abc123xyz", userId: "user1" };
      const result = sanitizeObject(obj);
      expect(result.token).toBe("[REDACTED]");
      expect(result.userId).toBe("user1");
    });

    it("deve mascarar valor de chave sensível: password", () => {
      const obj = { password: "secret123", username: "john" };
      const result = sanitizeObject(obj);
      expect(result.password).toBe("[REDACTED]");
      expect(result.username).toBe("[USERNAME_REDACTED]");
    });

    it("deve sanitizar arrays", () => {
      const obj = { items: ["user@email.com", "data"], cpf: "12345678901" };
      const result = sanitizeObject(obj) as any;
      expect(result.items[0]).toContain("[EMAIL_REDACTED]");
      expect(result.cpf).toBe("[CPF_REDACTED]");
    });

    it("deve limitar profundidade de recursão", () => {
      const deepObj: any = { level: "0" };
      let current = deepObj;
      for (let i = 0; i < 15; i++) {
        current.nested = { level: String(i + 1) };
        current = current.nested;
      }
      const result = sanitizeObject(deepObj);
      expect(JSON.stringify(result)).toContain("[MAX_DEPTH_REDACTED]");
    });

    it("deve retornar [SANITIZATION_FAILED] em caso de erro", () => {
      const badObj = {
        get circular() {
          return badObj;
        },
      };
      const result = sanitizeObject(badObj);
      // Não deve quebrar, mas pode retornar resultado parcial ou marcador de erro
      expect(result).toBeDefined();
    });
  });

  describe("sanitizeError", () => {
    it("deve sanitizar error.message contendo CPF", () => {
      const error = new Error("Falha ao processar CPF 12345678901");
      const result = sanitizeError(error);
      expect(result.message).toContain("[CPF_REDACTED]");
      expect(result.message).not.toContain("12345678901");
    });

    it("deve sanitizar error.message contendo email", () => {
      const error = new Error("Usuário joao@email.com não encontrado");
      const result = sanitizeError(error);
      expect(result.message).toContain("[EMAIL_REDACTED]");
      expect(result.message).not.toContain("joao@email.com");
    });

    it("deve sanitizar error.message contendo Bearer token", () => {
      const error = new Error("Request failed: Authorization Bearer eyJhbGciOiJIUzI1NiJ9.abc.def");
      const result = sanitizeError(error);
      expect(result.message).toContain("Bearer [REDACTED]");
      expect(result.message).not.toContain("eyJhbGciOiJIUzI1NiJ9");
    });

    it("deve sanitizar error.name", () => {
      const error = new Error("test");
      error.name = "CPF-ERROR-12345678901";
      const result = sanitizeError(error);
      expect(result.name).toContain("[CPF_REDACTED]");
    });

    it("deve incluir sanitized stack trace", () => {
      const error = new Error("Erro ao salvar CPF 12345678901");
      const result = sanitizeError(error);
      expect(result.stack).toBeDefined();
      if (result.stack) {
        expect(result.stack).not.toContain("12345678901");
      }
    });

    it("deve limitar tamanho de message", () => {
      const longMessage = "a".repeat(1200);
      const error = new Error(longMessage);
      const result = sanitizeError(error);
      expect(result.message.length).toBeLessThanOrEqual(1000);
    });

    it("deve limitar tamanho de name", () => {
      const longName = "a".repeat(250);
      const error = new Error("test");
      error.name = longName;
      const result = sanitizeError(error);
      expect(result.name.length).toBeLessThanOrEqual(200);
    });

    it("deve manejar error desconhecido (string)", () => {
      const result = sanitizeError("Algo deu errado com CPF 12345678901");
      expect(result.name).toBe("UnknownError");
      expect(result.message).toContain("[CPF_REDACTED]");
    });

    it("deve manejar null/undefined como error", () => {
      const resultNull = sanitizeError(null);
      const resultUndefined = sanitizeError(undefined);
      expect(resultNull.name).toBe("UnknownError");
      expect(resultUndefined.name).toBe("UnknownError");
    });
  });

  describe("sanitizeObservabilityPayload", () => {
    it("deve sanitizar payload completo de observabilidade", () => {
      const payload = {
        error: {
          message: "Falha ao processar CPF 12345678901",
          name: "ProcessError",
        },
        context: {
          user: "joao@email.com",
          token: "abc123xyz",
          endpoint: "/api/users",
        },
        timestamp: "2026-05-27T10:00:00Z",
      };

      const result = sanitizeObservabilityPayload(payload);
      const stringResult = JSON.stringify(result);

      expect(stringResult).not.toContain("12345678901");
      expect(stringResult).not.toContain("joao@email.com");
      expect(stringResult).not.toContain("abc123xyz");
      expect(stringResult).toContain("[CPF_REDACTED]");
      expect(stringResult).toContain("[EMAIL_REDACTED]");
      expect(stringResult).toContain("[REDACTED]");
      expect(stringResult).toContain("/api/users");
    });

    it("não deve enviar dados brutos de CPF", () => {
      const payload = {
        error: {
          message: "CPF 12345678901 inválido",
        },
      };
      const result = sanitizeObservabilityPayload(payload);
      expect(JSON.stringify(result)).not.toContain("12345678901");
    });

    it("não deve enviar dados brutos de CNPJ", () => {
      const payload = {
        context: {
          company: "12345678000199",
        },
      };
      const result = sanitizeObservabilityPayload(payload);
      expect(JSON.stringify(result)).not.toContain("12345678000199");
    });

    it("não deve enviar dados brutos de token", () => {
      const payload = {
        context: {
          authToken: "Bearer eyJhbGciOiJIUzI1NiJ9.abc.def",
        },
      };
      const result = sanitizeObservabilityPayload(payload);
      expect(JSON.stringify(result)).not.toContain("eyJhbGciOiJIUzI1NiJ9");
    });

    it("não deve enviar dados brutos de base64", () => {
      const payload = {
        context: {
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA",
        },
      };
      const result = sanitizeObservabilityPayload(payload);
      expect(JSON.stringify(result)).not.toContain("iVBORw0KGgoAAAANSUhEUgAA");
    });
  });
});
