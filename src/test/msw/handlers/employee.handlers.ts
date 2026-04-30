import { HttpResponse, http } from "msw";
import { employeeFixture } from "../../mocks/fixtures/employee.fixture";

export const employeeHandlers = [
  http.get("*/employee/own-profile", () => HttpResponse.json(employeeFixture.ownProfile)),
  http.get("*/employee", () => HttpResponse.json(employeeFixture.list)),
  http.get("*/employee/check-cpf", () => new HttpResponse(null, { status: 404 })),
  http.post("*/employee", () => HttpResponse.json(employeeFixture.created, { status: 201 })),
  http.patch("*/employee/manager/update-employee/:employeeId", () => new HttpResponse(null, { status: 204 })),
  http.post("*/employee/mark-messages-seen", () => new HttpResponse(null, { status: 204 })),
];
