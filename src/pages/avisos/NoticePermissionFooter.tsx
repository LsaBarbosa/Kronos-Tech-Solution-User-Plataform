import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock, PlusCircle, ShieldAlert } from "lucide-react";
import type { NoticePermissionCopy } from "./notice-ui.helpers";

interface NoticePermissionFooterProps {
  canCreate: boolean;
  permissionCopy: NoticePermissionCopy;
  onCreate: () => void;
}

const NoticePermissionFooter = ({ canCreate, permissionCopy, onCreate }: NoticePermissionFooterProps) => {
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white px-4 py-3 shadow-sm">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Lock className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border", permissionCopy.badgeClass)}>{permissionCopy.title}</Badge>
              <Badge variant="outline" className="border-border/70 text-[11px]">
                Rodapé fixo
              </Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{permissionCopy.description}</p>
          </div>
        </div>

        {canCreate ? (
          <Button type="button" size="lg" onClick={onCreate} className="h-12 w-full bg-primary text-primary-foreground">
            <PlusCircle className="h-4 w-4" />
            Novo aviso
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Você pode abrir os detalhes, mas não possui ações de criação ou exclusão.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticePermissionFooter;
