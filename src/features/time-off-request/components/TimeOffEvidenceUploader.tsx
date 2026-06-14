import { useRef, type ChangeEvent } from "react";
import { AlertTriangle, FileUp, Paperclip, ShieldCheck, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALLOWED_ACCEPT_STRING, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";
import { formatTimeOffFileSize } from "../utils/timeOffFormatting";
import type { TimeOffRequestFileSummary } from "../types";

interface TimeOffEvidenceUploaderProps {
  document: File | null;
  documentSummary?: TimeOffRequestFileSummary;
  documentError?: string;
  isPreparingDocument: boolean;
  isSubmitting: boolean;
  onDocumentChange: (file: File | null) => Promise<void>;
  onClearDocument: () => void;
  onOpenPolicy: () => void;
  variant?: "desktop" | "mobile";
  className?: string;
}

const TimeOffEvidenceUploader = ({
  document,
  documentSummary,
  documentError,
  isPreparingDocument,
  isSubmitting,
  onDocumentChange,
  onClearDocument,
  onOpenPolicy,
  variant = "desktop",
  className,
}: TimeOffEvidenceUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = variant === "mobile";

  const triggerFileDialog = () => {
    inputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    await onDocumentChange(nextFile);
    event.target.value = "";
  };

  return (
    <Card className={cn("rounded-[28px] border border-[#D8E2EC] bg-white shadow-[0_16px_40px_rgba(16,42,67,0.10)]", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#B3C2D0] bg-[#E9EEF4] text-[#102A43]">
            <Paperclip className="mr-1 h-3.5 w-3.5" />
            Anexo
          </Badge>
        </div>
        <CardTitle className="text-[#102A43]">Evidência protegida</CardTitle>
        <CardDescription className="text-[#627D98]">
          O anexo é opcional e segue as regras de segurança da solicitação.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          ref={inputRef}
          type="file"
          accept={ALLOWED_ACCEPT_STRING}
          className="hidden"
          onChange={handleChange}
          disabled={isPreparingDocument || isSubmitting}
        />

        <div className={cn("rounded-[24px] border p-4", document ? "border-[#B3C2D0] bg-[#F8FAFC]" : "border-dashed border-[#D8E2EC] bg-[#F8FAFC]")}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F4E5F] text-white">
              <FileUp className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-sm font-semibold text-[#102A43]">Tipo aceito: PDF, JPG, JPEG ou PNG</p>
                <p className="text-sm leading-6 text-[#627D98]">
                  Limite de {(MAX_UPLOAD_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB e processamento protegido.
                </p>
              </div>

              {documentSummary ? (
                <div className="rounded-[20px] border border-[#D8E2EC] bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#102A43]">{documentSummary.name}</p>
                      <p className="text-sm text-[#627D98]">
                        {documentSummary.typeLabel} • {documentSummary.sizeLabel}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-[#B8E4D2] bg-[#EAF9F3] text-[#166534]">
                      {documentSummary.statusLabel}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#D8E2EC] bg-white px-4 py-3 text-sm text-[#627D98]">
                  Nenhum arquivo selecionado.
                </div>
              )}
            </div>
          </div>
        </div>

        {documentError ? (
          <div className="rounded-[22px] border border-[#F3D08A] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#8A5A00]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>{documentError}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[22px] border border-[#B3C2D0] bg-[#EEF4F9] px-4 py-3 text-sm leading-6 text-[#1F4E5F]">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-[#1C8C7C]" />
              <p>
                Evidência protegida. O arquivo é usado somente no fluxo de análise gerencial.
              </p>
            </div>
          </div>
        )}

        <div className={cn("flex flex-wrap gap-3", isMobile && "flex-col")}>
          <Button
            type="button"
            className="h-11 rounded-full bg-[#1F4E5F] px-5 text-white hover:bg-[#102A43]"
            onClick={triggerFileDialog}
            disabled={isPreparingDocument || isSubmitting}
          >
            <Upload className="h-4 w-4" />
            {document ? "Substituir anexo" : "Anexar evidência"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full border-[#D8E2EC] bg-white px-5 text-[#102A43]"
            onClick={onOpenPolicy}
          >
            Ver política de anexo
          </Button>
          {document ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-full px-5 text-[#D64545] hover:bg-[#FDECEC] hover:text-[#B91C1C]"
              onClick={onClearDocument}
            >
              <Trash2 className="h-4 w-4" />
              Remover arquivo
            </Button>
          ) : null}
        </div>

        {document ? (
          <div className="text-xs leading-6 text-[#627D98]">
            <span className="font-semibold text-[#102A43]">Arquivo atual:</span> {document.name} •{" "}
            {formatTimeOffFileSize(document.size)}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TimeOffEvidenceUploader;
