import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, FileText, Loader2, UploadCloud, X } from "lucide-react";
import type { ChangeEvent, DragEvent, RefObject } from "react";
import { ALLOWED_ACCEPT_STRING, ALLOWED_MIME_TYPES } from "@/types/document";
import { formatFileSize } from "../upload-ui.helpers";

interface UploadDropzoneProps {
  variant: "desktop" | "mobile";
  selectedFile: File | null;
  isDragOver: boolean;
  isOptimizing: boolean;
  isUploading: boolean;
  fileError: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

const UploadDropzone = ({
  variant,
  selectedFile,
  isDragOver,
  isOptimizing,
  isUploading,
  fileError,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRemoveFile,
}: UploadDropzoneProps) => {
  const allowedLabels = ALLOWED_MIME_TYPES.map((ext) => ext.replace(".", "").toUpperCase()).join(" · ");

  const openPicker = () => fileInputRef.current?.click();
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        id="upload-file-input"
        type="file"
        accept={ALLOWED_ACCEPT_STRING}
        onChange={onFileSelect}
        disabled={isUploading || isOptimizing}
        className="sr-only"
      />

      {selectedFile ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#16A34A]/40 bg-[#DCFCE7]/60 px-4 py-3 shadow-sm">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16A34A]/10 text-[#15803D]"
            aria-hidden="true"
          >
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0F172A]" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <p className="mt-0.5 text-xs text-[#475569]">
              {formatFileSize(selectedFile.size)} · Pronto para envio
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remover ${selectedFile.name}`}
            onClick={onRemoveFile}
            disabled={isUploading || isOptimizing}
            className="h-10 w-10 text-[#DC2626] hover:bg-[#FEE2E2]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Selecione ou arraste um arquivo"
          aria-disabled={isUploading || isOptimizing}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-5 py-8 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
            variant === "desktop" ? "min-h-[200px] py-10" : "min-h-[160px]",
            isDragOver
              ? "border-[#2563EB] bg-[#EFF6FF]"
              : fileError
                ? "border-[#DC2626]/60 bg-[#FEE2E2]/40 hover:border-[#DC2626]"
                : "border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#F8FAFC]",
            (isUploading || isOptimizing) && "cursor-not-allowed opacity-70"
          )}
        >
          {isOptimizing ? (
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#B45309]"
              aria-hidden="true"
            >
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>
          ) : (
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                fileError
                  ? "bg-[#FEE2E2] text-[#DC2626]"
                  : "bg-[#EFF6FF] text-[#1D4ED8]"
              )}
              aria-hidden="true"
            >
              <UploadCloud className="h-6 w-6" />
            </span>
          )}
          <div className="mt-3 space-y-1">
            <p className="text-sm font-semibold text-[#0F172A]">
              {isOptimizing
                ? "Otimizando arquivo..."
                : "Clique para selecionar ou arraste o arquivo"}
            </p>
            <p className="text-xs text-[#64748B]">
              Formatos: {allowedLabels} · Máx 5MB
            </p>
          </div>
        </div>
      )}

      {fileError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-xs leading-5 text-[#B91C1C]"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {fileError}
        </p>
      ) : null}
    </div>
  );
};

export default UploadDropzone;
