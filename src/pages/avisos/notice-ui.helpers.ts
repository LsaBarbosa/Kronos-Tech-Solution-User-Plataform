import type { Message, MessagePriority } from "@/types/message";

export type NoticePriorityFilter = "ALL" | MessagePriority;

export type NoticePriorityTone = {
  label: string;
  description: string;
  badgeClass: string;
  borderClass: string;
  accentClass: string;
  dotClass: string;
};

export type NoticePermissionCopy = {
  title: string;
  description: string;
  toneClass: string;
  badgeClass: string;
};

export const NOTICE_PRIORITY_OPTIONS: Array<{
  value: NoticePriorityFilter;
  label: string;
}> = [
  { value: "ALL", label: "Todos" },
  { value: "NORMAL", label: "Normal" },
  { value: "ALERT", label: "Alerta" },
  { value: "CRITICAL", label: "Crítico" },
];

export const getNoticePriorityLabel = (priority: MessagePriority): string => {
  switch (priority) {
    case "NORMAL":
      return "Normal";
    case "ALERT":
      return "Alerta";
    case "CRITICAL":
      return "Crítico";
    default:
      return "Aviso";
  }
};

export const getNoticePriorityTone = (priority: MessagePriority): NoticePriorityTone => {
  switch (priority) {
    case "NORMAL":
      return {
        label: "Normal",
        description: "Comunicação operacional sem urgência.",
        badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
        borderClass: "border-l-slate-400",
        accentClass: "bg-slate-50",
        dotClass: "bg-slate-500",
      };
    case "ALERT":
      return {
        label: "Alerta",
        description: "Atenção recomendada para leitura imediata.",
        badgeClass: "border-amber-200 bg-amber-100 text-amber-800",
        borderClass: "border-l-amber-500",
        accentClass: "bg-amber-50",
        dotClass: "bg-amber-500",
      };
    case "CRITICAL":
      return {
        label: "Crítico",
        description: "Comunicação sensível e prioritária.",
        badgeClass: "border-red-200 bg-red-100 text-red-800",
        borderClass: "border-l-red-500",
        accentClass: "bg-red-50",
        dotClass: "bg-red-500",
      };
    default:
      return {
        label: "Aviso",
        description: "Comunicação interna.",
        badgeClass: "border-border bg-muted text-foreground",
        borderClass: "border-l-border",
        accentClass: "bg-muted/40",
        dotClass: "bg-muted-foreground",
      };
  }
};

export const formatNoticeDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getMessagePreview = (messageText: string, maxLength = 160): string => {
  const normalized = messageText.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

export const filterNoticeMessages = (
  messages: Message[],
  searchTerm: string,
  priorityFilter: NoticePriorityFilter
): Message[] => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return messages.filter((message) => {
    if (priorityFilter !== "ALL" && message.priority !== priorityFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      message.title.toLowerCase().includes(normalizedSearch) ||
      message.messageText.toLowerCase().includes(normalizedSearch)
    );
  });
};

export const getNoticeMetrics = (messages: Message[]) => {
  const alerts = messages.filter((message) => message.priority === "ALERT").length;
  const critical = messages.filter((message) => message.priority === "CRITICAL").length;
  const directed = messages.filter((message) => Boolean(message.recipientEmployeeId)).length;

  return {
    total: messages.length,
    alerts,
    critical,
    directed,
  };
};

export const canManageMessages = (role: string): boolean => role === "MANAGER";

export const getSenderLabel = (message: Message): string => message.senderName?.trim() || "Remetente interno";

export const getAudienceLabel = (message: Message): string =>
  message.recipientEmployeeId
    ? "Direcionado a colaboradores específicos"
    : "Visível apenas para o remetente";

export const getNoticePermissionCopy = (role: string): NoticePermissionCopy => {
  switch (role) {
    case "MANAGER":
      return {
        title: "Ações liberadas",
        description: "Você pode publicar novos avisos e remover comunicados, seguindo o contrato atual.",
        toneClass: "text-emerald-700",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "CTO":
      return {
        title: "Governança administrativa",
        description: "O layout destaca visão administrativa, mas as ações reais seguem apenas o contrato disponível.",
        toneClass: "text-blue-700",
        badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
      };
    case "PARTNER":
    default:
      return {
        title: "Somente leitura",
        description: "Você pode consultar os avisos recebidos e abrir os detalhes, sem ações destrutivas.",
        toneClass: "text-slate-700",
        badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      };
  }
};
