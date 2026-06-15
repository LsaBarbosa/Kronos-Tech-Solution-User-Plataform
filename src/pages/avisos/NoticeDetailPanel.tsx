import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, Megaphone, MessageSquareText, User2, Trash2, PlusCircle } from "lucide-react";
import type { Message } from "@/types/message";
import {
  formatNoticeDate,
  getAudienceLabel,
  getNoticePriorityLabel,
  getNoticePriorityTone,
  getSenderLabel,
  getMessagePreview,
} from "./notice-ui.helpers";

interface NoticeDetailPanelProps {
  message: Message | null;
  variant: "desktop" | "mobile";
  showCreateAction: boolean;
  showDeleteAction: boolean;
  onCreate: () => void;
  onRequestDelete: () => void;
}

const DetailStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p>
  </div>
);

const NoticeDetailPanel = ({
  message,
  variant,
  showCreateAction,
  showDeleteAction,
  onCreate,
  onRequestDelete,
}: NoticeDetailPanelProps) => {
  const compact = variant === "mobile";
  const tone = message ? getNoticePriorityTone(message.priority) : null;

  return (
    <Card className={cn("overflow-hidden border-border/70 shadow-sm", compact && "shadow-none")}>
      <CardHeader className={cn("border-b border-border/60 bg-muted/15", compact ? "px-4 py-4" : "px-5 py-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {message ? "Aviso selecionado" : "Painel de leitura"}
            </p>
            <CardTitle className={cn("leading-tight", compact ? "text-lg" : "text-xl")}>
              {message ? message.title : "Selecione um aviso"}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {message
                ? "Leia o conteúdo integral, verifique a prioridade e acesse as ações autorizadas."
                : "Escolha um item na lista para ver o detalhe completo e as ações relacionadas."}
            </p>
          </div>

          {message && tone ? (
            <Badge className={cn("shrink-0 border", tone.badgeClass)}>{tone.label}</Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact ? "px-4 py-4" : "px-5 py-5")}>
        {!message ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-border/70 bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Nenhum aviso selecionado</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Use a lista para navegar entre comunicados, prioridades e destinatários.
                  </p>
                </div>
              </div>
            </div>

            {showCreateAction ? (
              <Button type="button" className="h-11 w-full bg-primary text-primary-foreground" onClick={onCreate}>
                <PlusCircle className="h-4 w-4" />
                Novo aviso
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailStat label="Remetente" value={getSenderLabel(message)} />
              <DetailStat label="Destinatário" value={getAudienceLabel(message)} />
              <DetailStat label="Criado em" value={formatNoticeDate(message.createdAt)} />
              <DetailStat label="Prioridade" value={getNoticePriorityLabel(message.priority)} />
            </div>

            <div className={cn("rounded-2xl border border-border/60 p-4", tone?.accentClass ?? "bg-muted/20")}>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                <MessageSquareText className="h-4 w-4" />
                Conteúdo
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                {message.messageText}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Resumo operacional
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <li>{tone?.description}</li>
                <li>{getAudienceLabel(message)}</li>
                <li>{getMessagePreview(message.messageText, 120)}</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row">
              {showCreateAction ? (
                <Button type="button" variant="outline" onClick={onCreate} className="h-11 w-full sm:w-auto">
                  <PlusCircle className="h-4 w-4" />
                  Novo aviso
                </Button>
              ) : null}

              {showDeleteAction ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onRequestDelete}
                  className="h-11 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar aviso
                </Button>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NoticeDetailPanel;
