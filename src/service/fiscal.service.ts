import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";

const FISCAL_ENDPOINTS = {
  mirror: buildRoute(API_ROUTES.LEGAL, "espelho-ponto"),
  technicalCertificate: buildRoute(API_ROUTES.LEGAL, "technical-certificate"),
  afd: buildRoute(API_ROUTES.LEGAL, "afd"),
  aej: buildRoute(API_ROUTES.LEGAL, "aej"),
} as const;

const FISCAL_FILE_NAMES = {
  mirror: (startDate: string, endDate: string) => `Espelho_${startDate}_${endDate}.pdf`,
  technicalCertificate: () => "Atestado_Tecnico.p7s",
  afd: () => "AFD.txt",
  aej: (startDate: string, endDate: string) => `AEJ_${startDate}_${endDate}.p7s`,
} as const;

const CONTENT_DISPOSITION_FILE_NAME_REGEX =
  /filename\*=(?:UTF-8'')?([^;]+)|filename="?([^";]+)"?/i;

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getResponseFileName = (
  fallbackFileName: string,
  contentDisposition?: string
) => {
  if (!contentDisposition) {
    return fallbackFileName;
  }

  const match = CONTENT_DISPOSITION_FILE_NAME_REGEX.exec(contentDisposition);
  const fileName = match?.[1] ?? match?.[2];

  if (!fileName) {
    return fallbackFileName;
  }

  return decodeURIComponent(fileName.replace(/^"|"$/g, ""));
};

const downloadFiscalBlob = (
  response: { data: Blob; headers?: Record<string, string | undefined> },
  fallbackFileName: string
) => {
  const fileName = getResponseFileName(
    fallbackFileName,
    response.headers?.["content-disposition"] ?? response.headers?.["Content-Disposition"]
  );

  downloadBlob(new Blob([response.data]), fileName);
  return fileName;
};

export const FiscalService = {
  downloadMirror: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(FISCAL_ENDPOINTS.mirror, {
        params: { startDate, endDate },
        responseType: "blob",
      });

      return downloadFiscalBlob(response, FISCAL_FILE_NAMES.mirror(startDate, endDate));
    } catch (error) {
      throw normalizeServiceError(error);
    }
  },

  downloadTechnicalCertificate: async () => {
    try {
      const response = await api.get(FISCAL_ENDPOINTS.technicalCertificate, {
        responseType: "blob",
      });

      return downloadFiscalBlob(response, FISCAL_FILE_NAMES.technicalCertificate());
    } catch (error) {
      throw normalizeServiceError(error);
    }
  },

  downloadAfd: async () => {
    try {
      const response = await api.get(FISCAL_ENDPOINTS.afd, {
        responseType: "blob",
      });

      return downloadFiscalBlob(response, FISCAL_FILE_NAMES.afd());
    } catch (error) {
      throw normalizeServiceError(error);
    }
  },

  downloadAej: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(FISCAL_ENDPOINTS.aej, {
        params: { startDate, endDate },
        responseType: "blob",
      });

      return downloadFiscalBlob(response, FISCAL_FILE_NAMES.aej(startDate, endDate));
    } catch (error) {
      throw normalizeServiceError(error);
    }
  },
};
