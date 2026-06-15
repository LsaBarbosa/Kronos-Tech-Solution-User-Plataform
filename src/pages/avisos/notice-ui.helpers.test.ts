import { describe, expect, it } from "vitest";
import {
  filterNoticeMessages,
  getNoticeMetrics,
  getNoticePermissionCopy,
  getNoticePriorityTone,
} from "./notice-ui.helpers";

const messages = [
  {
    messageId: "1",
    title: "Mudança no expediente",
    messageText: "O expediente será ajustado amanhã.",
    priority: "NORMAL" as const,
    createdAt: "2026-06-15T10:00:00Z",
    senderEmployeeId: "sender-1",
    recipientEmployeeId: undefined,
  },
  {
    messageId: "2",
    title: "Alerta de manutenção",
    messageText: "Interrupção programada do sistema.",
    priority: "ALERT" as const,
    createdAt: "2026-06-15T11:00:00Z",
    senderEmployeeId: "sender-2",
    recipientEmployeeId: "recipient-1",
  },
  {
    messageId: "3",
    title: "Incidente crítico",
    messageText: "Ação imediata necessária.",
    priority: "CRITICAL" as const,
    createdAt: "2026-06-15T12:00:00Z",
    senderEmployeeId: "sender-3",
    recipientEmployeeId: "recipient-2",
  },
];

describe("notice-ui.helpers", () => {
  it("filtra por texto e prioridade", () => {
    expect(filterNoticeMessages(messages, "expediente", "ALL")).toHaveLength(1);
    expect(filterNoticeMessages(messages, "", "ALERT")).toHaveLength(1);
    expect(filterNoticeMessages(messages, "sistema", "ALERT")).toHaveLength(1);
  });

  it("calcula métricas da página atual", () => {
    expect(getNoticeMetrics(messages)).toEqual({
      total: 3,
      alerts: 1,
      critical: 1,
      directed: 2,
    });
  });

  it("expõe cópia de permissão por papel", () => {
    expect(getNoticePermissionCopy("PARTNER").title).toBe("Somente leitura");
    expect(getNoticePermissionCopy("MANAGER").title).toBe("Ações liberadas");
    expect(getNoticePermissionCopy("CTO").title).toBe("Governança administrativa");
  });

  it("mapeia tons por prioridade", () => {
    expect(getNoticePriorityTone("ALERT").label).toBe("Alerta");
    expect(getNoticePriorityTone("CRITICAL").badgeClass).toContain("red");
  });
});
