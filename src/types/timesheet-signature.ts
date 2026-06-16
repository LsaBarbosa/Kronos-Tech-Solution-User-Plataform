export type TimesheetSignatureStatus = "ELIGIBLE" | "BLOCKED" | "ALREADY_SIGNED";

export interface PreviousMonthSignatureStatus {
  referenceYear: number;
  referenceMonth: number;
  periodStart: string;
  periodEnd: string;
  status: TimesheetSignatureStatus;
  eligible: boolean;
  alreadySigned: boolean;
  signatureId: string | null;
  signedAt: string | null;
  pointMirrorHashSha256: string | null;
  recordsSnapshotHashSha256: string | null;
  declarationVersion: string;
  declarationText: string;
  declarationHashSha256: string;
  blockers: string[];
}

export interface SignPreviousMonthRequest {
  referenceYear: number;
  referenceMonth: number;
  confirmed: boolean;
  declarationVersion: string;
  declarationHashSha256: string;
  recordsSnapshotHashSha256: string;
  password: string;
}

export interface SignPreviousMonthResponse {
  signatureId: string;
  referenceYear: number;
  referenceMonth: number;
  signedAt: string;
  signatureType: string;
  signatureMethod: string;
  pointMirrorHashSha256: string;
  recordsSnapshotHashSha256: string;
  pointMirrorDocumentId: string | null;
  declarationVersion: string;
}

export interface AdminTimesheetSignatureItem {
  signatureId: string;
  employeeId: string;
  employeeName: string;
  referenceYear: number;
  referenceMonth: number;
  signedAt: string;
  status: "ACTIVE" | "VOIDED";
  signatureType: string;
  signatureMethod: string;
  pointMirrorHashSha256: string;
}

export interface AdminTimesheetSignaturePage {
  items: AdminTimesheetSignatureItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
