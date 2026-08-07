import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useResponsiveMode, DESKTOP_BREAKPOINT_QUERY } from "@/hooks/useResponsiveMode";
import { previewAfdImport, confirmAfdImport } from "@/service/afd-import.service";
import type { AfdImportPreviewResponse, AfdImportConfirmResponse } from "@/types/afd-import.types";
import { useToast } from "@/hooks/use-toast";

type ImportState =
  | { phase: "idle" }
  | { phase: "previewing" }
  | { phase: "preview"; data: AfdImportPreviewResponse; file: File }
  | { phase: "confirming"; data: AfdImportPreviewResponse; file: File }
  | { phase: "success"; result: AfdImportConfirmResponse }
  | { phase: "error"; message: string };

const MAX_AFD_SIZE_BYTES = 50 * 1024 * 1024;

const formatCnpj = (cnpj: string): string => {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

const formatPeriod = (start: string, end: string): string => `${start} → ${end}`;

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const err = error as { message?: string; response?: { data?: { message?: string } } };
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message) return err.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
};

const FileDropzone = ({
  variant,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef,
  disabled,
}: {
  variant: "desktop" | "mobile";
  isDragOver: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
}) => {
  const open = () => fileInputRef.current?.click();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={onFileSelect}
        disabled={disabled}
        className="sr-only"
        aria-label="Selecionar arquivo AFD"
      />
      <div
        role="button"
        tabIndex={0}
        aria-label="Selecione ou arraste o arquivo AFD (.txt)"
        aria-disabled={disabled}
        onClick={open}
        onKeyDown={handleKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white px-5 py-8 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
          variant === "desktop" ? "min-h-[200px] py-10" : "min-h-[160px]",
          isDragOver
            ? "border-[#2563EB] bg-[#EFF6FF]"
            : "border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#F8FAFC]",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]"
          aria-hidden="true"
        >
          <UploadCloud className="h-6 w-6" />
        </span>
        <div className="mt-3 space-y-1">
          <p className="text-sm font-semibold text-[#0F172A]">
            {variant === "desktop"
              ? "Clique para selecionar ou arraste o arquivo AFD"
              : "Toque para selecionar o arquivo AFD"}
          </p>
          <p className="text-xs text-[#64748B]">Formato: .TXT · Máx 50MB</p>
        </div>
      </div>
    </div>
  );
};

