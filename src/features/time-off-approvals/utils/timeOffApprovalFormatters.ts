import type { RecordStatus, TimeRecordResponse } from "@/types/recordApproval";
import { resolveDocumentId } from "@/utils/document-resolution";
import type {
  TimeOffApprovalViewModel,
  TimeOffStatusTone,
} from "../types";

export const formatBackendDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";

  const [datePart] = dateString.split(" ");
  const parts = datePart.split(/[-/.]/);
  if (parts.length !== 3) return dateString;

  const [day, month, year] = parts;
  const shortYear = year.length === 4 ? year.slice(-2) : year;
  return `${day}/${month}/${shortYear}`;
};

const PENDING_STATUSES: RecordStatus[] = ["TIME_OFF_REQUEST", "WORK_TIME_REQUEST"];
const APPROVED_STATUSES: RecordStatus[] = ["TIME_OFF", "UPDATED"];
const REJECTED_STATUSES: RecordStatus[] = [
  "TIME_OFF_REJECTED",
  "WORK_TIME_REJECTED",
  "UPDATE_REJECTED",
];

export const isPendingStatus = (status: RecordStatus | undefined | null) =>
  status ? PENDING_STATUSES.includes(status) : false;
export const isApprovedStatus = (status: RecordStatus | undefined | null) =>
  status ? APPROVED_STATUSES.includes(status) : false;
export const isRejectedStatus = (status: RecordStatus | undefined | null) =>
  status ? REJECTED_STATUSES.includes(status) : false;

const STATUS_LABELS: Partial<Record<RecordStatus, string>> = {
  TIME_OFF_REQUEST: "Abono pendente",
  WORK_TIME_REQUEST: "Esquecimento pendente",
  TIME_OFF: "Abono aprovado",
  UPDATED: "Ajuste aprovado",
  TIME_OFF_REJECTED: "Abono rejeitado",
  WORK_TIME_REJECTED: "Esquecimento rejeitado",
  UPDATE_REJECTED: "Ajuste rejeitado",
};

const PENDING_TONE: TimeOffStatusTone = {
  badgeClass: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  dotClass: "bg-[#F59E0B]",
};

const APPROVED_TONE: TimeOffStatusTone = {
  badgeClass: "border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
  dotClass: "bg-[#16A34A]",
};

const REJECTED_TONE: TimeOffStatusTone = {
  badgeClass: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
  dotClass: "bg-[#DC2626]",
};

const NEUTRAL_TONE: TimeOffStatusTone = {
  badgeClass: "border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  dotClass: "bg-[#94A3B8]",
};

export const getStatusTone = (status: RecordStatus | undefined | null): TimeOffStatusTone => {
  if (isPendingStatus(status)) return PENDING_TONE;
  if (isApprovedStatus(status)) return APPROVED_TONE;
  if (isRejectedStatus(status)) return REJECTED_TONE;
  return NEUTRAL_TONE;
};

const getKind = (status: RecordStatus): TimeOffApprovalViewModel["kindKey"] => {
  if (status === "TIME_OFF_REQUEST" || status === "TIME_OFF" || status === "TIME_OFF_REJECTED") {
    return "time-off";
  }
  if (status === "WORK_TIME_REQUEST" || status === "WORK_TIME_REJECTED") {
    return "work-time";
  }
  if (status === "UPDATED" || status === "UPDATE_REJECTED") {
    return "update";
  }
  return "other";
};

const KIND_LABEL: Record<TimeOffApprovalViewModel["kindKey"], string> = {
  "time-off": "Abono de horas",
  "work-time": "Esquecimento de ponto",
  update: "Ajuste de registro",
  other: "Registro",
};

export const buildApprovalViewModel = (
  record: TimeRecordResponse
): TimeOffApprovalViewModel => {
  const status = record.statusRecord;
  const kind = getKind(status);

  return {
    record,
    employeeName: record.employeeData?.employeeName ?? "—",
    companyName: record.employeeData?.companyName ?? "",
    formattedStartDate: formatBackendDate(record.startWork),
    formattedEndDate: formatBackendDate(record.endWork),
    startHour: record.startHour,
    endHour: record.endHour,
    hoursWork: record.hoursWork,
    documentId: resolveDocumentId(record),
    isPending: isPendingStatus(status),
    isApproved: isApprovedStatus(status),
    isRejected: isRejectedStatus(status),
    statusKind: isPendingStatus(status)
      ? "pending"
      : isApprovedStatus(status)
        ? "approved"
        : isRejectedStatus(status)
          ? "rejected"
          : "other",
    statusLabel: STATUS_LABELS[status] ?? status,
    statusTone: getStatusTone(status),
    kindLabel: KIND_LABEL[kind],
    kindKey: kind,
  };
};

export const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};
