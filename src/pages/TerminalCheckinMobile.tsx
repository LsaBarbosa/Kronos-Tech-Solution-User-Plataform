import { Camera, Loader2, RefreshCcw } from "lucide-react";
import { useTerminalCheckin } from "@/features/terminal/hooks/useTerminalCheckin";
import { TerminalResultStep } from "@/features/terminal/components/TerminalResultStep";

export default function TerminalCheckinMobile() {
  const { step, errorMessage, result, countdown, videoRef, capture, retry } =
    useTerminalCheckin();

  const isLoading = step === "starting";
  const showResult = step === "success";
  const showError = step === "error";
  const isCapturing = step === "capturing" || step === "submitting";

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-950 text-white">
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-center bg-gray-900/90 px-4 py-3 backdrop-blur-sm">
        <span className="text-lg font-bold tracking-tight">
          Kronos <span className="font-light opacity-70">Terminal de Ponto</span>
        </span>
      </div>

      {/* Camera — takes all remaining height */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-white/60" />
            <p className="text-sm text-white/60">Iniciando câmera...</p>
          </div>
        )}

        {!isLoading && !showError && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {isCapturing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
            <Loader2 className="h-14 w-14 animate-spin text-white" />
            <p className="text-base font-semibold text-white">
              {step === "submitting" ? "Verificando identidade..." : "Capturando..."}
            </p>
          </div>
        )}

        {/* Full-screen success overlay on mobile */}
        {showResult && result && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/95">
            <TerminalResultStep result={result} countdown={countdown} />
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="flex shrink-0 flex-col items-center justify-center gap-2 bg-gray-900 px-6 py-5">
        {showError ? (
          <>
            <p className="text-center text-sm text-red-400">
              {errorMessage ?? "Ocorreu um erro."}
            </p>
            <button
              onClick={retry}
              className="mt-1 flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Tentar novamente
            </button>
          </>
        ) : showResult ? (
          <p className="text-xs text-white/40">Aguarde o encerramento automático da sessão</p>
        ) : (
          <>
            <p className="text-xs text-white/50">
              Posicione seu rosto e pressione o botão
            </p>
            <button
              onClick={capture}
              disabled={step !== "camera_ready"}
              aria-label="Registrar ponto"
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/10 transition-all active:scale-95 hover:bg-white/20 disabled:opacity-30"
            >
              <Camera className="h-7 w-7" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