const PreviewDesktop = ({
  data,
  onConfirm,
  onCancel,
  isConfirming,
}: {
  data: AfdImportPreviewResponse;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming: boolean;
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-border/60">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">
            Empresa no arquivo
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-1">
          <p className="text-base font-semibold text-[#0F172A]">{data.companyName || data.razaoSocial}</p>
          <p className="text-sm text-[#475569]">CNPJ: {formatCnpj(data.cnpj)}</p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">
            Período
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-base font-semibold text-[#0F172A]">
            {formatPeriod(data.periodoInicio, data.periodoFim)}
          </p>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <Card className="border-border/60 text-center">
        <CardContent className="py-4 px-3">
          <p className="text-2xl font-bold text-[#0F172A]">{data.totalMarks}</p>
          <p className="text-xs text-[#64748B] mt-1">Total no arquivo</p>
        </CardContent>
      </Card>
      <Card className="border-border/60 text-center">
        <CardContent className="py-4 px-3">
          <p className="text-2xl font-bold text-[#16A34A]">{data.toImport}</p>
          <p className="text-xs text-[#64748B] mt-1">A importar</p>
        </CardContent>
      </Card>
      <Card className="border-border/60 text-center">
        <CardContent className="py-4 px-3">
          <p className="text-2xl font-bold text-[#64748B]">{data.alreadyImported}</p>
          <p className="text-xs text-[#64748B] mt-1">Já importadas</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Card className="border-border/60 text-center">
        <CardContent className="py-4 px-3">
          <p className="text-2xl font-bold text-[#2563EB]">{data.employeesFound}</p>
          <p className="text-xs text-[#64748B] mt-1">Funcionários encontrados</p>
        </CardContent>
      </Card>
      <Card className="border-border/60 text-center">
        <CardContent className="py-4 px-3">
          <p className={cn("text-2xl font-bold", data.employeesNotFound > 0 ? "text-[#D97706]" : "text-[#0F172A]")}>
            {data.employeesNotFound}
          </p>
          <p className="text-xs text-[#64748B] mt-1">Não encontrados</p>
        </CardContent>
      </Card>
    </div>

    {data.skippedLines > 0 && (
      <p className="text-xs text-[#64748B]">
        Linhas ignoradas (cabeçalho/rodapé): {data.skippedLines}
      </p>
    )}

    {data.openRecords > 0 && (
      <div className="flex items-start gap-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
        <p className="text-sm text-[#92400E]">
          <span className="font-semibold">{data.openRecords}</span>{" "}
          {data.openRecords === 1
            ? "batida sem par — será importada como registro aberto."
            : "batidas sem par — serão importadas como registros abertos."}
        </p>
      </div>
    )}

    {data.notFoundPisList.length > 0 && (
      <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-sm font-semibold text-[#92400E]">
            PIS não encontrados ({data.notFoundPisList.length})
          </p>
        </div>
        <ul className="flex flex-wrap gap-2 pl-6">
          {data.notFoundPisList.map((pis) => (
            <li
              key={pis}
              className="rounded-lg border border-[#FDE68A] bg-[#FEF3C7] px-2 py-0.5 text-xs font-mono text-[#78350F]"
            >
              {pis}
            </li>
          ))}
        </ul>
        <p className="pl-6 text-xs text-[#92400E]">
          Esses funcionários não estão vinculados à empresa e suas marcações serão ignoradas.
        </p>
      </div>
    )}

    <div className="flex gap-3 pt-2">
      <Button
        onClick={onConfirm}
        disabled={isConfirming}
        className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
      >
        {isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importando...
          </>
        ) : (
          "Confirmar importação"
        )}
      </Button>
      <Button
        onClick={onCancel}
        disabled={isConfirming}
        variant="outline"
        className="flex-1"
      >
        Cancelar
      </Button>
    </div>
  </div>
);

const PreviewMobile = ({
  data,
  onConfirm,
  onCancel,
  isConfirming,
}: {
  data: AfdImportPreviewResponse;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming: boolean;
}) => (
  <div className="space-y-4">
    <div className="space-y-1 rounded-2xl border border-border/60 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Empresa</p>
      <p className="text-sm font-semibold text-[#0F172A]">{data.companyName || data.razaoSocial}</p>
      <p className="text-xs text-[#475569]">CNPJ: {formatCnpj(data.cnpj)}</p>
      <p className="text-xs text-[#475569]">Período: {formatPeriod(data.periodoInicio, data.periodoFim)}</p>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center">
      {[
        { value: data.totalMarks, label: "Total" },
        { value: data.toImport, label: "A importar", color: "text-[#16A34A]" },
        { value: data.alreadyImported, label: "Já importadas", color: "text-[#64748B]" },
      ].map(({ value, label, color }) => (
        <div key={label} className="rounded-2xl border border-border/60 bg-white py-3 px-2">
          <p className={cn("text-xl font-bold text-[#0F172A]", color)}>{value}</p>
          <p className="mt-0.5 text-[10px] text-[#64748B]">{label}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-2 text-center">
      <div className="rounded-2xl border border-border/60 bg-white py-3 px-2">
        <p className="text-xl font-bold text-[#2563EB]">{data.employeesFound}</p>
        <p className="mt-0.5 text-[10px] text-[#64748B]">Encontrados</p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-white py-3 px-2">
        <p className={cn("text-xl font-bold", data.employeesNotFound > 0 ? "text-[#D97706]" : "text-[#0F172A]")}>
          {data.employeesNotFound}
        </p>
        <p className="mt-0.5 text-[10px] text-[#64748B]">Não encontrados</p>
      </div>
    </div>

    {data.openRecords > 0 && (
      <div className="flex items-start gap-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]" aria-hidden="true" />
        <p className="text-xs text-[#92400E]">
          <span className="font-semibold">{data.openRecords}</span>{" "}
          {data.openRecords === 1 ? "batida sem par" : "batidas sem par"} — serão importadas como registros abertos.
        </p>
      </div>
    )}

    {data.notFoundPisList.length > 0 && (
      <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-xs font-semibold text-[#92400E]">
            {data.notFoundPisList.length} PIS não encontrado{data.notFoundPisList.length > 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-[10px] text-[#92400E]">
          Marcações desses funcionários serão ignoradas.
        </p>
      </div>
    )}

    <div className="flex flex-col gap-2 pt-1">
      <Button
        onClick={onConfirm}
        disabled={isConfirming}
        className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
      >
        {isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importando...
          </>
        ) : (
          "Confirmar importação"
        )}
      </Button>
      <Button onClick={onCancel} disabled={isConfirming} variant="outline" className="w-full">
        Cancelar
      </Button>
    </div>
  </div>
);

const SuccessView = ({
  result,
  onReset,
}: {
  result: AfdImportConfirmResponse;
  onReset: () => void;
}) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#16A34A]">
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <div>
        <p className="text-base font-semibold text-[#0F172A]">Importação concluída</p>
        <p className="text-sm text-[#64748B]">Os registros foram processados com sucesso.</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {[
        { value: result.timeRecordsCreated, label: "Registros criados", color: "text-[#16A34A]" },
        { value: result.timeRecordsDuplicated, label: "Duplicatas ignoradas", color: "text-[#64748B]" },
        { value: result.afdEntriesSaved, label: "Entradas AFD salvas", color: "text-[#2563EB]" },
        { value: result.afdEntriesDuplicated, label: "Entradas duplicadas", color: "text-[#64748B]" },
      ].map(({ value, label, color }) => (
        <div key={label} className="rounded-2xl border border-border/60 bg-white py-4 px-3 text-center">
          <p className={cn("text-2xl font-bold", color)}>{value}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">{label}</p>
        </div>
      ))}
    </div>

    {result.employeesNotLinked > 0 && (
      <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-sm font-semibold text-[#92400E]">
            {result.employeesNotLinked} funcionário{result.employeesNotLinked > 1 ? "s" : ""} não vinculado{result.employeesNotLinked > 1 ? "s" : ""}
          </p>
        </div>
        {result.notLinkedPisList.length > 0 && (
          <ul className="flex flex-wrap gap-2 pl-6">
            {result.notLinkedPisList.map((pis) => (
              <li
                key={pis}
                className="rounded-lg border border-[#FDE68A] bg-[#FEF3C7] px-2 py-0.5 text-xs font-mono text-[#78350F]"
              >
                {pis}
              </li>
            ))}
          </ul>
        )}
      </div>
    )}

    <Button onClick={onReset} variant="outline" className="w-full">
      Importar outro arquivo
    </Button>
  </div>
);

const AfdImportPage = () => {
  const { isDesktop } = useResponsiveMode(DESKTOP_BREAKPOINT_QUERY);
  const { toast } = useToast();

  const [state, setState] = useState<ImportState>({ phase: "idle" });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "txt") return "Apenas arquivos .TXT são aceitos.";
    if (file.size > MAX_AFD_SIZE_BYTES) return "O arquivo excede o tamanho máximo de 50MB.";
    return null;
  };

  const runPreview = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({ title: "Arquivo inválido", description: error, variant: "destructive" });
      return;
    }

    setState({ phase: "previewing" });
    try {
      const data = await previewAfdImport(file);
      setState({ phase: "preview", data, file });
    } catch (err) {
      setState({ phase: "error", message: extractErrorMessage(err) });
    }
  }, [toast]);

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void runPreview(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [runPreview]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void runPreview(file);
    },
    [runPreview]
  );

  const handleConfirm = useCallback(async () => {
    if (state.phase !== "preview") return;
    const { data, file } = state;
    setState({ phase: "confirming", data, file });
    try {
      const result = await confirmAfdImport(file);
      setState({ phase: "success", result });
    } catch (err) {
      setState({ phase: "error", message: extractErrorMessage(err) });
    }
  }, [state]);

  const handleCancel = useCallback(() => setState({ phase: "idle" }), []);
  const handleReset = useCallback(() => setState({ phase: "idle" }), []);
  const handleRetry = useCallback(() => setState({ phase: "idle" }), []);

  const isConfirming = state.phase === "confirming";
  const isPreviewing = state.phase === "previewing";

  return (
    <PageShell mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 space-y-6 sm:space-y-8 relative z-10 overflow-x-hidden">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">Importar AFD</h1>
            <p className="text-sm text-[#64748B]">
              Importe o arquivo AFD gerado pelo relógio de ponto.
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-primary/10 px-5 pb-4 pt-5">
            <CardTitle className="text-base font-semibold text-[#0F172A]">
              {state.phase === "idle" || state.phase === "previewing"
                ? "Selecionar arquivo"
                : state.phase === "preview" || state.phase === "confirming"
                ? "Resumo do arquivo"
                : state.phase === "success"
                ? "Resultado da importação"
                : "Erro na importação"}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-5 py-5">
            {(state.phase === "idle" || state.phase === "previewing") && (
              <div className="space-y-4">
                {isPreviewing ? (
                  <div className="flex min-h-[160px] flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-[#64748B]">Analisando arquivo...</p>
                  </div>
                ) : (
                  <FileDropzone
                    variant={isDesktop ? "desktop" : "mobile"}
                    isDragOver={isDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onFileSelect={handleFileSelect}
                    fileInputRef={fileInputRef}
                    disabled={false}
                  />
                )}
              </div>
            )}

            {(state.phase === "preview" || state.phase === "confirming") &&
              (isDesktop ? (
                <PreviewDesktop
                  data={state.data}
                  onConfirm={() => void handleConfirm()}
                  onCancel={handleCancel}
                  isConfirming={isConfirming}
                />
              ) : (
                <PreviewMobile
                  data={state.data}
                  onConfirm={() => void handleConfirm()}
                  onCancel={handleCancel}
                  isConfirming={isConfirming}
                />
              ))}

            {state.phase === "success" && (
              <SuccessView result={state.result} onReset={handleReset} />
            )}

            {state.phase === "error" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEE2E2] px-4 py-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]" aria-hidden="true" />
                  <p className="text-sm text-[#B91C1C]">{state.message}</p>
                </div>
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  Tentar novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default AfdImportPage;
