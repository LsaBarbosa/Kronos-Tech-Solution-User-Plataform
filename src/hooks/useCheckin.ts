import { useContext } from 'react';
import { CheckinContext } from '@/context/CheckinContextDef';

export const useCheckin = () => {
  const context = useContext(CheckinContext);

  if (!context) {
    throw new Error('useCheckin deve ser usado dentro de CheckinProvider.');
  }

  return context;
};
