import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { api } from "@/config/api";
import { server } from "@/test/mocks/server";
import {
  approveTimeRecordChange,
  approveTimeOff,
  approveVacationRequest,
  fetchManagerOptions,
  fetchPendingApprovals,
  fetchPendingVacationCount,
  fetchVacationRequests,
  listTimeOffRequests,
  rejectTimeRecordChange,
  rejectTimeOff,
  rejectVacationRequest,
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

  it("aprova e rejeita ajustes de ponto", async () => {
    server.use(
      http.patch("*/records/approve/10", () => new HttpResponse(null, { status: 204 })),
      http.patch("*/records/reject/10", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(approveTimeRecordChange(10)).resolves.toBeUndefined();
    await expect(rejectTimeRecordChange(10)).resolves.toBeUndefined();
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
