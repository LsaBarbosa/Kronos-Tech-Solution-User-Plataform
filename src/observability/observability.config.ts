const isEnabledValue = String(import.meta.env.VITE_OBSERVABILITY_ENABLED ?? "false")
  .trim()
  .toLowerCase() === "true";

const endpointValue = import.meta.env.VITE_OBSERVABILITY_ENDPOINT?.trim() || "";

export const observabilityConfig = {
  enabled: isEnabledValue,
  endpoint: endpointValue,
  source: "kronos-user-platform",
  slowRouteThresholdMs: 2500,
};

export const isObservabilityEnabled = () =>
  observabilityConfig.enabled && observabilityConfig.endpoint.length > 0;
