import { observabilityConfig } from "./observability.config";
import { captureError, sendObservabilityEvent } from "./observability.client";
import { reportInitialPerformance } from "./performance";

let initialized = false;

const reportRouteChange = (startTime: number) => {
  const durationMs = Math.max(0, Math.round(performance.now() - startTime));

  sendObservabilityEvent({
    eventType: "page_view",
    category: "navigation",
    result: "success",
    reason: "route_change",
  });

  if (durationMs > observabilityConfig.slowRouteThresholdMs) {
    sendObservabilityEvent({
      eventType: "slow_route",
      category: "performance",
      result: "degraded",
      reason: "slow_route",
      durationMs,
    });
  }
};

const instrumentHistory = () => {
  if (typeof window === "undefined") {
    return;
  }

  const { history } = window;
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    const startedAt = performance.now();
    const result = originalPushState(...args);
    queueMicrotask(() => reportRouteChange(startedAt));
    return result;
  };

  history.replaceState = (...args) => {
    const startedAt = performance.now();
    const result = originalReplaceState(...args);
    queueMicrotask(() => reportRouteChange(startedAt));
    return result;
  };

  window.addEventListener("popstate", () => reportRouteChange(performance.now()));
};

export const initBrowserObservability = () => {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;

  window.addEventListener("error", (event) => {
    captureError(event.error ?? new Error(event.message), {
      domain: "runtime",
      operation: "window_error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureError(event.reason, {
      domain: "runtime",
      operation: "unhandled_rejection",
    });
  });

  instrumentHistory();
  sendObservabilityEvent({
    eventType: "page_view",
    category: "navigation",
    result: "success",
    reason: "initial_load",
  });
  reportInitialPerformance();
};
