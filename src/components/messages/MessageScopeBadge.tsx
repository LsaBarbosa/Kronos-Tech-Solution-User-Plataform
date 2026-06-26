import { Badge } from "@/components/ui/badge";
import type { MessageScope } from "@/types/message";

const SCOPE_STYLES: Record<MessageScope, string> = {
  DIRECT: "border-blue-200 bg-blue-50 text-blue-700",
  GLOBAL: "border-slate-300 bg-slate-100 text-slate-700",
};

const SCOPE_LABELS: Record<MessageScope, string> = {
  DIRECT: "Direcionado",
  GLOBAL: "Global",
};

interface MessageScopeBadgeProps {
  scope?: MessageScope;
}

export const MessageScopeBadge = ({ scope = "DIRECT" }: MessageScopeBadgeProps) => (
  <Badge variant="outline" className={`border ${SCOPE_STYLES[scope]}`}>
    {SCOPE_LABELS[scope]}
  </Badge>
);
