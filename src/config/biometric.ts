export const isBiometricLivenessRequired = (): boolean =>
  String(import.meta.env.VITE_BIOMETRIC_LIVENESS_REQUIRED ?? "false").toLowerCase() === "true";
