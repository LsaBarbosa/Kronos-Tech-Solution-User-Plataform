import { HttpResponse, http } from "msw";

export const geolocationHandlers = [
  http.post("*/geolocation/resolve", () =>
    HttpResponse.json({
      latitude: -23.55052,
      longitude: -46.633308,
    })
  ),
];
