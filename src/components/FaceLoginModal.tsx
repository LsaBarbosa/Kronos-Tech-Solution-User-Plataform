import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, RefreshCcw, Loader2, ScanFace, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { loginWithFace } from "@/service/auth.Service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

interface FaceLoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FaceLoginModal = ({ isOpen, onOpenChange }: FaceLoginModalProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { checkSession } = useAuth();

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
        videoRef.current?.play().catch((e) => console.error("Erro ao reproduzir vídeo:", e));
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
        stopWebcam();
      } else {
        toast.error("Falha na captura. Tente novamente.");
      }
    }
  };

  const handleRetake = () => {
    setImageSrc(null);
    setIsCapturing(false);
    setTimeout(() => {
      startWebcam();
    }, 50);
  };

  const handleLoginAttempt = async () => {
    if (!imageSrc) return;

    setIsSubmitting(true);
    const base64Data = imageSrc.split(",")[1];

    try {
      // O payload de resposta é tratado como opcional/genérico; a sessão vem exclusivamente do cookie httpOnly.
      const loginPayload = await loginWithFace({ faceImageBase64: base64Data });
      const loginMetadata = loginPayload ?? null;
      void loginMetadata;

      toast.success("Identidade confirmada! Acessando plataforma...", {
        duration: 2000,
      });

      await checkSession();
      onOpenChange(false);
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (error) {
      toast.error(getServiceErrorMessage(error, "Rosto não reconhecido ou não cadastrado."));
      setImageSrc(null);
      setIsSubmitting(false);
      startWebcam();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-primary" />
            Acesso Biométrico
          </DialogTitle>
          <DialogDescription>Posicione seu rosto na câmera para realizar o login seguro.</DialogDescription>
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
                <img
                  src={imageSrc}
                  alt="Captured Face"
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              )}

              <canvas ref={canvasRef} className="hidden" />

              {!isCapturing && !imageSrc && <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />}
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {imageSrc ? (
                <div className="flex gap-2">
                  <Button onClick={handleRetake} variant="outline" disabled={isSubmitting} className="flex-1">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refazer Foto
                  </Button>
                  <Button onClick={handleLoginAttempt} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirmar
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button onClick={handleCapture} disabled={!isStreamReady || isSubmitting} className="w-full" variant="default">
                    <Camera className="h-4 w-4 mr-2" />
                    Capturar Rosto
                  </Button>

                  <Button onClick={handleRetake} variant="outline" disabled={isSubmitting} className="w-full">
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
