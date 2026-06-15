import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarDays, MessageSquareText, User2 } from "lucide-react";
import type { Message } from "@/types/message";
import {
  formatNoticeDate,
  getAudienceLabel,
  getMessagePreview,
  getNoticePriorityLabel,
  getNoticePriorityTone,
  getSenderLabel,
} from "./notice-ui.helpers";

interface NoticeCardProps {
  message: Message;
  selected?: boolean;
  variant: "desktop" | "mobile";
  onClick: () => void;
}

const NoticeCard = ({ message, selected = false, variant, onClick }: NoticeCardProps) => {
  const tone = getNoticePriorityTone(message.priority);
  const compact = variant === "mobile";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Abrir aviso ${message.title}`}
      className={cn(
        "group w-full rounded-2xl border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
        tone.borderClass,
        selected && "ring-2 ring-primary/20 shadow-lg",
        compact ? "p-4" : "p-5"
      )}
    >
      <div className={cn("rounded-xl border border-border/60", tone.accentClass, compact ? "p-4" : "p-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border", tone.badgeClass)}>{getNoticePriorityLabel(message.priority)}</Badge>
              {message.recipientEmployeeId ? (
                <Badge variant="outline" className="border-border/70 text-[11px] text-muted-foreground">
                  Direcionado
                </Badge>
              ) : (
                <Badge variant="outline" className="border-border/70 text-[11px] text-muted-foreground">
                  Somente remetente
                </Badge>
              )}
            </div>

            <h3
              className={cn(
                "font-semibold leading-tight text-foreground",
                compact ? "text-base" : "text-lg",
                "line-clamp-2"
              )}
            >
              {message.title}
            </h3>
          </div>

          <div className={cn("rounded-full p-2", tone.badgeClass)}>
            <MessageSquareText className="h-4 w-4" />
          </div>
        </div>

        <p className={cn("mt-3 text-sm leading-6 text-muted-foreground", compact ? "line-clamp-3" : "line-clamp-2")}>
          {getMessagePreview(message.messageText, compact ? 120 : 180)}
        </p>

        <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <User2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{getSenderLabel(message)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{formatNoticeDate(message.createdAt)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--kronos-blue-main, #2563EB)" }} />
          <span>{getAudienceLabel(message)}</span>
        </div>
      </div>
    </button>
  );
};

export default NoticeCard;
