import { API_BASE_URL } from "@/config/api";
import { handleUnauthorized } from "@/config/api";

const extractErrorMessage = async (response: Response) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const errorData = await response.json();
      return errorData.detail || errorData.message || `Erro de API (${response.status})`;
    }

    const text = await response.text();
    return text || `Erro de API (${response.status})`;
  } catch {
    return `Erro de API (${response.status})`;
  }
};

const parseFilenameFromDisposition = (contentDisposition: string | null) => {
  if (!contentDisposition) return undefined;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return undefined;
};

const parseFilenameFromUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const pathname = parsedUrl.pathname;
    const filename = pathname.split("/").filter(Boolean).pop();

    return filename || undefined;
  } catch {
    return undefined;
  }
};

interface DownloadFileOptions {
  filename?: string;
  method?: "GET" | "POST";
  body?: BodyInit;
  headers?: HeadersInit;
}

export const downloadFile = async (url: string, options: DownloadFileOptions = {}): Promise<void> => {
  const headers = new Headers(options.headers);
  headers.delete("authorization");
  headers.delete("Authorization");

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body,
    credentials: "include",
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  const filename =
    options.filename ||
    parseFilenameFromDisposition(response.headers.get("content-disposition")) ||
    parseFilenameFromUrl(url) ||
    "download";

  const link = window.document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);

  window.URL.revokeObjectURL(objectUrl);
};

export const buildApiUrl = (path: string, params?: Record<string, string | undefined>) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  return url.toString();
};
