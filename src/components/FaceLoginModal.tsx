import { useState, useRef, useCallback, useEffect } from "react";
import {
    Camera,
    CheckCircle2,
    Loader2,
    RefreshCcw,
    RotateCw,
    ScanFace,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { loginWithFace } from "@/service/auth.service";
import { useAuth } from "@/context/AuthContext";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { isBiometricLivenessRequired } from "@/config/biometric";
import { safeLogger } from "@/utils/security/safeLogger";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";

interface FaceLoginModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const TIPS = [
    "Mantenha o rosto centralizado dentro do guia oval",
    "Use boa iluminação, sem contraluz",
    "Evite cobrir o rosto com máscara ou óculos escuros",
];

const FaceLoginModal = ({ isOpen, onOpenChange }: FaceLoginModalProps) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [hasCapturedFrame, setHasCapturedFrame] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStreamReady, setIsStreamReady] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { login } = useAuth();
    const { redirectAfterLogin } = usePostLoginRedirect();

    const isValidCapturedImage = useCallback((capturedDataUrl: string | null) => {
        return Boolean(capturedDataUrl?.startsWith("data:image/") && capturedDataUrl.length > 100);
    }, []);

    const validateLiveness = useCallback(() => {
        return isValidCapturedImage(imageSrc) && hasCapturedFrame && !isStreamReady;
    }, [hasCapturedFrame, imageSrc, isStreamReady, isValidCapturedImage]);

    const stopWebcam = useCallback(() => {
        const videoElement = videoRef.current;
        const stream = videoElement?.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        if (videoElement) {
            videoElement.srcObject = null;
        }
        setIsStreamReady(false);
    }, []);

    const startWebcam = useCallback(async () => {
        if (imageSrc) return;

        stopWebcam();
        setIsCapturing(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 400 },
                    height: { ideal: 300 },
                },
            });

            if (!videoRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                setIsStreamReady(true);
                videoRef.current?.play().catch((e) => safeLogger.error("Erro ao reproduzir vídeo:", e));
            };
        } catch (error: unknown) {
            const errorName = error instanceof DOMException || error instanceof Error ? error.name : "";
            if (errorName !== "AbortError") {
                safeLogger.error("Erro ao acessar a webcam:", error);
                toast.error("Erro ao acessar a webcam. Verifique as permissões.");
            }
            setIsCapturing(false);
        }
    }, [imageSrc, stopWebcam]);

    useEffect(() => {
        if (isOpen) {
            startWebcam();
        } else {
            stopWebcam();
            setImageSrc(null);
            setHasCapturedFrame(false);
            setIsSubmitting(false);
            setIsCapturing(false);
        }
    }, [isOpen, startWebcam, stopWebcam]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current || !isStreamReady) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const width = video.videoWidth > 0 ? video.videoWidth : 400;
        const height = video.videoHeight > 0 ? video.videoHeight : 300;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

            if (isValidCapturedImage(dataUrl)) {
                setHasCapturedFrame(true);
                setImageSrc(dataUrl);
                stopWebcam();
            } else {
                setHasCapturedFrame(false);
                toast.error("Falha na captura. Tente novamente.");
            }
        }
    };

    const handleRetake = () => {
        setImageSrc(null);
        setHasCapturedFrame(false);
        setIsCapturing(false);
        setTimeout(() => {
            startWebcam();
        }, 50);
    };

    const handleRestartCamera = () => {
        stopWebcam();
        setTimeout(() => {
            startWebcam();
        }, 50);
    };

    const handleLoginAttempt = async () => {
        if (!imageSrc) return;
        const shouldRequireLiveness = isBiometricLivenessRequired();
        const livenessPassed = shouldRequireLiveness ? validateLiveness() : false;

        if (shouldRequireLiveness && !livenessPassed) {
            toast.error("Validação biométrica incompleta. Capture o rosto novamente.");
            return;
        }

        setIsSubmitting(true);
        const base64Data = imageSrc.split(",")[1];

        try {
            await loginWithFace({
                faceImageBase64: base64Data,
                livenessPassed,
            });
            await login();

            toast.success("Identidade confirmada! Acessando plataforma...", {
                duration: 2000,
            });
            stopWebcam();
            onOpenChange(false);
            await redirectAfterLogin();
        } catch (error: unknown) {
            toast.error(
                getServiceErrorMessage(error, "Rosto não reconhecido ou não cadastrado.")
            );
            setImageSrc(null);
            setIsSubmitting(false);
            startWebcam(); // Reinicia câmera automaticamente em caso de erro
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (open) return;
        if (isSubmitting) return;
        stopWebcam();
        onOpenChange(false);
    };

    const headerEyebrow = imageSrc
        ? "Etapa 2 de 2 · Validação"
        : "Etapa 1 de 2 · Captura";
    const headerTitle = imageSrc ? "Confirmar identidade" : "Acesso biométrico";
    const headerDescription = imageSrc
        ? "Revise o enquadramento e confirme para validar com o servidor."
        : "Posicione seu rosto na câmera para entrar com biometria facial.";

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[480px] gap-0 rounded-2xl border border-[#E2E8F0] bg-white p-0 shadow-[0_18px_50px_rgba(11,18,32,0.18)] sm:max-w-[520px]">
                <DialogHeader className="space-y-3 border-b border-[#E2E8F0] bg-[#F8FAFC] p-6">
                    <div className="flex items-start gap-3">
                        <span
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#5B21B6]"
                        >
                            <ScanFace className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                                {headerEyebrow}
                            </p>
                            <DialogTitle className="text-lg font-semibold text-[#0F172A]">
                                {headerTitle}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#64748B]">
                                {headerDescription}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 p-6">
                    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0F172A] shadow-[0_10px_30px_rgba(11,18,32,0.18)]">
                        <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-[#0F172A]">
                            {isCapturing && !imageSrc ? (
                                <video
                                    ref={videoRef}
                                    className="h-full w-full -scale-x-100 object-cover"
                                    playsInline
                                    muted
                                />
                            ) : null}

                            {imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt="Rosto capturado para validação"
                                    className="h-full w-full -scale-x-100 object-cover"
                                />
                            ) : null}

                            <canvas ref={canvasRef} className="hidden" />

                            {!isCapturing && !imageSrc ? (
                                <div className="flex flex-col items-center gap-2 text-white/70">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                    <p className="text-xs uppercase tracking-[0.18em]">
                                        Iniciando câmera...
                                    </p>
                                </div>
                            ) : null}

                            {isCapturing && isStreamReady && !imageSrc ? (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="h-3/4 w-2/3 rounded-[40%] border-2 border-dashed border-white/40" />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {imageSrc ? (
                        <Card className="border border-[#DDD6FE] bg-[#EDE9FE] p-3">
                            <div className="flex items-start gap-2">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5B21B6]" />
                                <p className="text-xs leading-5 text-[#5B21B6]">
                                    A imagem capturada será enviada apenas para validação biométrica e
                                    descartada após a autenticação.
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                                Boas práticas
                            </p>
                            <ul className="space-y-1.5 text-xs leading-5 text-[#334155]">
                                {TIPS.map((tip) => (
                                    <li key={tip} className="flex items-start gap-2">
                                        <span
                                            aria-hidden="true"
                                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]"
                                        />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {imageSrc ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                onClick={handleRetake}
                                variant="outline"
                                disabled={isSubmitting}
                                className="h-11 flex-1 gap-2 rounded-2xl border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9]"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Refazer foto
                            </Button>
                            <Button
                                type="button"
                                onClick={handleLoginAttempt}
                                disabled={isSubmitting}
                                className="h-11 flex-1 gap-2 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Validando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Confirmar identidade
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full flex-col gap-2">
                            <Button
                                type="button"
                                onClick={handleRestartCamera}
                                disabled={isSubmitting || (!isStreamReady && isCapturing)}
                                variant="outline"
                                className="h-11 w-full gap-2 rounded-2xl border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-70"
                            >
                                <RotateCw className="h-4 w-4" />
                                Reinicializar câmera
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCapture}
                                disabled={!isStreamReady || isSubmitting}
                                size="lg"
                                className="h-12 w-full gap-2 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] disabled:opacity-70"
                            >
                                <Camera className="h-4 w-4" />
                                Capturar rosto
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FaceLoginModal;
