type EnvelopeRecord = Record<string, unknown>;
type Mapper<TRaw, TOutput> = (item: TRaw) => TOutput;

export interface PageEnvelope<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

const DEFAULT_LIST_KEYS = [
  "content",
  "items",
  "data",
  "results",
  "companies",
  "employees",
  "users",
  "documents",
  "messages",
];

export const extractArray = <T = unknown>(
  payload: unknown,
  keys: readonly string[] = DEFAULT_LIST_KEYS
): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const envelope = payload as EnvelopeRecord;
  const key = keys.find((candidate) => Array.isArray(envelope[candidate]));

  return key ? (envelope[key] as T[]) : [];
};

export const extractObject = <T = EnvelopeRecord>(
  payload: unknown,
  key = "data"
): Partial<T> => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const envelope = payload as EnvelopeRecord;
  const nested = envelope[key];

  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Partial<T>;
  }

  return envelope as Partial<T>;
};

export const extractPage = <T = unknown>(
  payload: unknown,
  keys: readonly string[] = DEFAULT_LIST_KEYS
): PageEnvelope<T> => {
  const page = extractObject<Partial<PageEnvelope<T>>>(payload);
  const content = extractArray<T>(payload, keys);

  return {
    content,
    totalPages: safeNumber(page.totalPages),
    totalElements: safeNumber(page.totalElements, content.length),
    currentPage: safeNumber(page.currentPage),
    isFirst: safeBoolean(page.isFirst, true),
    isLast: safeBoolean(page.isLast, true),
  };
};

export const safeString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export const safeBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

export const safeDate = (value: unknown, fallback = ""): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : value;
};

export const safeNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const mapUserProfile = (payload: unknown) => {
  const profile = extractObject<{
    userId?: string;
    employeeId?: string;
    fullName?: string;
    name?: string;
    email?: string;
    role?: string;
  }>(payload);

  return {
    userId: profile.userId ?? "",
    employeeId: profile.employeeId ?? "",
    fullName: profile.fullName ?? profile.name ?? "",
    email: profile.email ?? "",
    role: profile.role ?? "",
  };
};

export const mapArrayPayload = <TRaw = unknown, TOutput = TRaw>(
  payload: unknown,
  mapper: Mapper<TRaw, TOutput>,
  keys: readonly string[] = DEFAULT_LIST_KEYS
): TOutput[] => extractArray<TRaw>(payload, keys).map(mapper);

export const mapObjectPayload = <TRaw = EnvelopeRecord, TOutput = TRaw>(
  payload: unknown,
  mapper: Mapper<Partial<TRaw>, TOutput>,
  key = "data"
): TOutput => mapper(extractObject<TRaw>(payload, key));
