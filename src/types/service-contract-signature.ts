export interface PendingServiceContract {
  contractId: string;
  assignmentId: string;
  title: string;
  description: string | null;
  originalFileName: string;
  documentHashSha256: string;
  assignedAt: string;
  declarationVersion: string;
  declarationText: string;
  declarationHashSha256: string;
}

export interface PendingServiceContractList {
  contracts: PendingServiceContract[];
}

export interface SignServiceContractRequest {
  confirmed: boolean;
  declarationVersion: string;
  declarationHashSha256: string;
  contractDocumentHashSha256: string;
  faceImageBase64: string;
}

export interface SignServiceContractResponse {
  signatureId: string;
  assignmentId: string;
  contractId: string;
  signedAt: string;
  signatureType: string;
  signatureMethod: string;
  contractDocumentHashSha256: string;
  signedPdfHashSha256: string;
  signedDocumentId: string | null;
  declarationVersion: string;
}

export interface CreateServiceContractResponse {
  contractId: string;
  title: string;
  originalFileName: string;
  documentHashSha256: string;
  createdAt: string;
  assignmentIds: string[];
}

export interface ServiceContractAdminItem {
  contractId: string;
  title: string;
  originalFileName: string;
  status: "ACTIVE" | "VOIDED";
  createdAt: string;
  totalAssignments: number;
  signedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export interface ServiceContractAdminPage {
  items: ServiceContractAdminItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ServiceContractSignatureAdminItem {
  signatureId: string;
  assignmentId: string;
  contractId: string;
  employeeId: string;
  employeeName: string;
  signedAt: string;
  status: "ACTIVE" | "VOIDED";
  signatureType: string;
  signatureMethod: string;
  signedPdfHashSha256: string;
}

export interface ServiceContractSignatureAdminPage {
  items: ServiceContractSignatureAdminItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
