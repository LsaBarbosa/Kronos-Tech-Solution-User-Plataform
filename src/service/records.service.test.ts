import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { api } from "@/config/api";
import { server } from "@/test/mocks/server";
import {
  approveTimeRecordChange,
  approveTimeOff,
  approveVacationRequest,
  fetchDetailedReport,
  fetchManagerOptions,
  fetchPendingApprovals,
  fetchPendingVacationCount,
  fetchVacationRequests,
  fetchReportEmployees,
  listTimeOffRequests,
  rejectTimeRecordChange,
  rejectTimeOff,
  rejectVacationRequest,
  toggleRecordActivate,
  updateRecordStatus,
  updateTimeRecord,
  requestTimeOff,
  requestVacation,
} from "./records.service";

describe("records.service", () => {
  it("lista aprovacoes pendentes com paginação", async () => {
    server.use(
      http.get("*/records/pending-approvals", () =>
        HttpResponse.json({
          approvals: [
            {
              timeRecordId: 1,
              partnerName: "Maria",
              managerUsername: "gestor",
              newStartWork: "08:00",
              newEndWork: "18:00",
              currentStartWork: "09:00",
              currentEndWork: "17:00",
            },
          ],
          totalPages: 1,
          totalElements: 1,
          currentPage: 0,
          isFirst: true,
          isLast: true,
        })
      )
    );

    await expect(
      fetchPendingApprovals({ page: 0, employeeName: "Maria" })
    ).resolves.toMatchObject({
      approvals: [
        {
          timeRecordId: 1,
        },
      ],
      totalElements: 1,
    });
  });

  it("gera relatório detalhado pelo endpoint oficial", async () => {
    server.use(
      http.post("*/records/report", async ({ request }) => {
        const body = await request.json();
        expect(body).toMatchObject({
          reference: "08:00",
          active: true,
          dates: ["10-04-2026"],
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
              employeeName: "Maria",
              companyName: "Kronos",
            },
          },
        ]);
      })
    );

    await expect(
      fetchDetailedReport({
        reference: "08:00",
        active: true,
        dates: ["10-04-2026"],
        employeeId: "emp-1",
      })
    ).resolves.toEqual([
      expect.objectContaining({
        timeRecordId: 1,
      }),
    ]);
  });

  it("aprova e rejeita ajustes de ponto", async () => {
    server.use(
      http.patch("*/records/approve/10", () => new HttpResponse(null, { status: 204 })),
      http.patch("*/records/reject/10", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(approveTimeRecordChange(10)).resolves.toBeUndefined();
    await expect(rejectTimeRecordChange(10)).resolves.toBeUndefined();
  });

  it("atualiza status e alterna ativacao do registro", async () => {
    server.use(
      http.put("*/records/update/status/emp-1/10", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ statusRecord: "ABSENCE" });
        return new HttpResponse(null, { status: 204 });
      }),
      http.put("*/records/toggle-activate/emp-1/10", () => new HttpResponse(null, { status: 204 })),
      http.put("*/records/update/time-record/10", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({
          startDate: "10-04-2026",
          endDate: "11-04-2026",
          startHour: "08:00",
          endHour: "17:00",
          managerId: "manager-1",
        });
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(
      updateRecordStatus("emp-1", "10", { statusRecord: "ABSENCE" })
    ).resolves.toBeUndefined();
    await expect(toggleRecordActivate("emp-1", "10")).resolves.toBeUndefined();
    await expect(
      updateTimeRecord("10", {
        startDate: "10-04-2026",
        endDate: "11-04-2026",
        startHour: "08:00",
        endHour: "17:00",
        managerId: "manager-1",
      })
    ).resolves.toBeUndefined();
  });

  it("lista gestores ativos para seleção de aprovadores", async () => {
    server.use(
      http.get("*/users/search", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("active")).toBe("true");

        return HttpResponse.json({
          users: [
            {
              userId: "manager-1",
              username: "gestor",
              role: "MANAGER",
            },
            {
              userId: "partner-1",
              username: "colaborador",
              role: "PARTNER",
            },
          ],
        });
      })
    );

    await expect(fetchManagerOptions()).resolves.toEqual([
      {
        userId: "manager-1",
        username: "gestor",
      },
    ]);
  });

  it("conta pendencias de ferias usando totalElements da pagina", async () => {
    server.use(
      http.get("*/records/vacation-request", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("0");
        expect(url.searchParams.get("size")).toBe("1");
        expect(url.searchParams.get("status")).toBe("PENDING");

        return HttpResponse.json({
          requests: [{ id: 1 }],
          totalPages: 3,
          totalElements: 3,
          currentPage: 0,
          isFirst: true,
          isLast: false,
        });
      })
    );

    await expect(fetchPendingVacationCount()).resolves.toBe(3);
  });

  it("lista colaboradores ativos para relatorios", async () => {
    server.use(
      http.get("*/employee", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("active")).toBe("true");

        return HttpResponse.json({
          employees: [
            {
              employeeId: "emp-1",
              fullName: "Maria",
            },
          ],
        });
      })
    );

    await expect(fetchReportEmployees()).resolves.toEqual([
      {
        employeeId: "emp-1",
        fullName: "Maria",
      },
    ]);
  });

  it("solicita abono com multipart no endpoint correto", async () => {
    const postSpy = vi.spyOn(api, "post").mockResolvedValue({ data: 123 } as never);

    await expect(
      requestTimeOff(
        {
          startDate: "10-04-2026",
          endDate: "11-04-2026",
          startHour: "08:00",
          endHour: "17:00",
          managerId: "manager-1",
        },
        new File(["pdf"], "comprovante.pdf", { type: "application/pdf" })
      )
    ).resolves.toBe(123);

    expect(postSpy).toHaveBeenCalledWith(
      "/records/time-off/request",
      expect.any(FormData)
    );

    const [, formData] = postSpy.mock.calls[0];
    expect((formData as FormData).get("document")).toBeInstanceOf(File);
    expect((formData as FormData).get("request")).toBeInstanceOf(Blob);
  });

  it("lista solicitações de abono de forma paginada", async () => {
    server.use(
      http.get("*/records/time-off/requests", () =>
        HttpResponse.json({
          records: [
            {
              timeRecordId: 1,
              startWork: "10-04-2026",
              startHour: "08:00",
              endWork: null,
              endHour: "17:00",
              hoursWork: "09:00",
              balance: "00:00",
              statusRecord: "PENDING",
              edited: false,
              active: true,
              employeeId: "emp-1",
              employeeData: {
                employeeName: "Maria",
                companyName: "Kronos",
              },
            },
          ],
          totalPages: 1,
          totalElements: 1,
          currentPage: 0,
          isFirst: true,
          isLast: true,
        })
      )
    );

    await expect(
      listTimeOffRequests({ page: 0, size: 5, status: "PENDING" })
    ).resolves.toMatchObject({
      records: [
        {
          timeRecordId: 1,
        },
      ],
      totalElements: 1,
    });
  });

  it("aprova e rejeita abono manual", async () => {
    server.use(
      http.patch("*/records/time-off/approve/20", () => new HttpResponse(null, { status: 204 })),
      http.patch("*/records/time-off/reject/20", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(approveTimeOff(20)).resolves.toBeUndefined();
    await expect(rejectTimeOff(20)).resolves.toBeUndefined();
  });

  it("solicita férias e lê os retornos paginados/arrays do backend", async () => {
    server.use(
      http.post("*/records/vacation-request", () => HttpResponse.json([11, 12])),
      http.get("*/records/vacation-request", () =>
        HttpResponse.json([
          {
            employeeId: "emp-1",
            employeeName: "Maria",
            startDate: "10-04-2026",
            endDate: "12-04-2026",
            status: "PENDING",
            timeRecordIdsForApproval: [11, 12],
          },
        ])
      )
    );

    await expect(
      requestVacation({
        startDate: "10-04-2026",
        endDate: "12-04-2026",
        managerId: "manager-1",
      })
    ).resolves.toEqual([11, 12]);

    await expect(
      fetchVacationRequests({ page: 0, size: 5, status: "PENDING" })
    ).resolves.toEqual([
      {
        employeeId: "emp-1",
        employeeName: "Maria",
        startDate: "10-04-2026",
        endDate: "12-04-2026",
        status: "PENDING",
        timeRecordIdsForApproval: [11, 12],
      },
    ]);
  });

  it("aprova e rejeita férias", async () => {
    server.use(
      http.patch("*/records/vacation-request/approve", () => new HttpResponse(null, { status: 204 })),
      http.patch("*/records/vacation-request/reject", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(approveVacationRequest([1, 2])).resolves.toBeUndefined();
    await expect(rejectVacationRequest([1, 2])).resolves.toBeUndefined();
  });

  it("busca managers ativos e conta pendências de férias", async () => {
    server.use(
      http.get("*/users/search", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("active")).toBe("true");

        return HttpResponse.json({
          users: [
            {
              userId: "u-1",
              username: "gestor",
              role: "MANAGER",
            },
            {
              userId: "u-2",
              username: "colaborador",
              role: "PARTNER",
            },
          ],
        });
      }),
      http.get("*/records/vacation-request", () =>
        HttpResponse.json([
          {
            employeeId: "emp-1",
            employeeName: "Maria",
            startDate: "10-04-2026",
            endDate: "12-04-2026",
            status: "PENDING",
            timeRecordIdsForApproval: [11, 12],
          },
          {
            employeeId: "emp-2",
            employeeName: "Joao",
            startDate: "14-04-2026",
            endDate: "16-04-2026",
            status: "PENDING",
            timeRecordIdsForApproval: [13, 14],
          },
        ])
      )
    );

    await expect(fetchManagerOptions()).resolves.toEqual([
      {
        userId: "u-1",
        username: "gestor",
      },
    ]);

    await expect(fetchPendingVacationCount()).resolves.toBe(2);
  });
});
