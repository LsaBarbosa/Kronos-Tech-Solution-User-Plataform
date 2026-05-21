import { api } from "@/config/api";
import { API_ROUTES, LGPD_PATHS, buildRoute } from "@/config/api-routes";

export type LgpdRequestType =
  | "CONFIRM_PROCESSING"
  | "ACCESS"
  | "CORRECTION"
  | "ANONYMIZATION"
  | "BLOCKING"
  | "DELETION"
  | "PORTABILITY"
  | "CONSENT_REVOCATION"
  | "SHARING_INFORMATION";

export type LgpdRequestStatus =
  | "OPEN"
  | "IN_ANALYSIS"
  | "WAITING_CONTROLLER"
  | "WAITING_LEGAL_REVIEW"
  | "COMPLETED"
  | "REJECTED"
  | "PARTIALLY_COMPLETED";

export interface LgpdRequestResponse {
  requestId: string;
  requestType: LgpdRequestType;
  status: LgpdRequestStatus;
  description: string;
  openedAt: string;
  closedAt: string | null;
}

export interface CreateLgpdRequestPayload {
  requestType: LgpdRequestType;
  description: string;
}

export interface ListLgpdRequestsResponse {
  content: LgpdRequestResponse[];
}

export const createLgpdRequest = async (payload: CreateLgpdRequestPayload): Promise<void> => {
  await api.post(buildRoute(API_ROUTES.LGPD, LGPD_PATHS.REQUESTS), payload);
};

export const listLgpdRequests = async (): Promise<LgpdRequestResponse[]> => {
  const response = await api.get<ListLgpdRequestsResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.REQUESTS)
  );
  return response.data.content || [];
};

export const exportEmployeeData = async (employeeId: string): Promise<Blob> => {
  const response = await api.get<Blob>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.EMPLOYEE_EXPORT(employeeId)),
    { responseType: "blob" }
  );
  return response.data;
};
