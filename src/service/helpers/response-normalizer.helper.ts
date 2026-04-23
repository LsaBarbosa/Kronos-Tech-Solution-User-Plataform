type EnvelopeRecord = Record<string, unknown>;
type Mapper<TRaw, TOutput> = (item: TRaw) => TOutput;

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
