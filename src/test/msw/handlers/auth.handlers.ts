import { HttpResponse, http } from "msw";
import { authFixture } from "../../mocks/fixtures/auth.fixture";

export const authHandlers = [
  http.get("*/auth/csrf", () =>
    HttpResponse.json({
      headerName: "X-CSRF-TOKEN",
      parameterName: "_csrf",
      token: "csrf-token",
    })
  ),
  http.post("*/auth/login", () => HttpResponse.json(authFixture.loginResponse)),
  http.post("*/auth/login-face", () => HttpResponse.json(authFixture.faceLoginResponse)),
  http.post("*/auth/recover-password", () => new HttpResponse(null, { status: 204 })),
  http.post("*/auth/reset-password", () => new HttpResponse(null, { status: 204 })),
  http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 })),
];
