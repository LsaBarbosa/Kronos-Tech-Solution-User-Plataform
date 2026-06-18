import { sanitizeError, sanitizeObservabilityPayload, sanitizeText } from "@/utils/observability-sanitizer";
import type { FrontendObservabilityEventPayload, ObservabilityErrorContext } from "./types";

const redactKeyPattern = /token|password|senha|cpf|cnpj|email|authorization|cookie|image|base64|document|phone|telefone|address|latitude|longitude|lat|lng/i;
const allowedContextKeys = new Set(["domain", "operation", "kind", "status", "durationMs", "route"]);

const normalizeField = (value: unknown, fallback: string, maxLength: number) => {
  const sanitized = sanitizeText(value ?? fallback).trim();
  if (!sanitized) {
    return fallback;
  }

  return sanitized.slice(0, maxLength);
};

export const sanitizeObservabilityContext = (
  context: Record<string, unknown> = {}
): Record<string, unknown> =>
  Object.entries(context).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (redactKeyPattern.test(key)) {
      acc[key] = "[REDACTED]";
      return acc;
    }

    if (!allowedContextKeys.has(key)) {
      return acc;
    }

    acc[key] = sanitizeObservabilityPayload(value);
    return acc;
  }, {});

export const buildErrorEventPayload = (
  error: unknown,
  context: ObservabilityErrorContext,
  correlationId: string,
  route: string,
  source: string
): FrontendObservabilityEventPayload => {
  const sanitizedError = sanitizeError(error);
  const safeContext = sanitizeObservabilityContext(context);

  return {
    eventType: normalizeField(
      context.operation ? `${context.operation}` : "frontend_error",
      "frontend_error",
      64
    ),
    level: "error",
    category: normalizeField(context.domain, "runtime", 32),
    route: normalizeField(context.route ?? route, route, 160),
    source,
    result: "failure",
    reason: normalizeField(context.kind ?? sanitizedError.name, "unknown", 64),
    message: normalizeField(sanitizedError.message, "Frontend error", 240),
    correlationId: normalizeField(correlationId, "missing-correlation-id", 128),
    durationMs:
      typeof safeContext.durationMs === "number" && Number.isFinite(safeContext.durationMs)
        ? Math.max(0, Math.round(safeContext.durationMs))
        : undefined,
  };
};

export const buildEventPayload = (
  payload: Partial<FrontendObservabilityEventPayload>,
  correlationId: string,
  route: string,
  source: string
): FrontendObservabilityEventPayload => ({
  eventType: normalizeField(payload.eventType, "frontend_event", 64),
  level: payload.level ?? "info",
  category: normalizeField(payload.category, "ui", 32),
  route: normalizeField(payload.route ?? route, route, 160),
  source,
  result: normalizeField(payload.result, "success", 32),
  reason: normalizeField(payload.reason, "none", 64),
  message: payload.message ? normalizeField(payload.message, "", 240) : undefined,
  correlationId: normalizeField(correlationId, "missing-correlation-id", 128),
  durationMs:
    typeof payload.durationMs === "number" && Number.isFinite(payload.durationMs)
      ? Math.max(0, Math.round(payload.durationMs))
      : undefined,
});
