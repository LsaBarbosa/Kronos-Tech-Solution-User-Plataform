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
  | "WAITING_DATA_SUBJECT"
  | "COMPLETED"
  | "REJECTED"
  | "PARTIALLY_COMPLETED"
  | "CANCELLED";

export interface LgpdRequestResponse {
  requestId: string;
  employeeId: string;
  requestedByUserId: string;
  companyId: string;
  requestType: LgpdRequestType;
  status: LgpdRequestStatus;
  description: string;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
}

export interface EmployeeSummaryResponse {
  employeeId: string;
  fullName: string;
  email: string;
  jobPosition: string;
}

export interface CompanySummaryResponse {
  companyId: string;
  cnpj: string;
  tradeName: string;
}

export interface UserSummaryResponse {
  userId: string;
  username: string;
  role: "CTO" | "MANAGER" | "PARTNER";
}

export interface LgpdRequestAdminListResponse {
  requestId: string;
  employeeFullName: string;
  companyName: string;
  type: LgpdRequestType;
  status: LgpdRequestStatus;
  createdAt: string;
  assignedToName: string | null;
  updatedAt: string;
  isOverdue: boolean;
}

export interface LgpdRequestDetailsResponse {
  request: LgpdRequestResponse;
  employee: EmployeeSummaryResponse;
  company: CompanySummaryResponse;
  assignedTo: UserSummaryResponse | null;
  history: LgpdRequestHistoryItem[];
}

export interface LgpdRequestHistoryItem {
  historyId: string;
  requestId: string;
  status: LgpdRequestStatus;
  notes: string | null;
  changedByUsername: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface CreateLgpdRequestPayload {
  type: LgpdRequestType;
  description: string;
}

export interface LgpdRequestTransitionPayload {
  newStatus: LgpdRequestStatus;
  publicNotes?: string;
  internalNotes?: string;
  closedReason?: string;
}

export interface RequestComplementPayload {
  message: string;
}

export interface CancelRequestPayload {
  reason: string;
}

export interface AnonymizationSummaryResponse {
  totalScanned: number;
  totalAffected: number;
  totalSkipped: number;
  totalErrors: number;
}

export interface AnonymizationDomainResultResponse {
  resourceType: string;
  status: string;
  scanned: number;
  affected: number;
  skipped: number;
  errorCount: number;
  notes: string | null;
}

export interface AnonymizationConsolidatedResultResponse {
  consolidatedExecutionId: string;
  employeeId: string;
  companyId: string;
  consolidatedStatus: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED" | "BLOCKED";
  executionMode: "DRY_RUN" | "APPLY";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: AnonymizationSummaryResponse;
  domainResults: AnonymizationDomainResultResponse[];
  failedDomains: string[];
  warnings: string[];
}

export const createLgpdRequest = async (payload: CreateLgpdRequestPayload): Promise<void> => {
  await api.post(buildRoute(API_ROUTES.LGPD, LGPD_PATHS.REQUESTS), payload);
};

export const listLgpdRequests = async (): Promise<LgpdRequestResponse[]> => {
  const response = await api.get<LgpdRequestResponse[]>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.REQUESTS)
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const exportEmployeeData = async (employeeId: string): Promise<Blob> => {
  const response = await api.get<Blob>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.EMPLOYEE_EXPORT(employeeId)),
    { responseType: "blob" }
  );
  return response.data;
};

export const listAdminRequests = async (
  page: number = 0,
  size: number = 10,
  type?: LgpdRequestType,
  status?: LgpdRequestStatus,
  companyId?: string
): Promise<PaginatedResponse<LgpdRequestAdminListResponse>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (type) params.append("type", type);
  if (status) params.append("status", status);
  if (companyId) params.append("companyId", companyId);

  const response = await api.get<PaginatedResponse<LgpdRequestAdminListResponse>>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.ADMIN_REQUESTS),
    { params: Object.fromEntries(params) }
  );
  return response.data;
};

