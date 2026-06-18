import { HttpResponse, http } from "msw";
import { recordsFixture } from "../../mocks/fixtures/records.fixture";

export const recordsHandlers = [
  http.get("*/records/me/today", () => HttpResponse.json(recordsFixture.todayStatus)),
  http.post("*/records/report", () => HttpResponse.json(recordsFixture.detailedReport)),
  http.get("*/records/pending-approvals", () => HttpResponse.json(recordsFixture.pendingApprovals)),
  http.patch("*/records/approve/:timeRecordId", () => new HttpResponse(null, { status: 204 })),
  http.patch("*/records/reject/:timeRecordId", () => new HttpResponse(null, { status: 204 })),
  http.post("*/records/vacation-request", () => HttpResponse.json([11, 12], { status: 201 })),
  http.get("*/records/vacation-request", () => HttpResponse.json(recordsFixture.vacationRequests)),
  http.patch("*/records/vacation-request/approve", () => new HttpResponse(null, { status: 204 })),
  http.patch("*/records/vacation-request/reject", () => new HttpResponse(null, { status: 204 })),
  http.post("*/records/time-off/request", () => HttpResponse.json(77, { status: 201 })),
  http.get("*/records/time-off/requests", () => HttpResponse.json(recordsFixture.timeOffRequests)),
  http.patch("*/records/time-off/approve/:timeRecordId", () => new HttpResponse(null, { status: 204 })),
  http.patch("*/records/time-off/reject/:timeRecordId", () => new HttpResponse(null, { status: 204 })),
];
