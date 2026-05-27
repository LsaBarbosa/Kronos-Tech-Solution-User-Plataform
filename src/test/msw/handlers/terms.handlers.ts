import { HttpResponse, http } from "msw";

export const termsHandlers = [
  http.get("*/terms/status", () => HttpResponse.json({
    biometricConsentAccepted: true,
    acceptedVersion: "v2026-05-01",
    acceptedHash: "abc123...",
    currentVersion: "v2026-05-01",
    currentHash: "abc123...",
    requiresNewAcceptance: false,
  })),
  http.post("*/terms/accept-biometric", () => HttpResponse.json({
    biometricConsentAccepted: true,
    acceptedVersion: "v2026-05-01",
    acceptedHash: "abc123...",
    currentVersion: "v2026-05-01",
    currentHash: "abc123...",
    requiresNewAcceptance: false,
  }, { status: 200 })),
  http.delete("*/terms/revoke-biometric", () => HttpResponse.json({
    biometricConsentAccepted: false,
    acceptedVersion: null,
    acceptedHash: null,
    currentVersion: "v2026-05-01",
    currentHash: "abc123...",
    requiresNewAcceptance: true,
  }, { status: 200 })),
];
