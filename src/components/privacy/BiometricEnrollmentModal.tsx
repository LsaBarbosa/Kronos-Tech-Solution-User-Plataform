import { useState } from "react";
import { Loader2, Camera, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { enrollBiometric } from "@/service/employee.service";
import { useLivenessDetection } from "@/hooks/useLivenessDetection";

interface BiometricEnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasConsent: boolean;
  onEnrollmentSuccess?: () => void;
}

const BiometricEnrollmentModal = ({
  open,
  onOpenChange,
  hasConsent,
  onEnrollmentSuccess,
}: BiometricEnrollmentModalProps) => {
  const [faceImageFile, setFaceImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const { isDetecting, error: livenessError, performLivenessCheck } = useLivenessDetection();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        } else {
          reject(new Error("Falha ao converter imagem para Base64"));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaceImageFile(file);
      setLivenessPassed(false);

      // Perform liveness detection on the selected image
      try {
        const base64Image = await fileToBase64(file);
        const livenessResult = await performLivenessCheck(base64Image);
        setLivenessPassed(livenessResult);

        if (!livenessResult && !livenessError) {
          toast({
            title: "Verificação de liveness falhou",
            description: "Não foi possível detectar um rosto válido na imagem.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        setLivenessPassed(false);
        toast({
          title: "Erro ao processar imagem",
          description: error instanceof Error ? error.message : "Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEnroll = async () => {
    if (!hasConsent) {
      toast({
        title: "Consentimento não ativo",
        description: "É necessário aceitar o termo de consentimento biométrico primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!faceImageFile) {
      toast({
        title: "Arquivo não selecionado",
        description: "Selecione uma imagem de face para registrar.",
        variant: "destructive",
      });
      return;
    }

    if (!livenessPassed) {
      toast({
        title: "Verificação de liveness não passou",
        description: "A verificação de liveness é obrigatória. Tente com outra imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const base64Image = await fileToBase64(faceImageFile);

      await enrollBiometric({
        faceImageBase64: base64Image,
        livenessPassed: true,
      });

      toast({
        title: "Sucesso",
        description: "Biometria registrada com sucesso!",
      });

      setFaceImageFile(null);
      setLivenessPassed(false);
      onOpenChange(false);
      onEnrollmentSuccess?.();
    } catch (error) {
      console.error("Erro ao registrar biometria:", error);
      toast({
        title: "Erro ao registrar biometria",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Cadastrar Minha Biometria
          </DialogTitle>
          <DialogDescription>
            Registre sua biometria facial para usar os recursos de autenticação facial da plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!hasConsent && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                É necessário aceitar o termo de consentimento biométrico no Centro de Privacidade antes de registrar sua biometria.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="face-upload" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Selecionar Imagem
            </Label>
            <Input
              id="face-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={!hasConsent || isSubmitting || isDetecting}
              className="cursor-pointer"
            />
            {isDetecting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando liveness...
              </div>
            )}
            {faceImageFile && !isDetecting && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Arquivo selecionado: {faceImageFile.name}
                </p>
                {livenessPassed ? (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2 text-xs text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Verificação de liveness passou ✓
                  </div>
                ) : livenessError ? (
                  <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-2 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {livenessError}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Requisitos:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Imagem clara e bem iluminada</li>
              <li>Rosto totalmente visível</li>
              <li>Sem óculos de sol ou chapéu</li>
              <li>Tamanho máximo: 1.5MB</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isDetecting}>
            Cancelar
          </Button>
          <Button onClick={handleEnroll} disabled={!hasConsent || !faceImageFile || !livenessPassed || isSubmitting || isDetecting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Registrando...
              </>
            ) : (
              "Registrar Biometria"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiometricEnrollmentModal;
