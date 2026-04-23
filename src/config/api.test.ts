import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { api } from "./api";
import { server } from "@/test/mocks/server";

describe("api", () => {
  it("adiciona Authorization com o token do localStorage", async () => {
    localStorage.setItem("token", "abc-123");

    server.use(
      http.get("http://localhost:3000/health", ({ request }) => {
        return HttpResponse.json({
          authorization: request.headers.get("authorization"),
        });
      })
    );

    const response = await api.get("http://localhost:3000/health");

    expect(response.data).toEqual({ authorization: "Bearer abc-123" });
  });
});
