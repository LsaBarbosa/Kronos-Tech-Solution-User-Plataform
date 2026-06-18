import { observabilityConfig, isObservabilityEnabled } from "./observability.config";
import { getOrCreateCorrelationId } from "./correlation-id";
import { buildErrorEventPayload, buildEventPayload } from "./observability.sanitizer";
import type { FrontendObservabilityEventPayload, ObservabilityErrorContext } from "./types";

const getCurrentRoute = () =>
  typeof window === "undefined"
    ? "/"
    : `${window.location.pathname}${window.location.search}${window.location.hash}`.slice(0, 160);

const sendPayload = (payload: FrontendObservabilityEventPayload) => {
  if (!isObservabilityEnabled()) {
    return;
  }

  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(observabilityConfig.endpoint, blob);
    return;
  }

  if (typeof fetch !== "function") {
    return;
  }

  void fetch(observabilityConfig.endpoint, {
    method: "POST",
    body,
    keepalive: true,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Correlation-ID": payload.correlationId,
    },
  });
};

export const captureError = (error: unknown, context: ObservabilityErrorContext = {}) => {
  const correlationId = getOrCreateCorrelationId();
  sendPayload(
    buildErrorEventPayload(
      error,
      context,
      correlationId,
      getCurrentRoute(),
      observabilityConfig.source
    )
  );
};

export const sendObservabilityEvent = (
  payload: Partial<FrontendObservabilityEventPayload>,
  correlationId = getOrCreateCorrelationId()
) => {
  sendPayload(
    buildEventPayload(payload, correlationId, getCurrentRoute(), observabilityConfig.source)
  );
};
