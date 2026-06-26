export type CheckinStatus =
  | 'idle'
  | 'requesting_location'
  | 'location_ready'
  | 'requesting_camera'
  | 'camera_ready'
  | 'capturing_face'
  | 'ready_to_submit'
  | 'submitting'
  | 'success'
  | 'error';

export type CheckinErrorCode =
  | 'LOCATION_PERMISSION_DENIED'
  | 'LOCATION_UNAVAILABLE'
  | 'LOCATION_TIMEOUT'
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_UNAVAILABLE'
  | 'FACE_CAPTURE_FAILED'
  | 'INVALID_IMAGE'
  | 'SESSION_EXPIRED'
  | 'FACE_NOT_RECOGNIZED'
  | 'FACE_MISMATCH'
  | 'OUT_OF_ALLOWED_RADIUS'
  | 'CLOCK_NOT_SYNCHRONIZED'
  | 'TERMS_NOT_ACCEPTED'
  | 'INCOMPATIBLE_RECORD_STATUS'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface CheckinRequest {
  latitude: number;
  longitude: number;
  faceImageBase64: string;
}

export interface CheckinResult {
  actionType: string;
  message: string;
  raw: unknown;
}

export interface TerminalCheckinRequest {
  faceImageBase64: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  livenessPassed?: boolean;
}

export interface TerminalCheckinResponse {
  loginMessage: string;
  recordMessage: string;
  actionType: string;
  autoLogoutAfterSeconds: number;
  recordedAt: string | null;
}

export type TerminalCheckinFlowStatus =
  | 'start'
  | 'collecting'
  | 'submitting'
  | 'success'
  | 'error'
  | 'exiting';

export interface CheckinError {
  code: CheckinErrorCode;
  message: string;
  details?: unknown;
}

export interface CheckinCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface CheckinState {
  status: CheckinStatus;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  faceImageBase64: string | null;
  result: CheckinResult | null;
  error: CheckinError | null;
  isModalOpen: boolean;
  isSubmitting: boolean;
  lastAttemptAt: string | null;
}

export interface CheckinContextValue {
  state: CheckinState;
  openCheckin: () => void;
  closeCheckin: () => void;
  requestLocation: () => Promise<void>;
  requestCamera: () => Promise<void>;
  captureFace: (imageBase64: string) => void;
  submitCheckin: () => Promise<void>;
  resetCheckin: () => void;
  clearError: () => void;
  retry: () => Promise<void>;
}
