import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  checkCpfAvailability,
  deleteEmployee,
  checkUsernameAvailability,
  createCollaborator,
  createManager,
  fetchCompanyList,
  fetchEmployeeList,
  createUser,
  toggleEmployeeStatus,
  toggleUserStatus,
  updateCollaborator,
  updateUser,
  type CollaboratorCreationPayload,
  type ManagerCreationPayload,
  type UserCreationPayload,
} from "./collaborator-management.service";

const collaboratorPayload: CollaboratorCreationPayload = {
  fullName: "Maria Silva",
  cpf: "12345678901",
  jobPosition: "Analista",
  email: "maria@exemplo.com",
  salary: 4200,
  phone: "11999999999",
  homeOffice: false,
  address: {
    postalCode: "01001000",
    number: "100",
  },
  workStartTime: "08:00",
  workEndTime: "17:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  scheduleType: "TRADITIONAL_5X2",
  scaleStartDate: null,
  preferredDayOff: null,
  weekendOffIndex: null,
  fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
};

const userPayload: UserCreationPayload = {
  username: "maria.silva",
  role: "PARTNER",
  employeeId: "emp-123",
};

const managerPayload: ManagerCreationPayload = {
  companyId: "cmp-1",
  fullName: "Maria Silva",
  cpf: "12345678901",
  jobPosition: "Gestora",
  email: "maria@exemplo.com",
  salary: 5200,
  phone: "11999999999",
  address: {
    postalCode: "01001000",
    number: "100",
  },
  scheduleType: "TRADITIONAL_5X2",
  scaleStartDate: null,
  preferredDayOff: null,
  weekendOffIndex: null,
  fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
};

describe("collaborator-management.service", () => {
  it("verifica CPF disponivel quando o backend responde 404", async () => {
    server.use(
      http.get("*/employee/check-cpf", () => new HttpResponse(null, { status: 404 }))
    );

    await expect(checkCpfAvailability("12345678901")).resolves.toBe(true);
  });

  it("verifica CPF indisponivel quando o backend responde 200", async () => {
    server.use(
      http.get("*/employee/check-cpf", () => HttpResponse.json({}, { status: 200 }))
    );

    await expect(checkCpfAvailability("12345678901")).resolves.toBe(false);
  });

  it("verifica username disponivel e indisponivel no endpoint real", async () => {
    server.use(
      http.get("*/users/check-username", () => new HttpResponse(null, { status: 404 }))
    );

    await expect(checkUsernameAvailability("maria.silva")).resolves.toBe(true);

    server.use(
      http.get("*/users/check-username", () => HttpResponse.json({}, { status: 200 }))
    );

    await expect(checkUsernameAvailability("maria.silva")).resolves.toBe(false);
  });

  it("cria colaborador e retorna employeeId", async () => {
    server.use(
      http.post("*/employee", async ({ request }) => {
        const body = await request.json();
        expect(body).toMatchObject(collaboratorPayload);
        return HttpResponse.json({ employeeId: "emp-123" });
      })
    );

    await expect(createCollaborator(collaboratorPayload)).resolves.toEqual({
      employeeId: "emp-123",
    });
  });

  it("cria usuario final com sucesso", async () => {
    server.use(
      http.post("*/users", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual(userPayload);
        return new HttpResponse(null, { status: 201 });
      })
    );

    await expect(createUser(userPayload)).resolves.toBeUndefined();
  });

  it("cria manager pelo contrato oficial", async () => {
    server.use(
      http.post("*/employee", async ({ request }) => {
        const body = await request.json();
        expect(body).toMatchObject(managerPayload);
        return HttpResponse.json({ employeeId: "emp-manager" });
      })
    );

    await expect(createManager(managerPayload)).resolves.toEqual({
      employeeId: "emp-manager",
    });
  });

  it("lista empresas no formato oficial", async () => {
    server.use(
      http.get("*/companies", () =>
        HttpResponse.json({
          companies: [
            { id: "cmp-1", name: "Kronos" },
          ],
        })
      )
    );

    await expect(fetchCompanyList()).resolves.toEqual([
      { companyId: "cmp-1", name: "Kronos" },
    ]);
  });

  it("lista colaboradores e permite alternar ou excluir status", async () => {
    server.use(
      http.get("*/employee", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("active")).toBe("true");

        return HttpResponse.json({
          employees: [
            {
              id: "emp-1",
              fullName: "Maria",
              active: true,
            },
          ],
        });
      }),
      http.patch("*/employee/manager/update-employee/emp-1", async ({ request }) => {
        const body = await request.json();
        expect(body).toMatchObject({ fullName: "Maria Silva" });
        return new HttpResponse(null, { status: 204 });
      }),
      http.patch("*/users/search/user-1", async ({ request }) => {
        const body = await request.json();
        expect(body).toMatchObject({ username: "maria.silva" });
        return new HttpResponse(null, { status: 204 });
      }),
      http.patch("*/users/toggle-activate/user-1", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ active: false });
        return new HttpResponse(null, { status: 204 });
      }),
      http.patch("*/employees/emp-1/toggle-status", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ active: false });
        return new HttpResponse(null, { status: 204 });
      }),
      http.delete("*/employees/emp-1", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(fetchEmployeeList()).resolves.toEqual([
      {
        id: "emp-1",
        fullName: "Maria",
        active: true,
      },
    ]);

    await expect(updateCollaborator("emp-1", { fullName: "Maria Silva" })).resolves.toBeUndefined();
    await expect(updateUser("user-1", { username: "maria.silva" })).resolves.toBeUndefined();
    await expect(toggleUserStatus("user-1", true)).resolves.toBeUndefined();
    await expect(toggleEmployeeStatus("emp-1", true)).resolves.toBeUndefined();
    await expect(deleteEmployee("emp-1")).resolves.toBeUndefined();
  });
});
