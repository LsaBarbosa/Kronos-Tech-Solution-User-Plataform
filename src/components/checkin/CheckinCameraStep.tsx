import { Camera, RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCheckin } from '@/context/CheckinContext';
import { captureFrameFromVideo, stopCameraStream } from '@/utils/camera.util';
import { useEffect, useRef, useState } from 'react';

interface CheckinCameraStepProps {
  cameraStreamRef: React.MutableRefObject<MediaStream | null>;
}

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
      <Card className="border-primary/20 bg-black">
        <CardContent className="pt-6">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-border">
            {isCameraReady && !imageSrc && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            )}

            {imageSrc && (
              <img src={imageSrc} alt="Foto capturada" className="w-full h-full object-cover" />
            )}

            <canvas ref={canvasRef} className="hidden" />

            {!isCameraReady && !imageSrc && (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2 text-sm text-muted-foreground text-center">
        <p>• Rosto centralizado na câmera</p>
        <p>• Boa iluminação (sem contraluz)</p>
        <p>• Sem cobrir o rosto</p>
      </div>

      <div className="flex gap-2">
        {imageSrc ? (
          <>
            <Button
              onClick={handleRetake}
              variant="outline"
              disabled={isCapturing}
              className="flex-1"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refazer Foto
            </Button>
            <Button
              onClick={() => {}}
              disabled
              className="flex-1"
            >
              {isCapturing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Pronto
                </>
              ) : (
                'Foto Pronta'
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCapture}
            disabled={!isCameraReady}
            className="w-full"
            size="lg"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capturar Rosto
          </Button>
        )}
      </div>
    </div>
  );
};
