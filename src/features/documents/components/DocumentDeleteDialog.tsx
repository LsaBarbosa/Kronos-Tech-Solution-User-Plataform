import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import type { DocumentItem } from "@/hooks/useDocumentsPage";
import { findDocumentTypeOption } from "../documents-ui.helpers";

interface DocumentDeleteDialogProps {
  document: DocumentItem | null;
  open: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  formatDate: (value: string) => string;
}

const DocumentDeleteDialog = ({
  document,
  open,
  isDeleting,
  onCancel,
  onConfirm,
  formatDate,
}: DocumentDeleteDialogProps) => {
  const option = document ? findDocumentTypeOption(document.type) : undefined;

  return (
    <Dialog open={open && Boolean(document)} onOpenChange={(next) => (!next ? onCancel() : undefined)}>
      <DialogContent className="w-[92vw] max-w-lg rounded-2xl border-border/70 p-0 shadow-2xl">
        <DialogHeader className="border-b border-border/60 bg-[#FEF2F2] px-5 py-4">
          <DialogTitle className="flex items-start gap-3 text-lg font-semibold leading-tight text-[#0F172A]">
            <span className="rounded-full bg-[#FEE2E2] p-2 text-[#DC2626]" aria-hidden="true">
              <TriangleAlert className="h-4 w-4" />
            </span>
            Excluir documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-[#475569]">
            Esta ação remove o documento do acervo. Trata-se de uma operação destrutiva que será
            registrada para fins de auditoria.
          </p>

          {document ? (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-[#F8FAFC] p-4">
              <div className="flex flex-wrap items-center gap-2">
                {option ? (
                  <Badge className="border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                    {option.label}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="border-border/70 text-[11px]">
                  {formatDate(document.createdAt)}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#0F172A]" title={document.name}>
                  {document.name}
                </p>
                <p className="text-xs text-[#64748B]">ID: {document.id}</p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border/60 bg-[#F8FAFC] px-5 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting} className="h-11 w-full">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="h-11 w-full"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Confirmar exclusão
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDeleteDialog;
