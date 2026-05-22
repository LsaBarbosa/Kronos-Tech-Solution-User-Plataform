import { createContext } from 'react';
import type { CheckinContextValue } from '@/types/checkin.types';

export const CheckinContext = createContext<CheckinContextValue | undefined>(undefined);
