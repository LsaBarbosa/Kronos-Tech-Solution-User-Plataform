import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Fingerprint, MoreVertical, Power, Pencil, UserX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CollaboratorRecord } from "../types/collaborator-view.types";
import { formatPhone, getToneClass } from "../utils/collaborator-formatters";

type CollaboratorMobileCardProps = {
  record: CollaboratorRecord;
  selected: boolean;
  onSelect: (record: CollaboratorRecord) => void;
  onOpenDetails: (record: CollaboratorRecord) => void;
  onEdit: (record: CollaboratorRecord) => void;
  onRequestToggle: (record: CollaboratorRecord) => void;
  onOpenBiometric: (record: CollaboratorRecord) => void;
};

const StateBadge = ({
  text,
  tone,
}: {
  text: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) => <Badge className={cn("border text-xs", getToneClass(tone))}>{text}</Badge>;

export const CollaboratorMobileCard = ({
  record,
  selected,
  onSelect,
  onOpenDetails,
  onEdit,
  onRequestToggle,
  onOpenBiometric,
}: CollaboratorMobileCardProps) => {
  return (
    <Card
      onClick={() => onSelect(record)}
      className={cn(
        "rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all",
        selected && "border-[#2563EB] ring-2 ring-[#2563EB]/12"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 border border-[#CBD5E1] bg-[#EEF4FB]">
          <AvatarFallback className="bg-[#EEF4FB] font-semibold text-[#1E3A8A]">
            {record.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-[#0F172A]">{record.fullName}</div>
              <div className="truncate text-sm text-[#64748B]">{record.jobPosition}</div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-full border border-[#E2E8F0] bg-white"
                  aria-label={`Abrir ações de ${record.fullName}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => onOpenDetails(record)}>
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(record)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar cadastro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenBiometric(record)}>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Biometria
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onRequestToggle(record)}>
                  <Power className={cn("mr-2 h-4 w-4", record.active ? "text-[#DC2626]" : "text-[#16A34A]")} />
                  {record.active ? "Desativar" : "Reativar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <StateBadge text={record.roleLabel} tone="neutral" />
            <StateBadge text={record.active ? "Ativo" : "Inativo"} tone={record.active ? "success" : "danger"} />
            <StateBadge text={record.homeOffice ? "Home office" : "Presencial"} tone={record.homeOffice ? "neutral" : "warning"} />
            <StateBadge text={record.biometricLabel} tone={record.biometricTone} />
          </div>

          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-[#64748B]">
              <UserX className="h-4 w-4" />
              <span className="truncate">{record.hasAccount ? record.username : "Conta sem usuário"}</span>
            </div>
            <div className="truncate text-[#64748B]">{record.scheduleLabel}</div>
            <div className="truncate text-[#64748B]">{record.email}</div>
            <div className="truncate text-[#64748B]">{formatPhone(record.phone)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
