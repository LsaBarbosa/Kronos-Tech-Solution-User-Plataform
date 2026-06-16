import { Camera, CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckin } from '@/hooks/useCheckin';
import { captureFrameFromVideo, stopCameraStream } from '@/utils/camera.util';
import { useEffect, useRef, useState } from 'react';

interface CheckinCameraStepProps {
  cameraStreamRef: React.MutableRefObject<MediaStream | null>;
}

const TIPS = [
  'Mantenha o rosto centralizado na câmera',
  'Use boa iluminação, sem contraluz',
  'Evite cobrir o rosto com máscara ou óculos escuros',
];

export const CheckinCameraStep = ({ cameraStreamRef }: CheckinCameraStepProps) => {
  const { state, captureFace, requestCamera } = useCheckin();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === 'requesting_camera' && !imageSrc) {
      requestCamera()
        .then((stream) => {
          cameraStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((e) => console.error('Erro ao reproduzir vídeo:', e));
          }
        })
        .catch(() => {
          // Error is handled by context
        });
    }

    return () => {
      if (!imageSrc && cameraStreamRef.current && state.status !== 'capturing_face') {
        stopCameraStream(cameraStreamRef.current);
        cameraStreamRef.current = null;
      }
    };
  }, [state.status, imageSrc, requestCamera, cameraStreamRef]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const dataUrl = captureFrameFromVideo(videoRef.current);
      setImageSrc(dataUrl);

      if (cameraStreamRef.current) {
        stopCameraStream(cameraStreamRef.current);
      }

      captureFace(dataUrl);
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
    }
  };

  const handleRetake = () => {
    setImageSrc(null);
    requestCamera()
      .then((stream) => {
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.error('Erro ao reproduzir vídeo:', e));
        }
      })
      .catch(() => {
        // Error is handled by context
      });
  };

  const isCameraReady = state.status === 'camera_ready';
  const isCapturing = state.status === 'capturing_face';

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0F172A] shadow-[0_10px_30px_rgba(11,18,32,0.18)]">
        <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-[#0F172A]">
          {isCameraReady && !imageSrc ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
          ) : null}

          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Foto capturada para validação"
              className="h-full w-full object-cover"
            />
          ) : null}

          <canvas ref={canvasRef} className="hidden" />

          {!isCameraReady && !imageSrc ? (
            <div className="flex flex-col items-center gap-2 text-white/70">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-xs uppercase tracking-[0.18em]">Iniciando câmera...</p>
            </div>
          ) : null}

          {/* Face frame overlay */}
          {isCameraReady && !imageSrc ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-3/4 w-2/3 rounded-[40%] border-2 border-dashed border-white/40" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
          Boas práticas
        </p>
        <ul className="space-y-1.5 text-xs leading-5 text-[#334155]">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        {imageSrc ? (
          <>
            <Button
              onClick={handleRetake}
              variant="outline"
              disabled={isCapturing}
              className="h-11 flex-1 gap-2 rounded-2xl border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9]"
            >
              <RefreshCcw className="h-4 w-4" />
              Refazer foto
            </Button>
            <Button
              onClick={() => {}}
              disabled
              className="h-11 flex-1 gap-2 rounded-2xl bg-[#16A34A] text-sm font-semibold text-white disabled:opacity-90"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Foto pronta
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCapture}
            disabled={!isCameraReady}
            size="lg"
            className="h-12 w-full gap-2 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] disabled:opacity-70"
          >
            <Camera className="h-4 w-4" />
            Capturar rosto
          </Button>
        )}
      </div>
    </div>
  );
};
