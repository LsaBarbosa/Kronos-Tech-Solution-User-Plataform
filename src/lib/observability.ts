type ObservabilityContext = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN = /token|password|senha|cpf|cnpj|email|username|authorization|cookie|image|base64/i;
const MAX_CONTEXT_DEPTH = 2;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isEnabled = () =>
  String(import.meta.env.VITE_OBSERVABILITY_ENABLED ?? "false").toLowerCase() === "true";

const getEndpoint = () => import.meta.env.VITE_OBSERVABILITY_ENDPOINT?.trim();

export const sanitizeObservabilityContext = (
  context: ObservabilityContext,
  depth = 0
): ObservabilityContext => {
  if (depth > MAX_CONTEXT_DEPTH) {
    return {};
  }

  return Object.entries(context).reduce<ObservabilityContext>((acc, [key, value]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      acc[key] = "[REDACTED]";
      return acc;
    }

    if (isRecord(value)) {
      acc[key] = sanitizeObservabilityContext(value, depth + 1);
      return acc;
    }

    if (Array.isArray(value)) {
      acc[key] = `[Array(${value.length})]`;
      return acc;
    }

    if (typeof value === "string" && value.length > 240) {
      acc[key] = `${value.slice(0, 240)}...`;
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
};

const buildPayload = (error: unknown, context: ObservabilityContext) => {
  const safeContext = sanitizeObservabilityContext(context);
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  const name = error instanceof Error ? error.name : "UnknownError";

  return JSON.stringify({
    app: "kronos-user-platform",
    name,
    message,
    context: safeContext,
    timestamp: new Date().toISOString(),
  });
};

export const captureError = (error: unknown, context: ObservabilityContext = {}) => {
  if (!isEnabled()) {
    return;
  }

  const endpoint = getEndpoint();
  if (!endpoint) {
    console.error("Observability endpoint não configurado.", error, sanitizeObservabilityContext(context));
    return;
  }

  const payload = buildPayload(error, context);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
    return;
  }

  console.error("Observability sendBeacon indisponível.", error, sanitizeObservabilityContext(context));
};

export const initObservability = () => {
  if (!isEnabled() || typeof window === "undefined") {
    return;
  }

  window.addEventListener("error", (event) => {
    captureError(event.error ?? new Error(event.message), {
      domain: "runtime",
      operation: "window-error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureError(event.reason, {
      domain: "runtime",
      operation: "unhandled-rejection",
    });
  });
};
