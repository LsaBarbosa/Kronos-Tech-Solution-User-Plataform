import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, CheckCircle2, LogOut, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  submitCheckinFace,
  type CheckinTerminalResponse,
} from "@/service/checkin-terminal.service";
import { cn } from "@/lib/utils";

interface CoordinatesPayload {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

type TerminalStep = "idle" | "camera" | "processing" | "success" | "error";

const SUCCESS_RESET_FALLBACK_SECONDS = 10;
const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: "user",
  },
  audio: false,
};

const stripDataUrlPrefix = (value: string) => value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");

const getUserMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const requestCurrentPosition = (): Promise<CoordinatesPayload> => {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Geolocalizacao indisponivel neste dispositivo."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        });
      },
      (error) => {
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: "Permissao de localizacao negada.",
          [error.POSITION_UNAVAILABLE]: "Localizacao indisponivel no momento.",
          [error.TIMEOUT]: "Tempo esgotado ao capturar localizacao.",
        };

        reject(new Error(messages[error.code] ?? "Nao foi possivel capturar a localizacao."));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  });
};

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const CheckinTerminal = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);

  const [step, setStep] = useState<TerminalStep>("idle");
  const [statusText, setStatusText] = useState("Pronto para registrar o ponto.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CheckinTerminalResponse | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const resetTerminal = useCallback(() => {
    clearResetTimer();
    isSubmittingRef.current = false;
    stopStream(streamRef.current);
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStep("idle");
    setStatusText("Pronto para registrar o ponto.");
    setErrorMessage(null);
    setResult(null);
  }, [clearResetTimer]);

  useEffect(() => resetTerminal, [resetTerminal]);

  const attachStream = useCallback(async (stream: MediaStream) => {
    streamRef.current = stream;

    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject = stream;
    await videoRef.current.play().catch(() => undefined);
  }, []);

  const startCamera = useCallback(async () => {
    clearResetTimer();
    isSubmittingRef.current = false;
    setErrorMessage(null);
    setResult(null);
    setStep("camera");
    setStatusText("Abrindo camera...");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera indisponivel neste dispositivo.");
      }

      stopStream(streamRef.current);
      streamRef.current = null;
      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      await attachStream(stream);
      setStatusText("Centralize o rosto e tire a foto.");
    } catch (error) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setStep("error");
      setStatusText("Nao foi possivel abrir a camera.");
      setErrorMessage(getUserMessage(error, "Verifique a permissao da camera e tente novamente."));
    }
  }, [attachStream, clearResetTimer]);

  const captureFaceImage = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      throw new Error("Camera ainda nao esta pronta.");
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Nao foi possivel preparar a imagem da camera.");
    }

    context.drawImage(video, 0, 0, width, height);
    return stripDataUrlPrefix(canvas.toDataURL("image/jpeg", 0.9));
  }, []);

  const scheduleSuccessReset = useCallback((response: CheckinTerminalResponse) => {
    const seconds = response.autoLogoutAfterSeconds ?? SUCCESS_RESET_FALLBACK_SECONDS;
    resetTimerRef.current = window.setTimeout(resetTerminal, Math.max(1, seconds) * 1000);
  }, [resetTerminal]);

  const submitCurrentFrame = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setStep("processing");
    setStatusText("Validando biometria e localizacao...");
    setErrorMessage(null);

    try {
      const faceImageBase64 = captureFaceImage();
      const coordinates = await requestCurrentPosition();
      const response = await submitCheckinFace({
        faceImageBase64,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy ?? null,
        livenessPassed: true,
      });

      stopStream(streamRef.current);
      streamRef.current = null;
      setResult(response);
      setStep("success");
      setStatusText("Registro concluido.");
      scheduleSuccessReset(response);
    } catch (error) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setStep("error");
      setStatusText("Nao foi possivel registrar o ponto.");
      setErrorMessage(getUserMessage(error, "Revise permissoes de camera/localizacao e tente novamente."));
    } finally {
      isSubmittingRef.current = false;
    }
  }, [captureFaceImage, scheduleSuccessReset]);

  const actionLabel = useMemo(() => {
    if (!result?.actionType) {
      return null;
    }

    return result.actionType === "CHECKOUT" ? "Saida registrada" : "Entrada registrada";
  }, [result?.actionType]);

  const isCameraActive = step === "camera" || step === "processing";

  return (
    <main className="min-h-screen bg-[#EAF2F8] text-[#102A43]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.15fr)_380px] lg:px-8">
        <div className="order-2 lg:order-1">
          <Card className="overflow-hidden border-[#BCCCDC] bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="relative aspect-[3/4] bg-[#102A43] sm:aspect-video lg:aspect-[4/3]">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                    aria-label="Preview da camera"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
                    {step === "success" ? (
                      <CheckCircle2 className="h-16 w-16 text-[#38BDF8]" aria-hidden="true" />
                    ) : (
                      <Camera className="h-16 w-16 text-[#A5F3FC]" aria-hidden="true" />
                    )}
                    <p className="max-w-sm text-sm leading-6 text-white/80">
                      O preview da camera aparece aqui durante o registro.
                    </p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            </CardContent>
          </Card>
        </div>

        <div className="order-1 space-y-4 lg:order-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#486581]">Terminal Check-in</p>
            <h1 className="text-3xl font-bold leading-tight text-[#102A43] sm:text-4xl">Registro de ponto</h1>
            <p className="text-sm leading-6 text-[#486581]">
              Registre entrada ou saida com uma unica foto e localizacao do dispositivo.
            </p>
          </div>

          <Card className="border-[#BCCCDC] bg-white shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start gap-3 rounded-lg border border-[#D9E2EC] bg-[#F8FAFC] p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-[#0F4C81]" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-[#102A43]">Status</p>
                  <p className="text-sm leading-6 text-[#486581]">{statusText}</p>
                </div>
              </div>

              {step === "success" && result ? (
                <Alert className="border-[#0EA5E9]/40 bg-[#EFF6FF] text-[#102A43]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>Registro realizado</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>{result.loginMessage ?? "Identificacao realizada com sucesso."}</p>
                      <p>{result.recordMessage ?? "Registro de ponto realizado com sucesso."}</p>
                      {actionLabel ? <p>{actionLabel}</p> : null}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              {step === "error" && errorMessage ? (
                <Alert variant="destructive">
                  <AlertTitle>Falha no registro</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className={cn("grid gap-3", step === "idle" ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
                {step === "idle" ? (
                  <Button className="h-14 text-base" onClick={startCamera}>
                    <Camera className="h-5 w-5" aria-hidden="true" />
                    Registrar entrada
                  </Button>
                ) : null}

                {step === "camera" ? (
                  <>
                    <Button className="h-12" onClick={submitCurrentFrame} disabled={isSubmittingRef.current}>
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      {isSubmittingRef.current ? "Processando..." : "Tirar foto"}
                    </Button>
                    <Button className="h-12" variant="outline" onClick={startCamera}>
                      <RefreshCw className="h-5 w-5" aria-hidden="true" />
                      Reiniciar camera
                    </Button>
                  </>
                ) : null}

                {step === "processing" ? (
                  <Button className="h-12 sm:col-span-2" disabled>
                    Processando...
                  </Button>
                ) : null}

                {step === "success" || step === "error" ? (
                  <Button className="h-12" variant="outline" onClick={resetTerminal}>
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    Sair
                  </Button>
                ) : null}
              </div>

              <p className="text-xs leading-5 text-[#627D98]">
                A foto e a localizacao sao enviadas somente uma vez para concluir o registro.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default CheckinTerminal;
