import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  changePassword,
  updateEmail,
  updatePhone,
} from "./user.Service";

describe("user.Service", () => {
  it("atualiza email", async () => {
    server.use(
      http.patch("*/employee/update-own-profile", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ email: "novo@exemplo.com" });
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(updateEmail("emp-1", "novo@exemplo.com")).resolves.toBeUndefined();
  });

  it("atualiza telefone removendo mascara", async () => {
    server.use(
      http.patch("*/employee/update-own-profile", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ phone: "11999999999" });
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(updatePhone("emp-1", "(11) 99999-9999")).resolves.toBeUndefined();
  });

  it("valida confirmacao de senha antes de enviar", async () => {
    await expect(
      changePassword({
        currentPassword: "antiga",
        newPassword: "nova",
        confirmPassword: "diferente",
      })
    ).rejects.toThrow("As novas senhas não coincidem.");
  });

  it("altera senha com payload completo", async () => {
    server.use(
      http.put("*/users/password", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          currentPassword: "antiga",
          newPassword: "nova",
          confirmPassword: "nova",
        });
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(
      changePassword({
        currentPassword: "antiga",
        newPassword: "nova",
        confirmPassword: "nova",
      })
    ).resolves.toBeUndefined();
  });
});
