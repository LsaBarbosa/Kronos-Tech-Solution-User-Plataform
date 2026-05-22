import { api } from "@/config/api";
import { API_ROUTES, LGPD_PATHS, buildRoute } from "@/config/api-routes";

export interface DataProcessingInventoryResponse {
  inventoryId: string;
  processCode: string;
  processName: string;
  dataCategory: string;
  dataFields: string;
  dataSubjectCategory: string;
  purpose: string;
  legalBasis: string;
  sensitiveData: boolean;
  sourceSystem: string;
  storageLocation: string | null;
  retentionPolicyCode: string | null;
  externalSharing: string | null;
  internationalTransfer: boolean;
  securityMeasures: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryPayload {
  processCode: string;
  processName: string;
  dataCategory: string;
  dataFields: string;
  dataSubjectCategory: string;
  purpose: string;
  legalBasis: string;
  sensitiveData: boolean;
  sourceSystem: string;
  storageLocation?: string;
  retentionPolicyCode?: string;
  externalSharing?: string;
  internationalTransfer: boolean;
  securityMeasures?: string;
  active: boolean;
}

export interface PaginatedInventoryResponse {
  content: DataProcessingInventoryResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export const listInventories = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedInventoryResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  const response = await api.get<PaginatedInventoryResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY),
    { params: Object.fromEntries(params) }
  );
  return response.data;
};

export const listActiveInventories = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedInventoryResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  const response = await api.get<PaginatedInventoryResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_ACTIVE),
    { params: Object.fromEntries(params) }
  );
  return response.data;
};

export const getInventoryByProcessCode = async (
  processCode: string
): Promise<DataProcessingInventoryResponse> => {
  const response = await api.get<DataProcessingInventoryResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_BY_CODE(processCode))
  );
  return response.data;
};

export const createInventory = async (
  payload: CreateInventoryPayload
): Promise<DataProcessingInventoryResponse> => {
  const response = await api.post<DataProcessingInventoryResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY),
    payload
  );
  return response.data;
};

export const updateInventory = async (
  inventoryId: string,
  payload: CreateInventoryPayload
): Promise<DataProcessingInventoryResponse> => {
  const response = await api.patch<DataProcessingInventoryResponse>(
    buildRoute(API_ROUTES.LGPD, `inventory/${inventoryId}`),
    payload
  );
  return response.data;
};
