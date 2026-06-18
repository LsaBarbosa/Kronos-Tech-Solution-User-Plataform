export type FrontendObservabilityLevel = "info" | "warn" | "error";

export interface FrontendObservabilityEventPayload {
  eventType: string;
  level: FrontendObservabilityLevel;
  category: string;
  route: string;
  source: string;
  result: string;
  reason: string;
  message?: string;
  correlationId: string;
  durationMs?: number;
}

export interface ObservabilityErrorContext {
  domain?: string;
  operation?: string;
  kind?: string;
  status?: number;
  durationMs?: number;
  route?: string;
  [key: string]: unknown;
}
