import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RefreshCcw, Loader2, ScanFace, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    authenticateWithFace,
    executeFaceCheckinFlow,
    FaceCheckinRetryContext,
    retryFaceCheckinFlow,
} from "@/service/faceOrchestration.service";

interface FaceLoginModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "login" | "checkin";
    requireShortSession?: boolean;
}

const FaceLoginModal = ({
    isOpen,
    onOpenChange,
    mode = "login",
    requireShortSession = false,
}: FaceLoginModalProps) => {
    const navigate = useNavigate();
    const { bootstrapSession } = useAuth();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStreamReady, setIsStreamReady] = useState(false);
    const [retryContext, setRetryContext] = useState<FaceCheckinRetryContext | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stopWebcam = useCallback(() => {
        const videoElement = videoRef.current;
        const stream = videoElement?.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
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
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                setIsStreamReady(true);
                videoRef.current?.play().catch(e => console.error("Erro ao reproduzir vídeo:", e));
            };
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("Erro ao acessar a webcam:", error);
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
            setRetryContext(null);
            setIsSubmitting(false);
            setIsCapturing(false);
        }
    }, [isOpen, startWebcam, stopWebcam]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

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

            if (dataUrl.length > 100) {
                setImageSrc(dataUrl);
                setRetryContext(null);
                stopWebcam();
            } else {
                toast.error("Falha na captura. Tente novamente.");
            }
        }
    };

    const handleRetake = () => {
        setImageSrc(null);
        setRetryContext(null);
        setIsCapturing(false);
        setIsSubmitting(false);
        setIsRetryingCheckin(false);
        setPartialFailureMessage(null);
        setTimeout(() => {
            startWebcam();
        }, 50);
    };

    const getGeolocation = (): Promise<{ latitude: number; longitude: number }> =>
        new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocalização não é suportada neste dispositivo."));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                () => {
                    reject(new Error("Não foi possível obter a geolocalização para registrar o ponto."));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
            );
        });

    const handleLoginAttempt = async () => {
        if (!imageSrc) return;

        setIsSubmitting(true);
        const base64Data = imageSrc.split(",")[1];

        try {
            await registerPointWithFace(base64Data, { shouldLogoutAfterFlow });
            setPartialFailureMessage(null);
            
            toast.success("Ponto registrado com sucesso! Acessando plataforma...", {
                duration: 2000,
            });

            if (!flowResult.success) {
                if (flowResult.partialFailure && flowResult.retryContext) {
                    setRetryContext(flowResult.retryContext);
                    toast.error(flowResult.message || "Falha no registro do ponto após autenticação. Tente novamente.");
                    return;
                }

                throw new Error(flowResult.message || "Falha na autenticação facial.");
            }

            toast.success("Ponto registrado com sucesso!");
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Rosto não reconhecido ou não cadastrado.";
            if (message.includes("Identidade confirmada")) {
                setPartialFailureMessage(message);
                toast.error("Falha ao concluir registro de ponto.");
                return;
            }

            toast.error(message);
            setImageSrc(null);
            startWebcam();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetryCheckin = async () => {
        if (!retryContext) return;

        setIsSubmitting(true);
        const result = await retryFaceCheckinFlow(retryContext);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Ponto registrado com sucesso na nova tentativa!");
            onOpenChange(false);
            return;
        }

        toast.error(result.message || "Falha ao registrar o ponto na nova tentativa.");
    };

    const isCheckinMode = mode === "checkin";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ScanFace className="w-5 h-5 text-primary" />
                        {isCheckinMode ? "Registrar Ponto Facial" : "Acesso Biométrico"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCheckinMode
                            ? "Capture seu rosto para autenticar e registrar seu ponto com geolocalização."
                            : "Posicione seu rosto na câmera para realizar o login seguro."}
                    </DialogDescription>
                </DialogHeader>
                <Card className="border-2 border-primary/20 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-border">
                            {isCapturing && !imageSrc && (
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                    playsInline
                                    muted
                                />
                            )}

                            {imageSrc && (
                                <img src={imageSrc} alt="Captured Face" className="w-full h-full object-cover transform scale-x-[-1]" />
                            )}

                            <canvas ref={canvasRef} className="hidden" />

                            {!isCapturing && !imageSrc && (
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            )}
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            {retryContext && isCheckinMode && (
                                <div className="rounded-md border border-amber-500/40 bg-amber-50 p-3 text-xs text-amber-700">
                                    Login facial confirmado, mas o check-in falhou. Você pode tentar novamente sem recapturar o rosto.
                                </div>
                            )}

                            {imageSrc ? (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleRetake}
                                        variant="outline"
                                        disabled={isSubmitting || isRetryingCheckin}
                                        className="flex-1"
                                    >
                                        <RefreshCcw className="h-4 w-4 mr-2" />
                                        Refazer Foto
                                    </Button>
                                    {retryContext && isCheckinMode ? (
                                        <Button onClick={handleRetryCheckin} disabled={isSubmitting} className="flex-1">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Tentando...
                                                </>
                                            ) : (
                                                <>
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    Tentar check-in
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleLoginAttempt}
                                            disabled={isSubmitting}
                                            className="flex-1"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    {isCheckinMode ? "Registrando..." : "Validando..."}
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    {isCheckinMode ? "Confirmar registro" : "Confirmar"}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={handleCapture}
                                        disabled={!isStreamReady || isSubmitting}
                                        className="w-full"
                                        variant="default"
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        Capturar Rosto
                                    </Button>

                                    <Button
                                        onClick={handleRetake}
                                        variant="outline"
                                        disabled={isSubmitting}
                                        className="w-full"
                                    >
                                        <RefreshCcw className="h-4 w-4 mr-2" />
                                        Reiniciar Câmera
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default FaceLoginModal;
