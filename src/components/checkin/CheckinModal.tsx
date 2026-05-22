import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BiometricConsentGuard } from '@/components/BiometricConsentGuard';
import { useCheckin } from '@/context/CheckinContext';
import { CheckinLocationStep } from './CheckinLocationStep';
import { CheckinCameraStep } from './CheckinCameraStep';
import { CheckinConfirmationStep } from './CheckinConfirmationStep';
import { CheckinResult } from './CheckinResult';
import { CheckinErrorAlert } from './CheckinErrorAlert';

const CheckinModalContent = () => {
  const { state } = useCheckin();
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!state.isModalOpen && cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
  }, [state.isModalOpen]);

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

  const getTitle = () => {
    switch (state.status) {
      case 'idle':
      case 'requesting_location':
      case 'location_ready':
        return 'Localização';
      case 'requesting_camera':
      case 'camera_ready':
      case 'capturing_face':
        return 'Captura Facial';
      case 'ready_to_submit':
      case 'submitting':
        return 'Confirmação';
      case 'success':
        return 'Registro Realizado';
      case 'error':
        return 'Erro no Registro';
      default:
        return 'Registrar Ponto';
    }
  };

  return (
    <Dialog open={state.isModalOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderContent()}
        </div>
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
