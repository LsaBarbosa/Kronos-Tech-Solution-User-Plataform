import { useState, useRef, useCallback, useEffect } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { hardDeletePartner } from "@/service/partner-hard-delete.service";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { isBiometricLivenessRequired } from "@/config/biometric";
import { safeLogger } from "@/utils/security/safeLogger";

interface PartnerHardDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
}

const PartnerHardDeleteModal = ({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  onSuccess,
}: PartnerHardDeleteModalProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hasCapturedFrame, setHasCapturedFrame] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopWebcam = useCallback(() => {
    const el = videoRef.current;
    if (el?.srcObject) {
      (el.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      el.srcObject = null;
    }
    setIsStreamReady(false);
  }, []);

  const startWebcam = useCallback(async () => {
    if (imageSrc) return;
    stopWebcam();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (!videoRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        setIsStreamReady(true);
        videoRef.current?.play().catch((e) => safeLogger.error("Webcam play error:", e));
      };
    } catch {
      toast({ title: "Câmera indisponível", description: "Permita o acesso à câmera para continuar.", variant: "destructive" });
    }
  }, [imageSrc, stopWebcam]);

  useEffect(() => {
    if (open) { startWebcam(); }
    else { stopWebcam(); setImageSrc(null); setHasCapturedFrame(false); setPassword(""); }
    return () => { stopWebcam(); };
  }, [open, startWebcam, stopWebcam]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreamReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImageSrc(dataUrl);
    setHasCapturedFrame(true);
    stopWebcam();
  }, [isStreamReady, stopWebcam]);

  const handleRetake = useCallback(() => {
    setImageSrc(null);
    setHasCapturedFrame(false);
    startWebcam();
  }, [startWebcam]);

  const canSubmit = hasCapturedFrame && imageSrc && password.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !imageSrc) return;
    setIsSubmitting(true);
    try {
      const base64Data = imageSrc.split(",")[1];
      const livenessPassed = isBiometricLivenessRequired() ? true : undefined;
      await hardDeletePartner(employeeId, { faceImageBase64: base64Data, password: password.trim(), livenessPassed });
      toast({ title: "Colaborador excluído", description: `${employeeName} foi removido permanentemente.` });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const normalized = normalizeServiceError(err);
      toast({
        title: "Exclusão não autorizada",
        description: normalized.message ?? "Verifique as credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) onOpenChange(o); }}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden rounded-[24px]">
        {/* Header destrutivo */}
        <div className="bg-red-600 px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  Excluir colaborador definitivamente
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-sm text-red-100">
                  Esta ação é irreversível
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 p-6">
          {/* Aviso de dados */}
          <div className="rounded-[12px] border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-800">
                  Tudo associado a <span className="font-bold">{employeeName}</span> será apagado permanentemente:
                </p>
                <ul className="mt-1 space-y-0.5 text-xs text-red-700 list-disc list-inside">
                  <li>Cadastro e dados pessoais</li>
                  <li>Histórico de registros de ponto</li>
                  <li>Documentos e arquivos armazenados</li>
                  <li>Dados biométricos (S3 + Rekognition)</li>
                  <li>Conta de acesso ao sistema</li>
                  <li>Registros LGPD associados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Aviso de conformidade */}
          <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-3 flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              Para confirmar, <strong>capture seu rosto</strong> (verificação biométrica do manager) e informe sua <strong>senha</strong>. Ambas as confirmações são obrigatórias.
            </p>
          </div>

          {/* Captura facial */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Verificação facial — seu rosto</Label>
            <div className="relative overflow-hidden rounded-[14px] border border-slate-200 bg-slate-900 aspect-[4/3] flex items-center justify-center">
              {/* Oval guide */}
              {!imageSrc && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-[52%] h-[70%] rounded-full border-2 border-white/60 border-dashed" />
                </div>
              )}
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${imageSrc ? "hidden" : ""}`}
                playsInline
                muted
              />
              {imageSrc && (
                <img src={imageSrc} alt="Captura facial" className="h-full w-full object-cover" />
              )}
              <canvas ref={canvasRef} className="hidden" />
              {!isStreamReady && !imageSrc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                  <Camera className="h-10 w-10 animate-pulse" />
                  <span className="text-xs">Iniciando câmera...</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!hasCapturedFrame ? (
                <Button
                  type="button"
                  onClick={handleCapture}
                  disabled={!isStreamReady}
                  className="flex-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
                  size="sm"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capturar foto
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 flex-1 text-green-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="text-sm">Foto capturada</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetake}
                    className="rounded-full border-slate-300"
                  >
                    <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                    Refazer
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Campo senha */}
          <div className="space-y-2">
            <Label htmlFor="hd-password" className="text-sm font-medium text-slate-700">
              Sua senha de acesso
            </Label>
            <div className="relative">
              <Input
                id="hd-password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 rounded-[10px]"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 rounded-full border-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Excluindo...</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" />Excluir definitivamente</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerHardDeleteModal;
