import { api } from "@/config/api";
import { API_ROUTES, AFD_PATHS, buildRoute } from "@/config/api-routes";
import type { AfdImportPreviewResponse, AfdImportConfirmResponse } from "@/types/afd-import.types";

export const previewAfdImport = async (file: File): Promise<AfdImportPreviewResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<AfdImportPreviewResponse>(
    buildRoute(API_ROUTES.AFD, AFD_PATHS.IMPORT_PREVIEW),
    formData
  );
  return response.data;
};

export const confirmAfdImport = async (file: File): Promise<AfdImportConfirmResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<AfdImportConfirmResponse>(
    buildRoute(API_ROUTES.AFD, AFD_PATHS.IMPORT_CONFIRM),
    formData
  );
  return response.data;
};
