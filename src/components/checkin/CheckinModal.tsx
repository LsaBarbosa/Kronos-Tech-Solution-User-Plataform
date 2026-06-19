import { useEffect, useRef } from 'react';
import { AlertOctagon, Camera, CheckCircle2, FileCheck2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BiometricConsentGuard } from '@/components/BiometricConsentGuard';
import { useCheckin } from '@/hooks/useCheckin';
import { CheckinLocationStep } from './CheckinLocationStep';
import { CheckinCameraStep } from './CheckinCameraStep';
import { CheckinConfirmationStep } from './CheckinConfirmationStep';
import { CheckinResult } from './CheckinResult';
import { CheckinErrorAlert } from './CheckinErrorAlert';
import { CheckinStepIndicator, type CheckinStep } from './CheckinStepIndicator';

const getCurrentStep = (status: string): CheckinStep => {
  switch (status) {
    case 'idle':
    case 'requesting_location':
    case 'location_ready':
      return 'location';
    case 'requesting_camera':
    case 'camera_ready':
    case 'capturing_face':
      return 'camera';
    case 'ready_to_submit':
    case 'submitting':
      return 'confirm';
    case 'success':
      return 'result';
    case 'error':
      return 'error';
    default:
      return 'location';
  }
};

const STEP_META: Record<
  CheckinStep,
  { eyebrow: string; title: string; description: string; Icon: typeof MapPin; iconTone: string }
> = {
  location: {
    eyebrow: 'Etapa 1 de 3',
    title: 'Confirmar localização',
    description: 'Validamos que você está dentro do raio permitido para o registro.',
    Icon: MapPin,
    iconTone: 'bg-[#EFF6FF] text-[#1D4ED8]',
  },
  camera: {
    eyebrow: 'Etapa 2 de 3',
    title: 'Captura facial',
    description: 'Centralize o rosto e mantenha boa iluminação para validar a marcação.',
    Icon: Camera,
    iconTone: 'bg-[#EDE9FE] text-[#5B21B6]',
  },
  confirm: {
    eyebrow: 'Etapa 3 de 3',
    title: 'Confirmar registro',
    description: 'Revise os dados antes de enviar para validação.',
    Icon: FileCheck2,
    iconTone: 'bg-[#FEF3C7] text-[#92400E]',
  },
  result: {
    eyebrow: 'Concluído',
    title: 'Registro realizado',
    description: 'Sua marcação foi enviada com sucesso e validada pelo servidor.',
    Icon: CheckCircle2,
    iconTone: 'bg-[#DCFCE7] text-[#15803D]',
  },
  error: {
    eyebrow: 'Atenção',
    title: 'Não foi possível registrar',
    description: 'Revise as permissões e tente novamente.',
    Icon: AlertOctagon,
    iconTone: 'bg-[#FEE2E2] text-[#B91C1C]',
  },
};

const CheckinModalContent = () => {
  const { state, closeCheckin } = useCheckin();
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!state.isModalOpen && cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  }, [state.isModalOpen]);

  const isSubmitting = state.status === 'submitting';

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (isSubmitting) return;
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    closeCheckin();
  };

  const step = getCurrentStep(state.status);
  const meta = STEP_META[step];
  const StepIcon = meta.Icon;

  const renderContent = () => {
    if (state.error && state.status === 'error') {
      return <CheckinErrorAlert />;
    }

    if (state.status === 'success' && state.result) {
      return <CheckinResult />;
    }

    switch (state.status) {
      case 'idle':
      case 'requesting_location':
      case 'location_ready':
        return <CheckinLocationStep />;

      case 'requesting_camera':
      case 'camera_ready':
      case 'capturing_face':
        return <CheckinCameraStep cameraStreamRef={cameraStreamRef} />;

      case 'ready_to_submit':
      case 'submitting':
        return <CheckinConfirmationStep />;

      default:
        return null;
    }
  };

  const showStepIndicator = step !== 'result' && step !== 'error';

  return (
    <Dialog open={state.isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="grid max-h-[calc(100vh-1.5rem)] w-[calc(100vw-1rem)] max-w-[480px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-0 shadow-[0_18px_50px_rgba(11,18,32,0.18)] sm:max-h-[calc(100vh-3rem)] sm:w-full sm:max-w-[520px]">
        <DialogHeader className="space-y-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-4 sm:px-4 sm:py-5 md:p-6">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${meta.iconTone} sm:h-10 sm:w-10`}
            >
              <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B] sm:text-[11px] sm:tracking-[0.18em]">
                {meta.eyebrow}
              </p>
              <DialogTitle className="text-base font-semibold leading-snug text-[#0F172A] sm:text-lg">
                {meta.title}
              </DialogTitle>
              <DialogDescription className="text-xs leading-5 text-[#64748B] sm:text-sm">
                {meta.description}
              </DialogDescription>
            </div>
          </div>

          {showStepIndicator ? <CheckinStepIndicator current={step} /> : null}
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 md:p-6">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
};

export const CheckinModal = () => {
  const { state, closeCheckin } = useCheckin();

  if (!state.isModalOpen) {
    return null;
  }

  return (
    <BiometricConsentGuard onCancel={closeCheckin}>
      <CheckinModalContent />
    </BiometricConsentGuard>
  );
};
