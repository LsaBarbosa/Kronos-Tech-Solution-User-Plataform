export const queryKeys = {
  documents: ["documents"] as const,
  employees: ["employees"] as const,
  managerOptions: ["managerOptions"] as const,
  messages: ["messages"] as const,
  pendingApprovals: ["pendingApprovals"] as const,
  timeOffApprovals: ["time-off-approvals"] as const,
  timeOffCount: ["pendingTimeOffCount"] as const,
  vacationCount: ["pendingVacationCount"] as const,
  vacationRequests: ["vacationRequests"] as const,
  fiscal: ["fiscal"] as const,
  faqSearch: (query: string, screen?: string, page?: number) =>
    ["faq", "search", query, screen, page] as const,
  faqContextual: (screen: string, limit?: number) =>
    ["faq", "contextual", screen, limit] as const,
  faqDetail: (faqId: string) => ["faq", "detail", faqId] as const,
};
