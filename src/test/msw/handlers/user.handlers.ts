import { HttpResponse, http } from "msw";
import { userFixture } from "../../mocks/fixtures/user.fixture";

export const userHandlers = [
  http.get("*/users/own-profile", () => HttpResponse.json(userFixture.ownProfile)),
  http.get("*/users/search", () => HttpResponse.json(userFixture.searchResults)),
  http.put("*/users/password", () => new HttpResponse(null, { status: 204 })),
  http.post("*/users", () => new HttpResponse(null, { status: 201 })),
];
