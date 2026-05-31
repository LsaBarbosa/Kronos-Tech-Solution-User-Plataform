import { describe, expect, it, vi, afterEach } from "vitest";
import { isBiometricLivenessRequired } from "./biometric";

describe("biometric config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults biometric liveness requirement to false", () => {
    expect(isBiometricLivenessRequired()).toBe(false);
  });

  it("reads VITE_BIOMETRIC_LIVENESS_REQUIRED=true", () => {
    vi.stubEnv("VITE_BIOMETRIC_LIVENESS_REQUIRED", "true");

    expect(isBiometricLivenessRequired()).toBe(true);
  });
});
