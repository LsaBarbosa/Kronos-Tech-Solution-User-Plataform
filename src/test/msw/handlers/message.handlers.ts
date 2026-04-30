import { HttpResponse, http } from "msw";
import { messageFixture } from "../../mocks/fixtures/message.fixture";

export const messageHandlers = [
  http.get("*/messages", () => HttpResponse.json(messageFixture.list)),
  http.post("*/messages", () => new HttpResponse(null, { status: 201 })),
  http.delete("*/messages/:messageId", () => new HttpResponse(null, { status: 204 })),
];
