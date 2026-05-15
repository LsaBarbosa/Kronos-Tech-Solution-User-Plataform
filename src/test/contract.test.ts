/**
 * Testes de contrato entre front-end e back-end
 * Validam que as respostas do back-end correspondem aos tipos esperados pelo front
 */

import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { api } from "@/config/api";
import type { ServiceError } from "@/service/helpers/service-error.helper";

describe("Contract tests — Front-end vs Back-end", () => {
  /**
   * AUTH CONTRACT
   */
  describe("Auth contract", () => {
    it("login com credenciais corretas retorna 204 No Content", async () => {
      server.use(
        http.post("*/auth/login", () => new HttpResponse(null, { status: 204 }))
      );

      const response = await api.post("/auth/login", {
        username: "test",
        password: "password",
      });

      expect(response.status).toBe(204);
      expect(response.data).toBe("");
    });

    it("logout retorna 204 No Content", async () => {
      server.use(
        http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 }))
      );

      const response = await api.post("/auth/logout");

      expect(response.status).toBe(204);
    });

    it("CSRF endpoint retorna token com headerName, parameterName, token", async () => {
      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "test-token-123",
          })
        )
      );

      const response = await api.get("/auth/csrf");

      expect(response.data).toHaveProperty("headerName");
      expect(response.data).toHaveProperty("parameterName");
      expect(response.data).toHaveProperty("token");
    });
  });

  /**
   * DOCUMENTS CONTRACT
   */
  describe("Documents contract", () => {
    it("upload de documento retorna 201 Created", async () => {
      server.use(
        http.post("*/documents", () =>
          new HttpResponse(null, { status: 201 })
        )
      );

      const formData = new FormData();
      formData.append("file", new File(["test"], "test.pdf"));
      formData.append("employeeId", "emp-1");
      formData.append("type", "PAYSLIP");

      const response = await api.post("/documents", formData);

      expect(response.status).toBe(201);
    });

    it("delete de documento retorna 204 No Content", async () => {
      server.use(
        http.delete("*/documents/doc-1", () =>
          new HttpResponse(null, { status: 204 })
        )
      );

      const response = await api.delete("/documents/doc-1");

      expect(response.status).toBe(204);
    });
  });

  /**
   * VACATION CONTRACT
   */
  describe("Vacation contract", () => {
    it("criação de férias retorna 201 Created com List<Long>", async () => {
      server.use(
        http.post("*/records/vacation-request", () =>
          HttpResponse.json([1, 2, 3], { status: 201 })
        )
      );

      const response = await api.post("/records/vacation-request", {
        startDate: "2026-05-01",
        endDate: "2026-05-15",
        managerId: "mgr-1",
      });

      expect(response.status).toBe(201);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("aprovação de férias retorna 204 No Content", async () => {
      server.use(
        http.patch("*/records/vacation-request/approve", () =>
          new HttpResponse(null, { status: 204 })
        )
      );

      const response = await api.patch(
        "/records/vacation-request/approve",
        { timeRecordIds: [1, 2] }
      );

      expect(response.status).toBe(204);
    });
  });

  /**
   * TIME-OFF CONTRACT
   */
  describe("Time-off contract", () => {
    it("criação de time-off retorna 201 Created com TimeOffCreatedResponse", async () => {
      server.use(
        http.post("*/records/time-off/request", () =>
          HttpResponse.json({ timeRecordId: 42 }, { status: 201 })
        )
      );

      const formData = new FormData();
      formData.append("request", new Blob([JSON.stringify({})]));

      const response = await api.post("/records/time-off/request", formData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("timeRecordId");
    });

    it("aprovação de time-off retorna 204 No Content", async () => {
      server.use(
        http.patch("*/records/time-off/approve/1", () =>
          new HttpResponse(null, { status: 204 })
        )
      );

      const response = await api.patch("/records/time-off/approve/1");

      expect(response.status).toBe(204);
    });
  });

  /**
   * ERROR CONTRACT
   */
  describe("Error contract", () => {
    it("erro 400 com validationErrors é normalizado", async () => {
      server.use(
        http.post("*/test", () =>
          HttpResponse.json(
            {
              code: "VALIDATION_ERROR",
              message: "Dados inválidos",
              status: 400,
              detail: "Dados inválidos",
              validationErrors: [
                {
                  field: "email",
                  message: "Email inválido",
                  name: "email",
                  userMessage: "Email inválido",
                },
              ],
            },
            { status: 400 }
          )
        )
      );

      try {
        await api.post("/test", {});
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.status).toBe(400);
        expect(serviceError.validationErrors).toBeDefined();
        expect(serviceError.validationErrors?.length).toBe(1);
      }
    });

    it("erro 401 trata como auth error", async () => {
      server.use(
        http.get("*/protected", () =>
          HttpResponse.json(
            { message: "Sessão expirada" },
            { status: 401 }
          )
        )
      );

      try {
        await api.get("/protected");
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.kind).toBe("auth");
        expect(serviceError.status).toBe(401);
      }
    });

    it("erro 403 com type TERMS_NOT_ACCEPTED é tratado como terms", async () => {
      server.use(
        http.post("*/action", () =>
          HttpResponse.json(
            {
              type: "TERMS_NOT_ACCEPTED",
              message: "Aceitar termos",
              redirect_url: "https://terms.example.com",
              status: 403,
            },
            { status: 403 }
          )
        )
      );

      try {
        await api.post("/action", {});
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.kind).toBe("terms");
        expect(serviceError.redirectUrl).toBe("https://terms.example.com");
      }
    });

    it("erro 404 trata como notFound", async () => {
      server.use(
        http.get("*/resource/99999", () =>
          HttpResponse.json(
            { message: "Recurso não encontrado" },
            { status: 404 }
          )
        )
      );

      try {
        await api.get("/resource/99999");
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.kind).toBe("notFound");
        expect(serviceError.status).toBe(404);
      }
    });

    it("erro 409 trata como conflict", async () => {
      server.use(
        http.post("*/unique", () =>
          HttpResponse.json(
            { message: "Recurso duplicado" },
            { status: 409 }
          )
        )
      );

      try {
        await api.post("/unique", {});
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.kind).toBe("conflict");
      }
    });

    it("erro 413 trata como fileTooLarge", async () => {
      server.use(
        http.post("*/upload", () =>
          HttpResponse.json(
            { message: "Arquivo muito grande" },
            { status: 413 }
          )
        )
      );

      try {
        await api.post("/upload", {});
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.kind).toBe("fileTooLarge");
      }
    });

    it("erro 429 trata como rateLimit", async () => {
      server.use(
        http.post("*/action", () =>
          HttpResponse.json(
            { message: "Muitas tentativas" },
            { status: 429 }
          )
        )
      );

      try {
        await api.post("/action", {});
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.kind).toBe("rateLimit");
      }
    });

    it("erro de rede é tratado como http error", async () => {
      server.use(
        http.get("*/offline", () => {
          throw new Error("Network error");
        })
      );

      try {
        await api.get("/offline");
        expect.fail("Should throw");
      } catch (error) {
        const serviceError = error as ServiceError;
        expect(serviceError.kind).toBe("http");
      }
    });
  });

  /**
   * RECORD OPERATIONS CONTRACT
   */
  describe("Record operations contract", () => {
    it("delete de time record retorna 204 No Content", async () => {
      server.use(
        http.delete("*/records/emp-1/10", () =>
          new HttpResponse(null, { status: 204 })
        )
      );

      const response = await api.delete("/records/emp-1/10");

      expect(response.status).toBe(204);
    });

    it("aprovação de registro retorna 204 No Content", async () => {
      server.use(
        http.patch("*/records/approve/10", () =>
          new HttpResponse(null, { status: 204 })
        )
      );

      const response = await api.patch("/records/approve/10");

      expect(response.status).toBe(204);
    });
  });
});
