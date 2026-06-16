import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LGPD_REQUEST_TYPES } from "@/constants/lgpd.constants";
import type { LgpdRequestStatus, LgpdRequestType } from "@/service/lgpd.service";
import { getStatusTone, getTypeLabel } from "../utils/lgpd-formatters";

const ALL_SELECT_VALUE = "__ALL__";

const STATUS_OPTIONS: LgpdRequestStatus[] = [
  "OPEN",
  "IN_ANALYSIS",
  "WAITING_CONTROLLER",
  "WAITING_LEGAL_REVIEW",
  "APPROVED_FOR_EXPORT",
  "WAITING_DATA_SUBJECT",
  "COMPLETED",
  "REJECTED",
  "PARTIALLY_COMPLETED",
  "CANCELLED",
];

interface LgpdFiltersBarProps {
  employeeName: string;
  type?: LgpdRequestType;
  status?: LgpdRequestStatus;
  onEmployeeNameChange: (value: string) => void;
  onTypeChange: (type: LgpdRequestType | undefined) => void;
  onStatusChange: (status: LgpdRequestStatus | undefined) => void;
  variant?: "desktop" | "mobile";
}

export const LgpdFiltersBar = ({
  employeeName,
  type,
  status,
  onEmployeeNameChange,
  onTypeChange,
  onStatusChange,
  variant = "desktop",
}: LgpdFiltersBarProps) => {
  const handleTypeChange = (value: string) => {
    onTypeChange(value === ALL_SELECT_VALUE ? undefined : (value as LgpdRequestType));
  };

  const handleStatusChange = (value: string) => {
    onStatusChange(value === ALL_SELECT_VALUE ? undefined : (value as LgpdRequestStatus));
  };

  const isCompact = variant === "mobile";

  return (
    <div
      className={
        isCompact
          ? "space-y-3"
          : "grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]"
      }
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <Input
          placeholder={isCompact ? "Buscar titular ou empresa" : "Buscar por funcionário"}
          value={employeeName}
          onChange={(event) => onEmployeeNameChange(event.target.value)}
          className="h-11 rounded-2xl border-[#E2E8F0] bg-white pl-9 text-[#0F172A] placeholder:text-[#94A3B8]"
        />
      </div>

      <Select value={type ?? ALL_SELECT_VALUE} onValueChange={handleTypeChange}>
        <SelectTrigger className="h-11 rounded-2xl border-[#E2E8F0] bg-white text-left text-[#0F172A]">
          <SelectValue placeholder="Tipo: todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SELECT_VALUE}>Todas as Solicitações</SelectItem>
          {LGPD_REQUEST_TYPES.map((value) => (
            <SelectItem key={value} value={value}>
              {getTypeLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status ?? ALL_SELECT_VALUE} onValueChange={handleStatusChange}>
        <SelectTrigger className="h-11 rounded-2xl border-[#E2E8F0] bg-white text-left text-[#0F172A]">
          <SelectValue placeholder="Status: todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SELECT_VALUE}>Todos os Status</SelectItem>
          {STATUS_OPTIONS.map((value) => (
            <SelectItem key={value} value={value}>
              {getStatusTone(value).label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LgpdFiltersBar;
