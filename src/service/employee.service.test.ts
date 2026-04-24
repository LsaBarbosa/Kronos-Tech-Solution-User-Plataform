import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  checkCpf,
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
  type EmployeeCreationPayload,
} from "./employee.service";

const employeePayload: EmployeeCreationPayload = {
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

describe("employee.service", () => {
  it("verifica cpf disponível", async () => {
    server.use(
      http.get("*/employee/check-cpf", () => new HttpResponse(null, { status: 404 }))
    );

    await expect(checkCpf("12345678901")).resolves.toBe(true);
  });

  it("cria, lista, consulta, atualiza e remove colaborador", async () => {
    server.use(
      http.post("*/employee", async ({ request }) => {
        await expect(request.json()).resolves.toMatchObject(employeePayload);
        return HttpResponse.json({ employeeId: "emp-1" });
      }),
      http.get("*/employee", () =>
        HttpResponse.json({
          employees: [{ employeeId: "emp-1", fullName: "Maria Silva", active: true }],
        })
      ),
      http.get("*/employee/emp-1", () =>
        HttpResponse.json({
          employeeId: "emp-1",
          fullName: "Maria Silva",
          active: true,
        })
      ),
      http.patch("*/employee/manager/update-employee/emp-1", async ({ request }) => {
        await expect(request.json()).resolves.toEqual({ fullName: "Maria Souza" });
        return new HttpResponse(null, { status: 204 });
      }),
      http.delete("*/employee/emp-1", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(createEmployee(employeePayload)).resolves.toEqual({ employeeId: "emp-1" });
    await expect(listEmployees()).resolves.toEqual([
      { employeeId: "emp-1", fullName: "Maria Silva", active: true },
    ]);
    await expect(getEmployee("emp-1")).resolves.toEqual({
      employeeId: "emp-1",
      fullName: "Maria Silva",
      active: true,
    });
    await expect(updateEmployee("emp-1", { fullName: "Maria Souza" })).resolves.toBeUndefined();
    await expect(deleteEmployee("emp-1")).resolves.toBeUndefined();
  });
});
