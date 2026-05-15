import { HttpResponse, http } from "msw";

export const termsHandlers = [
  http.get("*/terms/status", () => HttpResponse.json({ accepted: true })),
  http.post("*/terms/accept-biometric", () => new HttpResponse(null, { status: 204 })),
];
