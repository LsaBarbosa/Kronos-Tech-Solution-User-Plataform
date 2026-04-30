import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  fetchAllWarnings,
  fetchPendingApprovalsCount,
  fetchUserProfile,
  updateLastSeenMessageTimestamp,
} from "./dashboard.service";

describe("dashboard.service", () => {
  it("busca o perfil do usuario logado", async () => {
    server.use(
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "emp-1",
          fullName: "Maria",
          role: "PARTNER",
        })
      )
    );

    await expect(fetchUserProfile()).resolves.toMatchObject({
      employeeId: "emp-1",
      fullName: "Maria",
      role: "PARTNER",
    });
  });

  it("busca a contagem de aprovacoes pendentes", async () => {
    server.use(
      http.get("*/records/pending-approvals", () =>
        HttpResponse.json({
          approvals: [],
          totalPages: 1,
          totalElements: 7,
          currentPage: 0,
          isFirst: true,
          isLast: true,
        })
      )
    );

    await expect(fetchPendingApprovalsCount()).resolves.toMatchObject({
      totalElements: 7,
    });
  });

  it("busca avisos do dashboard", async () => {
    server.use(
      http.get("*/messages", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("0");
        expect(url.searchParams.get("size")).toBe("5");

        return HttpResponse.json({
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
        });
      })
    );

    await expect(fetchAllWarnings()).resolves.toHaveLength(1);
  });

  it("marca mensagem como lida", async () => {
    server.use(
      http.post("*/employee/mark-messages-seen", () => new HttpResponse(null, { status: 204 }))
    );

    await expect(updateLastSeenMessageTimestamp()).resolves.toBeUndefined();
  });
});
