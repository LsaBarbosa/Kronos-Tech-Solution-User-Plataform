import { Badge } from "@/components/ui/badge";
import type { MessagePriority } from "@/types/message";

const PRIORITY_STYLES: Record<MessagePriority, string> = {
  NORMAL: "border-sky-200 bg-sky-50 text-sky-700",
  ALERT: "border-amber-200 bg-amber-50 text-amber-800",
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
};

const PRIORITY_LABELS: Record<MessagePriority, string> = {
  NORMAL: "Normal",
  ALERT: "Alerta",
  CRITICAL: "Critico",
};

interface MessagePriorityBadgeProps {
  priority: MessagePriority;
}

export const MessagePriorityBadge = ({ priority }: MessagePriorityBadgeProps) => (
  <Badge className={`border ${PRIORITY_STYLES[priority]}`}>{PRIORITY_LABELS[priority]}</Badge>
);
