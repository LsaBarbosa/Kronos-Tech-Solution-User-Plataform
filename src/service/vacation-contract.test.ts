import { describe, it, expect, beforeEach } from "vitest";
import { fetchVacationRequests } from "./records.service";
import { HttpResponse, http } from "msw";
import { server } from "@/test/msw/server";
import { VacationQueryParams, VacationRequestResponse } from "@/types/vacation";

const MOCK_VACATION_REQUESTS: VacationRequestResponse[] = [
  {
    employeeId: "emp-1",
    employeeName: "John Doe",
    startDate: "2026-06-01",
    endDate: "2026-06-15",
    status: "PENDING",
    timeRecordIdsForApproval: [1, 2, 3],
  },
  {
    employeeId: "emp-2",
    employeeName: "Jane Smith",
    startDate: "2026-06-10",
    endDate: "2026-06-20",
    status: "APPROVED",
    timeRecordIdsForApproval: [4, 5],
  },
];

describe("Vacation Request - Response Contract", () => {
  const queryParams: VacationQueryParams = {
    page: 0,
    size: 10,
    status: "PENDING",
  };

  beforeEach(() => {
    // Reset server handlers
  });

  it("should handle array response from backend", async () => {
    server.use(
      http.get("*/records/vacation-request", () => HttpResponse.json(MOCK_VACATION_REQUESTS))
    );

    const result = await fetchVacationRequests(queryParams);

    expect(Array.isArray(result.requests)).toBe(true);
    expect(result.requests).toHaveLength(2);
    expect(result.requests[0].employeeName).toBe("John Doe");
    expect(result.requests[1].status).toBe("APPROVED");
  });

  it("should set pagination metadata for array response", async () => {
    server.use(
      http.get("*/records/vacation-request", () => HttpResponse.json(MOCK_VACATION_REQUESTS))
    );

    const result = await fetchVacationRequests(queryParams);

    // When backend returns array, pagination metadata should be synthetic
    expect(result.totalElements).toBe(2);
    expect(result.isFirst).toBe(true);
    expect(result.isLast).toBe(true);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(0);
  });

  it("should handle paginated response from backend", async () => {
    const paginatedResponse = {
      requests: MOCK_VACATION_REQUESTS,
      totalPages: 1,
      totalElements: 2,
      currentPage: 0,
      isFirst: true,
      isLast: true,
    };

    server.use(
      http.get("*/records/vacation-request", () => HttpResponse.json(paginatedResponse))
    );

    const result = await fetchVacationRequests(queryParams);

    expect(result.requests).toHaveLength(2);
    expect(result.totalElements).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it("should handle empty array response", async () => {
    server.use(http.get("*/records/vacation-request", () => HttpResponse.json([])));

    const result = await fetchVacationRequests(queryParams);

    expect(result.requests).toHaveLength(0);
    expect(result.totalElements).toBe(0);
  });

  it("should preserve all fields in vacation request response", async () => {
    server.use(
      http.get("*/records/vacation-request", () => HttpResponse.json([MOCK_VACATION_REQUESTS[0]]))
    );

    const result = await fetchVacationRequests(queryParams);
    const request = result.requests[0];

    expect(request.employeeId).toBe("emp-1");
    expect(request.employeeName).toBe("John Doe");
    expect(request.startDate).toBe("2026-06-01");
    expect(request.endDate).toBe("2026-06-15");
    expect(request.status).toBe("PENDING");
    expect(request.timeRecordIdsForApproval).toEqual([1, 2, 3]);
  });

  it("should query with correct parameters", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/records/vacation-request", async ({ request }) => {
        const url = new URL(request.url);
        capturedRequest = {
          page: url.searchParams.get("page"),
          size: url.searchParams.get("size"),
          status: url.searchParams.get("status"),
        };
        return HttpResponse.json(MOCK_VACATION_REQUESTS);
      })
    );

    await fetchVacationRequests(queryParams);

    expect(capturedRequest.page).toBe("0");
    expect(capturedRequest.size).toBe("10");
    expect(capturedRequest.status).toBe("PENDING");
  });

  it("should query with employee name filter", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/records/vacation-request", async ({ request }) => {
        const url = new URL(request.url);
        capturedRequest = {
          employeeName: url.searchParams.get("employeeName"),
        };
        return HttpResponse.json(MOCK_VACATION_REQUESTS);
      })
    );

    await fetchVacationRequests({
      ...queryParams,
      employeeName: "John",
    });

    expect(capturedRequest.employeeName).toBe("John");
  });
});
