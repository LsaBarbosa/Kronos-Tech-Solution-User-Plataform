/* eslint-disable no-console */
import { sanitizeError, sanitizeObject, sanitizeText } from "@/utils/observability-sanitizer";

type SafeLoggerLevel = "error" | "warn" | "info" | "debug";

interface SafeLoggerContext {
  feature?: string;
  operation?: string;
  [key: string]: unknown;
}

interface SafeLoggerEnvironment {
  isDevelopment: boolean;
}

interface SafeLogPayload {
  message: string;
  error?: ReturnType<typeof sanitizeError>;
  context?: Record<string, unknown>;
}

const resolveEnvironment = (): SafeLoggerEnvironment => ({
  isDevelopment: Boolean(import.meta.env?.DEV),
});

const buildPayload = (
  message: string,
  error?: unknown,
  context?: SafeLoggerContext
): SafeLogPayload => ({
  message: sanitizeText(message).slice(0, 240) || "Application event",
  error: error === undefined ? undefined : sanitizeError(error),
  context:
    context && Object.keys(context).length > 0
      ? (sanitizeObject(context) as Record<string, unknown>)
      : undefined,
});

export const createSafeLogger = (environment: SafeLoggerEnvironment = resolveEnvironment()) => {
  const emit = (level: SafeLoggerLevel, message: string, error?: unknown, context?: SafeLoggerContext) => {
    const payload = buildPayload(message, error, context);

    if (!environment.isDevelopment) {
      return payload;
    }

    const method = level === "error" ? console.error
      : level === "warn" ? console.warn
      : level === "info" ? console.info
      : console.debug;

    method(`[${level}] ${payload.message}`, payload);
    return payload;
  };

  return {
    error: (message: string, error?: unknown, context?: SafeLoggerContext) =>
      emit("error", message, error, context),
    warn: (message: string, error?: unknown, context?: SafeLoggerContext) =>
      emit("warn", message, error, context),
    info: (message: string, context?: SafeLoggerContext) =>
      emit("info", message, undefined, context),
    debug: (message: string, context?: SafeLoggerContext) =>
      emit("debug", message, undefined, context),
  };
};

export const safeLogger = createSafeLogger();