export const getAdminRequestDetails = async (
  requestId: string
): Promise<LgpdRequestDetailsResponse> => {
  const response = await api.get<LgpdRequestDetailsResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.ADMIN_REQUEST_DETAILS(requestId))
  );
  return response.data;
};

export const assignRequest = async (
  requestId: string,
  assignedToUserId: string
): Promise<LgpdRequestResponse> => {
  const response = await api.patch<LgpdRequestResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.ASSIGN_REQUEST(requestId)),
    { assignedToUserId }
  );
  return response.data;
};

export const addNote = async (
  requestId: string,
  publicNote: string,
  internalNote?: string
): Promise<LgpdRequestResponse> => {
  const response = await api.post<LgpdRequestResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.ADD_NOTE(requestId)),
    { publicNote, internalNote }
  );
  return response.data;
};

export const completeRequest = async (
  requestId: string,
  publicResolutionNotes: string,
  internalNotes?: string
): Promise<LgpdRequestResponse> => {
  const response = await api.post<LgpdRequestResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.COMPLETE_REQUEST(requestId)),
    { publicResolutionNotes, internalNotes }
  );
  return response.data;
};

export const rejectRequest = async (
  requestId: string,
  closedReason: string,
  publicNote: string,
  internalNote?: string
): Promise<LgpdRequestResponse> => {
  const response = await api.post<LgpdRequestResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.REJECT_REQUEST(requestId)),
    { closedReason, publicNote, internalNote }
  );
  return response.data;
};

export const transitionRequestStatus = async (
  requestId: string,
  payload: LgpdRequestTransitionPayload
): Promise<LgpdRequestResponse> => {
  const response = await api.post<LgpdRequestResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.TRANSITION_STATUS(requestId)),
    payload
  );
  return response.data;
};

export const requestComplementFromDataSubject = async (
  requestId: string,
  payload: RequestComplementPayload
): Promise<LgpdRequestResponse> => {
  const response = await api.post<LgpdRequestResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.REQUEST_COMPLEMENT(requestId)),
    payload
  );
  return response.data;
};

export const cancelLgpdRequest = async (
  requestId: string,
  payload: CancelRequestPayload
): Promise<LgpdRequestResponse> => {
  const response = await api.post<LgpdRequestResponse>(
    buildRoute(API_ROUTES.LGPD, LGPD_PATHS.CANCEL_REQUEST(requestId)),
    payload
  );
  return response.data;
};

export const getAnonymizationResult = async (
  requestId: string
): Promise<AnonymizationConsolidatedResultResponse | null> => {
  try {
    const response = await api.get<AnonymizationConsolidatedResultResponse>(
      buildRoute(API_ROUTES.LGPD, LGPD_PATHS.ANONYMIZATION_RESULT(requestId))
    );
    return response.data || null;
  } catch (error) {
    // If endpoint returns 204 or not found, return null
    console.debug("Anonymization result not available:", error);
    return null;
  }
};

export const getAvailableTransitions = (currentStatus: LgpdRequestStatus): LgpdRequestStatus[] => {
  const transitions: Record<LgpdRequestStatus, LgpdRequestStatus[]> = {
    OPEN: ["IN_ANALYSIS", "REJECTED", "CANCELLED"],
    IN_ANALYSIS: ["WAITING_CONTROLLER", "REJECTED", "CANCELLED"],
    WAITING_CONTROLLER: ["WAITING_LEGAL_REVIEW", "REJECTED", "CANCELLED"],
    WAITING_LEGAL_REVIEW: ["WAITING_DATA_SUBJECT", "COMPLETED", "PARTIALLY_COMPLETED", "REJECTED", "CANCELLED"],
    WAITING_DATA_SUBJECT: ["IN_ANALYSIS", "COMPLETED", "PARTIALLY_COMPLETED", "REJECTED", "CANCELLED"],
    COMPLETED: [],
    REJECTED: [],
    PARTIALLY_COMPLETED: [],
    CANCELLED: [],
  };
  return transitions[currentStatus] || [];
};
