import type { UserAccountData, UserData } from "@/types/user";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown, fallback = ""): string => (typeof value === "string" ? value : fallback);
const getBoolean = (value: unknown, fallback = false): boolean => (typeof value === "boolean" ? value : fallback);
const getNumber = (value: unknown, fallback = 0): number => (typeof value === "number" ? value : fallback);

const ensureRecord = (value: unknown, context: string): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new Error(`${context}: payload deve ser um objeto.`);
  }
  return value;
};

export const unwrapObject = (payload: unknown, context: string): Record<string, unknown> => {
  if (isRecord(payload)) {
    return payload;
  }

  throw new Error(`${context}: formato de resposta incompatível (objeto esperado).`);
};

export const unwrapList = (payload: unknown, keys: string[], context: string): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    for (const key of keys) {
      const candidate = payload[key];
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    throw new Error(`${context}: formato incompatível. Esperado um array em ${keys.join("/")}.`);
  }

  throw new Error(`${context}: formato incompatível. Esperado array ou envelope de lista.`);
};

export const mapSession = (payload: unknown): UserAccountData => {
  const data = unwrapObject(payload, "Sessão do usuário");

  return {
    userId: getString(data.userId) || getString(data.id),
    username: getString(data.username) || getString(data.fullName),
    role: getString(data.role),
    active: getBoolean(data.active, true),
    employeeId: getString(data.employeeId),
    companyId: getString(data.companyId) || undefined,
    claims: isRecord(data.claims) ? data.claims : undefined,
  };
};

export const mapUserProfile = (payload: unknown): UserData => {
  const data = unwrapObject(payload, "Perfil do usuário");
  const addressData = isRecord(data.address) ? data.address : {};

  return {
    employeeId: getString(data.employeeId),
    fullName: getString(data.fullName),
    maskedCpf: getString(data.maskedCpf),
    jobPosition: getString(data.jobPosition),
    email: getString(data.email),
    salary: getNumber(data.salary),
    phone: getString(data.phone),
    address: {
      street: getString(addressData.street),
      number: getString(addressData.number),
      postalCode: getString(addressData.postalCode),
      city: getString(addressData.city),
      state: getString(addressData.state),
    },
    companyName: getString(data.companyName),
    lastSeenMessageTimestamp:
      typeof data.lastSeenMessageTimestamp === "string" || data.lastSeenMessageTimestamp === null
        ? data.lastSeenMessageTimestamp
        : null,
    homeOffice: getBoolean(data.homeOffice),
    role: getString(data.role) || undefined,
    lastLogin: getString(data.lastLogin) || undefined,
  };
};

export const mapUserAccount = (payload: unknown): UserAccountData => {
  const data = ensureRecord(payload, "Dados de conta do usuário");

  return {
    userId: getString(data.userId) || getString(data.id),
    username: getString(data.username) || getString(data.fullName),
    role: getString(data.role),
    active: getBoolean(data.active, true),
    employeeId: getString(data.employeeId),
    companyId: getString(data.companyId) || undefined,
    claims: isRecord(data.claims) ? data.claims : undefined,
  };
};
