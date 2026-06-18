import { observabilityConfig } from "./observability.config";
import { sendObservabilityEvent } from "./observability.client";

export const reportInitialPerformance = () => {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return;
  }

  const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (!navigationEntry) {
    return;
  }

  const durationMs = Math.round(navigationEntry.duration);
  sendObservabilityEvent({
    eventType: "performance_navigation",
    category: "performance",
    result: durationMs > observabilityConfig.slowRouteThresholdMs ? "degraded" : "success",
    reason: durationMs > observabilityConfig.slowRouteThresholdMs ? "slow_navigation" : "none",
    durationMs,
  });
};
