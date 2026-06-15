import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import type { Message } from "@/types/message";
import { formatNoticeDate, getNoticePriorityLabel, getNoticePriorityTone, getSenderLabel } from "./notice-ui.helpers";

interface NoticeDeleteDialogProps {
  message: Message | null;
  open: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const NoticeDeleteDialog = ({ message, open, isDeleting, onCancel, onConfirm }: NoticeDeleteDialogProps) => {
  const tone = message ? getNoticePriorityTone(message.priority) : null;

  return (
    <Dialog open={open && Boolean(message)} onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : undefined)}>
      <DialogContent className="w-[92vw] max-w-lg rounded-2xl border-border/70 p-0 shadow-2xl">
        <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
          <DialogTitle className="flex items-start gap-3 text-lg font-semibold leading-tight text-foreground">
            <span className="rounded-full bg-red-100 p-2 text-red-700">
              <TriangleAlert className="h-4 w-4" />
            </span>
            Deletar aviso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-muted-foreground">
            Esta ação remove o aviso da central interna para os usuários elegíveis. Confirme apenas se
            deseja seguir com a exclusão.
          </p>

          {message ? (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                {tone ? <Badge className={tone.badgeClass}>{getNoticePriorityLabel(message.priority)}</Badge> : null}
                <Badge variant="outline" className="border-border/70 text-[11px]">
                  {formatNoticeDate(message.createdAt)}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{message.title}</p>
                <p className="text-sm text-muted-foreground">Remetente: {getSenderLabel(message)}</p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/15 px-5 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting} className="h-11 w-full">
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting} className="h-11 w-full">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Confirmar exclusão
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDeleteDialog;
