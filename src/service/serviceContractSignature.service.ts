import { api } from "@/config/api";
import {
  API_ROUTES,
  SERVICE_CONTRACT_PATHS,
  buildRoute,
} from "@/config/api-routes";
import type {
  CreateServiceContractResponse,
  PendingServiceContractList,
  ServiceContractAdminPage,
  ServiceContractSignatureAdminPage,
  SignServiceContractRequest,
  SignServiceContractResponse,
} from "@/types/service-contract-signature";

const root = (path: string) => buildRoute(API_ROUTES.SERVICE_CONTRACTS, path);

export const ServiceContractSignatureService = {
  async getPendingContracts(): Promise<PendingServiceContractList> {
    const response = await api.get<PendingServiceContractList>(
      root(SERVICE_CONTRACT_PATHS.ME_PENDING)
    );
    return response.data;
  },

  async fetchContractPreviewPdf(contractId: string): Promise<{ blob: Blob }> {
    const response = await api.get<Blob>(
      root(SERVICE_CONTRACT_PATHS.PREVIEW(contractId)),
      { responseType: "blob" }
    );
    return { blob: response.data };
  },

  async sign(contractId: string, request: SignServiceContractRequest): Promise<SignServiceContractResponse> {
    const response = await api.post<SignServiceContractResponse>(
      root(SERVICE_CONTRACT_PATHS.SIGN(contractId)),
      request
    );
    return response.data;
  },

  async downloadSignedDocument(signatureId: string): Promise<{ blob: Blob; fileName: string }> {
    const response = await api.get<Blob>(
      root(SERVICE_CONTRACT_PATHS.SIGNATURE_DOCUMENT(signatureId)),
      { responseType: "blob" }
    );
    const cd = response.headers["content-disposition"] ?? "";
    const match = /filename="?([^";]+)"?/.exec(cd);
    const fileName = match?.[1] ?? `contrato-assinado-${signatureId}.pdf`;
    return { blob: response.data, fileName };
  },

  async createContract(payload: {
    title: string;
    description?: string;
    employeeIds: string[];
    file: File;
  }): Promise<CreateServiceContractResponse> {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    form.append("employeeIds", payload.employeeIds.join(","));
    form.append("file", payload.file);
    // Não setar Content-Type manualmente: o axios detecta FormData e injeta
    // `multipart/form-data; boundary=...` automaticamente. O interceptor global
    // limpa qualquer Content-Type prévio para evitar conflito de boundary.
    const response = await api.post<CreateServiceContractResponse>(
      root(SERVICE_CONTRACT_PATHS.ADMIN),
      form
    );
    return response.data;
  },

  async listAdmin(params: { status?: "ACTIVE" | "VOIDED"; page?: number; size?: number } = {}): Promise<ServiceContractAdminPage> {
    const response = await api.get<ServiceContractAdminPage>(
      root(SERVICE_CONTRACT_PATHS.ADMIN),
      { params }
    );
    return response.data;
  },

  async listAdminSignatures(params: {
    contractId?: string;
    status?: "ACTIVE" | "VOIDED";
    page?: number;
    size?: number;
  } = {}): Promise<ServiceContractSignatureAdminPage> {
    const response = await api.get<ServiceContractSignatureAdminPage>(
      root(SERVICE_CONTRACT_PATHS.ADMIN_SIGNATURES),
      { params }
    );
    return response.data;
  },
};
