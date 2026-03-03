export interface ObservabilityContext {
  feature?: string;
  action?: string;
  correlationId?: string;
  [key: string]: unknown;
}

export const reportError = (error: unknown, context: ObservabilityContext = {}): void => {
  const normalizedError = error instanceof Error ? error : new Error(String(error));

  console.error('[observability]', {
    message: normalizedError.message,
    stack: normalizedError.stack,
    ...context,
  });
};

export const setupGlobalErrorHandlers = (): void => {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, {
      feature: 'global',
      action: 'window.error',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, {
      feature: 'global',
      action: 'window.unhandledrejection',
    });
  });
};
