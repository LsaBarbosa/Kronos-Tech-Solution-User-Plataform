import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  deleteMessage,
  fetchActiveEmployees,
  fetchMessages,
} from "./message.service";

describe("message.service", () => {
  it("lista mensagens usando o envelope real da API", async () => {
    server.use(
      http.get("*/messages", () =>
        HttpResponse.json({
          messages: [
            {
              messageId: "msg-1",
              title: "Aviso",
              messageText: "Conteudo",
              priority: "NORMAL",
              createdAt: "2026-04-23T10:00:00Z",
              senderEmployeeId: "emp-1",
            },
          ],
        })
      )
    );

    await expect(fetchMessages()).resolves.toEqual([
      {
        messageId: "msg-1",
        title: "Aviso",
        messageText: "Conteudo",
        priority: "NORMAL",
        createdAt: "2026-04-23T10:00:00Z",
        senderEmployeeId: "emp-1",
      },
    ]);
  });

  it("exclui mensagem pelo endpoint correto", async () => {
    server.use(
      http.delete("*/messages/msg-1", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(deleteMessage("msg-1")).resolves.toBeUndefined();
  });

  it("busca colaboradores ativos para selecao", async () => {
    server.use(
      http.get("*/employee", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("active")).toBe("true");

        return HttpResponse.json({
          employees: [
            {
              employeeId: "emp-1",
              fullName: "Maria Silva",
            },
          ],
        });
      })
    );

    await expect(fetchActiveEmployees()).resolves.toEqual([
      {
        employeeId: "emp-1",
        fullName: "Maria Silva",
      },
    ]);
  });
});
