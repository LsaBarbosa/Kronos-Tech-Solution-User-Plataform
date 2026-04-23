import { HttpResponse, http } from "msw";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { loginWithPassword } from "@/service/auth.service";
import {
  createCollaborator,
  createUser,
  type CollaboratorCreationPayload,
} from "@/service/collaborator-management.service";
import { uploadDocument } from "@/service/document.service";
import { requestTimeOff, approveVacationRequest } from "@/service/records.service";
import { server } from "@/test/mocks/server";

const makeJwt = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `header.${encoded}.signature`;
};

const collaboratorPayload: CollaboratorCreationPayload = {
  fullName: "Maria Silva",
  cpf: "12345678900",
  jobPosition: "Analista",
  email: "maria@kronos.com",
  salary: 4500,
  phone: "(11) 99999-0000",
  homeOffice: false,
  address: {
    postalCode: "01001000",
    number: "100",
  },
  workStartTime: "08:00",
  workEndTime: "17:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  scheduleType: "FIXED",
  scaleStartDate: null,
  preferredDayOff: null,
  weekendOffIndex: null,
  fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
};

describe("backend mocked integration", () => {
  it("faz login com sucesso e rejeita credenciais invalidas", async () => {
    server.use(
      http.post("*/auth/login", async ({ request }) => {
        const body = await request.json();

        if (body.username === "ana" && body.password === "senha123") {
          return HttpResponse.json({ token: "token-gerado" });
        }

        return HttpResponse.json(
          { detail: "Usuario ou senha invalidos." },
          { status: 401 }
        );
      })
    );

    await expect(
      loginWithPassword({ username: "ana", password: "senha123" })
    ).resolves.toEqual({ token: "token-gerado" });

    await expect(
      loginWithPassword({ username: "ana", password: "errada" })
    ).rejects.toThrow("Usuario ou senha invalidos.");
  });

  it("redireciona a rota protegida quando a sessao expira", async () => {
    localStorage.setItem(
      "token",
      makeJwt({ role: "PARTNER", employeeId: "emp-1", fullName: "Maria Silva" })
    );

    server.use(
      http.get("*/users/own-profile", () =>
        HttpResponse.json({ detail: "Sessao expirada." }, { status: 401 })
      ),
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({ detail: "Sessao expirada." }, { status: 401 })
      )
    );

    render(
      <MemoryRouter initialEntries={["/privado"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/privado" element={<div>Area protegida</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });

  it("cria colaborador e usuario no backend", async () => {
    server.use(
      http.post("*/employee", async ({ request }) => {
        const body = await request.json();

        expect(body).toMatchObject({
          fullName: "Maria Silva",
          cpf: "12345678900",
          jobPosition: "Analista",
        });

        return HttpResponse.json({ employeeId: "emp-1" });
      }),
      http.post("*/users", async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({
          username: "maria.silva",
          role: "PARTNER",
          employeeId: "emp-1",
        });

        return new HttpResponse(null, { status: 201 });
      })
    );

    await expect(createCollaborator(collaboratorPayload)).resolves.toEqual({
      employeeId: "emp-1",
    });

    await expect(
      createUser({
        username: "maria.silva",
        role: "PARTNER",
        employeeId: "emp-1",
      })
    ).resolves.toBeUndefined();
  });

  it("faz upload de documento com multipart", async () => {
    const file = new File(["conteudo"], "holerite.pdf", {
      type: "application/pdf",
    });

    server.use(
      http.post("*/documents", () => new HttpResponse(null, { status: 201 }))
    );

    await expect(uploadDocument(file, "emp-1", "PAYSLIP")).resolves.toBeUndefined();
  });

  it("gera relatório detalhado via backend mockado", async () => {
    server.use(
      http.post("*/records/report", async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({
          reference: "08:00",
          active: true,
          dates: ["10-04-2026"],
          statuses: ["CREATED"],
        });

        return HttpResponse.json([
          {
            timeRecordId: 1,
            startWork: "10-04-2026",
            startHour: "08:00",
            endHour: "17:00",
            hoursWork: "09:00",
            balance: "+01:00",
            statusRecord: "CREATED",
            employeeId: "emp-1",
            employeeData: {
              employeeName: "Maria Silva",
              companyName: "Kronos",
            },
          },
        ]);
      })
    );

    const response = await fetch(
      new URL("/records/report?employeeId=emp-1", window.location.origin),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: "08:00",
          active: true,
          dates: ["10-04-2026"],
          statuses: ["CREATED"],
        }),
      }
    );

    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toEqual([
      {
        timeRecordId: 1,
        startWork: "10-04-2026",
        startHour: "08:00",
        endHour: "17:00",
        hoursWork: "09:00",
        balance: "+01:00",
        statusRecord: "CREATED",
        employeeId: "emp-1",
        employeeData: {
          employeeName: "Maria Silva",
          companyName: "Kronos",
        },
      },
    ]);
  });

  it("solicita abono com multipart e aprova férias pelo backend", async () => {
    server.use(
      http.post("*/records/time-off/request", () => HttpResponse.json(77)),
      http.patch("*/records/vacation-request/approve", async ({ request }) => {
        const body = await request.json();

        expect(body).toEqual({ timeRecordIds: [11, 12] });

        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(
      requestTimeOff(
        {
          startDate: "10-04-2026",
          endDate: "11-04-2026",
          startHour: "08:00",
          endHour: "17:00",
          managerId: "manager-1",
        },
        new File(["pdf"], "abono.pdf", { type: "application/pdf" })
      )
    ).resolves.toBe(77);

    await expect(approveVacationRequest([11, 12])).resolves.toBeUndefined();
  });
});
