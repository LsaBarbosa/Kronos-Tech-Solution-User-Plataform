/**
 * LGPD-OBS-001: Sanitização de dados sensíveis em observabilidade
 * Sanitiza dados pessoais e sensíveis antes de enviar para observabilidade
 */

const REDACTED = "[REDACTED]";
const MAX_DEPTH = 10;
const MAX_TEXT_LENGTH = 5000;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_NAME_LENGTH = 200;

const SENSITIVE_KEY_PATTERNS = [
  /token/i,
  /password/i,
  /authorization/i,
  /cookie/i,
  /cpf/i,
  /cnpj/i,
  /email/i,
  /username/i,
  /userName/i,
  /image/i,
  /base64/i,
  /storagePath/i,
  /s3/i,
  /signedUrl/i,
  /secret/i,
  /credential/i,
  /key/i,
];

/**
 * Sanitiza texto removendo padrões sensíveis (CPF, CNPJ, email, tokens, etc)
 * Se falhar, retorna marcador seguro em vez do dado original
 */
export function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) return "";

  try {
    let text = String(value);

    // CPF: 123.456.789-01 ou 12345678901
    text = text.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF_REDACTED]");

    // CNPJ: 12.345.678/0001-99 ou 12345678000199
    text = text.replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, "[CNPJ_REDACTED]");

    // Email
    text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL_REDACTED]");

    // Bearer Token
    text = text.replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]");

    // JWT (eyJ...eyJ...xxx)
    text = text.replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[JWT_REDACTED]");

    // Set-Cookie e Cookie headers
    text = text.replace(/\b(Set-Cookie|Cookie)\s*:\s*[^;\n]+(?:;[^;\n]+)*/gi, "$1: [REDACTED]");

    // data: URL com base64
    text = text.replace(/(data:[^;]+;base64,)[A-Za-z0-9+/=]+/gi, "$1[REDACTED]");

    // base64 direto
    text = text.replace(/(base64,)[A-Za-z0-9+/=]+/gi, "$1[REDACTED]");

    // Query params sensíveis
    text = text.replace(
      /\b(token|access_token|refresh_token|signature|X-Amz-Signature|X-Amz-Credential|X-Amz-Security-Token|AWSAccessKeyId|password|cpf|cnpj|email|username)=([^&\s]+)/gi,
      "$1=[REDACTED]"
    );

    // S3 paths
    text = text.replace(/\bs3:\/\/[^\s]+/gi, "[STORAGE_PATH_REDACTED]");

    // Storage paths (employees/123/faces, documents/456, etc)
    text = text.replace(/\b(?:employees?|documents?|faces?)\/[A-Za-z0-9._\-/%]+/gi, "[STORAGE_PATH_REDACTED]");

    return truncate(text, MAX_TEXT_LENGTH);
  } catch {
    return "[SANITIZATION_FAILED]";
  }
}

/**
 * Sanitiza objetos recursivamente, mascarando valores de chaves sensíveis e conteúdo de strings
 */
export function sanitizeObject<T>(value: T, depth = 0): T {
  if (depth > MAX_DEPTH) {
    return "[MAX_DEPTH_REDACTED]" as T;
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeText(value) as T;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item, depth + 1)) as T;
  }

  if (typeof value === "object") {
    try {
      const result: Record<string, unknown> = {};

      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        if (isSensitiveKey(key)) {
          result[key] = redactByKey(key);
        } else {
          result[key] = sanitizeObject(item, depth + 1);
        }
      }

      return result as T;
    } catch {
      return "[SANITIZATION_FAILED]" as T;
    }
  }

  return sanitizeText(value) as T;
}

/**
 * Sanitiza um Error removendo dados sensíveis de name, message e stack
 */
export function sanitizeError(error: unknown) {
  try {
    if (error instanceof Error) {
      return {
        name: sanitizeText(error.name || "Error").slice(0, MAX_NAME_LENGTH),
        message: sanitizeText(error.message || "").slice(0, MAX_MESSAGE_LENGTH),
        stack: error.stack ? sanitizeText(error.stack).slice(0, MAX_TEXT_LENGTH) : undefined,
        cause: (error as Error & { cause?: unknown }).cause
          ? sanitizeObject((error as Error & { cause?: unknown }).cause)
          : undefined,
      };
    }

    if (typeof error === "string") {
      return {
        name: "UnknownError",
        message: sanitizeText(error).slice(0, MAX_MESSAGE_LENGTH),
      };
    }

    return {
      name: "UnknownError",
      message: sanitizeText(error).slice(0, MAX_MESSAGE_LENGTH),
    };
  } catch {
    return {
      name: "UnknownError",
      message: "[SANITIZATION_FAILED]",
    };
  }
}

/**
 * Sanitiza o payload completo de observabilidade
 * Garante que nenhum dado sensível saia para o endpoint de observabilidade
 */
export function sanitizeObservabilityPayload<T>(payload: T): T {
  try {
    return sanitizeObject(payload);
  } catch {
    return "[SANITIZATION_FAILED]" as T;
  }
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function redactByKey(key: string): string {
  if (/cpf/i.test(key)) return "[CPF_REDACTED]";
  if (/cnpj/i.test(key)) return "[CNPJ_REDACTED]";
  if (/email/i.test(key)) return "[EMAIL_REDACTED]";
  if (/username|userName/i.test(key)) return "[USERNAME_REDACTED]";
  if (/base64|image/i.test(key)) return "[BASE64_REDACTED]";
  if (/storagepath|s3|signedUrl/i.test(key)) return "[STORAGE_PATH_REDACTED]";
  return REDACTED;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...[TRUNCATED]`;
}
