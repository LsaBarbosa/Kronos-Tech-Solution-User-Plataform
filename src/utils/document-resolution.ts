export interface DocumentReferenceRecord {
  documentId?: string | null;
  documentDownloadUrl?: string | null;
  documentDownloadPath?: string | null;
}

const DOCUMENTS_SEGMENT = "documents";
const LEGACY_DOCUMENT_BASE_URL = "http://kronos.local";
const UUID_REGEX =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;
const DOCUMENT_ROUTE_FILLER_SEGMENTS = new Set(["download", "file", "view"]);

const decodeSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

const normalizeId = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

const normalizeResolvedId = (value: string | null | undefined) => {
  const normalized = normalizeId(value);

  if (!normalized || /[/?#]/.test(normalized)) {
    return undefined;
  }

  return normalized;
};

const isRouteLike = (value: string) =>
  /^https?:\/\//i.test(value) || value.startsWith("/") || value.includes("/") || value.includes("?");

const extractFromLegacyRoute = (value: string) => {
  try {
    const url = new URL(value, LEGACY_DOCUMENT_BASE_URL);
    const queryDocumentId =
      normalizeResolvedId(url.searchParams.get("documentId")) ??
      normalizeResolvedId(url.searchParams.get("id"));

    if (queryDocumentId) {
      return queryDocumentId;
    }

    const segments = url.pathname.split("/").map(decodeSegment).filter(Boolean);
    const documentsIndex = segments.lastIndexOf(DOCUMENTS_SEGMENT);

    if (documentsIndex >= 0) {
      const candidate = segments
        .slice(documentsIndex + 1)
        .find((segment) => !DOCUMENT_ROUTE_FILLER_SEGMENTS.has(segment.toLowerCase()));

      if (candidate) {
        return normalizeResolvedId(candidate);
      }
    }
  } catch {
    // Fall through to UUID extraction below for malformed legacy strings.
  }

  return value.match(UUID_REGEX)?.[0];
};

const resolveCandidate = (value: string | null | undefined) => {
  const normalized = normalizeId(value);

  if (!normalized) {
    return undefined;
  }

  if (!isRouteLike(normalized)) {
    return normalizeResolvedId(normalized);
  }

  return extractFromLegacyRoute(normalized);
};

export const resolveDocumentId = (record: DocumentReferenceRecord) =>
  resolveCandidate(record.documentId) ??
  resolveCandidate(record.documentDownloadUrl) ??
  resolveCandidate(record.documentDownloadPath);
