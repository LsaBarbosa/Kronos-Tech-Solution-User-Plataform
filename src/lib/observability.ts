import { initBrowserObservability } from "@/observability/browser-events";
import {
  captureError as captureFrontendError,
  sendObservabilityEvent,
} from "@/observability/observability.client";
import { sanitizeObservabilityContext } from "@/observability/observability.sanitizer";
import type { ObservabilityErrorContext } from "@/observability/types";

export { sanitizeObservabilityContext };

export const captureError = (error: unknown, context: ObservabilityErrorContext = {}) => {
  captureFrontendError(error, context);
};

export const capturePageView = () =>
  sendObservabilityEvent({
    eventType: "page_view",
    category: "navigation",
    result: "success",
    reason: "manual_trigger",
  });

export const initObservability = () => {
  initBrowserObservability();
};
