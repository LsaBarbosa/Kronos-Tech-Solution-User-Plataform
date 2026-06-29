import { RefObject } from "react";
import { Camera, Loader2, RefreshCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TerminalStep } from "@/types/terminal";

interface TerminalCaptureStepProps {
  step: TerminalStep;
  videoRef: RefObject<HTMLVideoElement>;
  onCapture: () => void;
  errorMessage: string | null;
  onRetry: () => void;
  captureLabel?: string;
}

export function TerminalCaptureStep({
  step,
  videoRef,
  onCapture,
  errorMessage,
  onRetry,
  captureLabel = "Registrar Ponto",
}: TerminalCaptureStepProps) {
  if (step === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-destructive font-medium">{errorMessage ?? "Ocorreu um erro."}</p>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (step === "starting") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Iniciando câmera...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full object-cover"
        />
        {(step === "capturing" || step === "submitting") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
            <p className="text-sm font-medium text-white">
              {step === "submitting" ? "Processando..." : "Capturando..."}
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={onCapture}
        disabled={step !== "camera_ready"}
        size="lg"
        className="gap-2 w-full max-w-xs"
      >
        <Camera className="h-5 w-5" />
        {captureLabel}
      </Button>
    </div>
  );
}
