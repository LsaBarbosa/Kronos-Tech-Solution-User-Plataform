import { Camera, Loader2, RefreshCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTerminalCheckin } from "@/features/terminal/hooks/useTerminalCheckin";
import { TerminalResultStep } from "@/features/terminal/components/TerminalResultStep";

export default function TerminalCheckinDesktop() {
  const { step, errorMessage, result, countdown, videoRef, capture, retry } =
    useTerminalCheckin();

  const showResult = step === "success";
  const showError = step === "error";
  const isLoading = step === "starting";
  const isCapturing = step === "capturing" || step === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[480px] shadow-lg">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-xl">Terminal de Ponto</CardTitle>
          <CardDescription>
            Posicione seu rosto no guia oval e registre sua marcação
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-5">
          {showResult && result ? (
            <TerminalResultStep result={result} countdown={countdown} />
          ) : showError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-destructive">{errorMessage ?? "Ocorreu um erro."}</p>
              <Button variant="outline" onClick={retry} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Camera container with oval guide overlay */}
              <div
                className="relative w-full overflow-hidden rounded-2xl bg-black"
                style={{ height: 320 }}
              >
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-white/60" />
                    <p className="text-sm text-white/60">Iniciando câmera...</p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                )}

                {/* Oval face guide */}
                {!isLoading && (
                  <div
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                      borderRadius: "50%",
                      margin: "20px 60px",
                    }}
                  />
                )}

                {isCapturing && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                    <p className="text-sm font-medium text-white">
                      {step === "submitting" ? "Verificando identidade..." : "Capturando..."}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={capture}
                disabled={step !== "camera_ready"}
                size="lg"
                className="w-full gap-2"
              >
                <Camera className="h-5 w-5" />
                Registrar Ponto
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
