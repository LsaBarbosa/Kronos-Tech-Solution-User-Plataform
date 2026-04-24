import { HttpResponse, http } from "msw";
import { authFixture } from "./fixtures/auth.fixture";
import { companyFixture } from "./fixtures/company.fixture";
import { documentFixture } from "./fixtures/document.fixture";
import { employeeFixture } from "./fixtures/employee.fixture";
import { legalFixture } from "./fixtures/legal.fixture";
import { messageFixture } from "./fixtures/message.fixture";
import { recordsFixture } from "./fixtures/records.fixture";
import { userFixture } from "./fixtures/user.fixture";

export const handlers = [
  http.post("*/auth/login", () => HttpResponse.json(authFixture.loginResponse)),
  http.post("*/auth/login-face", () => HttpResponse.json(authFixture.faceLoginResponse)),
  http.post("*/auth/recover-password", () => new HttpResponse(null, { status: 204 })),
  http.post("*/auth/reset-password", () => new HttpResponse(null, { status: 204 })),

  http.get("*/users/own-profile", () => HttpResponse.json(userFixture.ownProfile)),
  http.get("*/users/search", () => HttpResponse.json(userFixture.searchResults)),
  http.put("*/users/password", () => new HttpResponse(null, { status: 204 })),
  http.post("*/users", () => new HttpResponse(null, { status: 201 })),

  http.get("*/employee/own-profile", () => HttpResponse.json(employeeFixture.ownProfile)),
  http.get("*/employee", () => HttpResponse.json(employeeFixture.list)),
  http.get("*/employee/check-cpf", () => new HttpResponse(null, { status: 404 })),
  http.post("*/employee", () => HttpResponse.json(employeeFixture.created, { status: 201 })),
  http.patch("*/employee/manager/update-employee/:employeeId", () => new HttpResponse(null, { status: 204 })),
  http.post("*/employee/mark-messages-seen", () => new HttpResponse(null, { status: 204 })),

  http.get("*/companies", () => HttpResponse.json(companyFixture.list)),
  http.get("*/companies/check-cnpj", () => new HttpResponse(null, { status: 404 })),
  http.get("*/companies/:cnpj", () => HttpResponse.json(companyFixture.list.companies[0])),
  http.post("*/companies", () => new HttpResponse(null, { status: 201 })),
  http.patch("*/companies/:cnpj", () => new HttpResponse(null, { status: 204 })),
  http.patch("*/companies/:cnpj/toggle-activate", () => new HttpResponse(null, { status: 204 })),
  http.post("*/geolocation/resolve", () =>
    HttpResponse.json({
      latitude: -23.55052,
      longitude: -46.633308,
    })
  ),

  http.get("*/terms/status", () => HttpResponse.json(false)),
  http.post("*/terms/accept-biometric", () =>
    HttpResponse.json({ token: authFixture.loginResponse.token })
  ),
  http.delete("*/terms/revoke-biometric", () =>
    HttpResponse.json({ token: `${authFixture.loginResponse.token}-revoked` })
  ),

  http.get("*/documents", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (!type) {
      throw new Error("GET /documents requer query param type.");
    }

    return HttpResponse.json(documentFixture.list);
  }),
  http.post("*/documents", () => new HttpResponse(null, { status: 201 })),
  http.get("*/documents/:documentId", () =>
    new HttpResponse(documentFixture.fileContent, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="contracheque.pdf"',
      },
    })
  ),
  http.delete("*/documents/:documentId", () => new HttpResponse(null, { status: 204 })),

  http.get("*/messages", () => HttpResponse.json(messageFixture.list)),
  http.post("*/messages", () => new HttpResponse(null, { status: 201 })),
  http.delete("*/messages/:messageId", () => new HttpResponse(null, { status: 204 })),

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

  http.get("*/legal/technical-certificate", () => new HttpResponse(legalFixture.technicalCertificate)),
  http.get("*/legal/afd", () => new HttpResponse(legalFixture.afd)),
  http.get("*/legal/aej", () => new HttpResponse(legalFixture.aej)),
  http.get("*/legal/espelho-ponto", () => new HttpResponse(legalFixture.mirror)),
];
