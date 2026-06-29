export interface TerminalCheckinPayload {
  faceImageBase64: string;
  livenessPassed?: boolean;
  latitude: number;
  longitude: number;
}

export interface TerminalCheckinResult {
  actionType: string;
  message: string;
}

export type TerminalStep =
  | 'idle'
  | 'starting'
  | 'camera_ready'
  | 'capturing'
  | 'submitting'
  | 'success'
  | 'error';
