import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Fingerprint, Pencil, Power, ShieldCheck, UserX } from "lucide-react";
import type { CollaboratorRecord } from "../types/collaborator-view.types";
import { getToneClass } from "../utils/collaborator-formatters";

type CollaboratorTableProps = {
  records: CollaboratorRecord[];
  selectedId: string | null;
  onSelect: (employeeId: string) => void;
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
}) => (
  <Badge className={cn("border text-xs font-medium", getToneClass(tone))}>{text}</Badge>
);

export const CollaboratorTable = ({
  records,
  selectedId,
  onSelect,
  onEdit,
  onRequestToggle,
  onOpenBiometric,
}: CollaboratorTableProps) => {
  return (
    <Card className="overflow-hidden rounded-[26px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#F1F5F9]">
            <TableRow className="hover:bg-[#F1F5F9]">
              <TableHead className="min-w-[280px] text-[#64748B]">Colaborador</TableHead>
              <TableHead className="min-w-[160px] text-[#64748B]">Perfil</TableHead>
              <TableHead className="min-w-[240px] text-[#64748B]">Jornada</TableHead>
              <TableHead className="min-w-[180px] text-[#64748B]">Status</TableHead>
              <TableHead className="min-w-[160px] text-[#64748B]">Biometria</TableHead>
              <TableHead className="min-w-[168px] text-right text-[#64748B]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const isSelected = selectedId === record.employeeId;

              return (
                <TableRow
                  key={record.employeeId}
                  onClick={() => onSelect(record.employeeId)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected && "bg-[#EEF4FB] hover:bg-[#EEF4FB]"
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-[#CBD5E1] bg-[#EEF4FB]">
                        <AvatarFallback className="bg-[#EEF4FB] font-semibold text-[#1E3A8A]">
                          {record.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-[#0F172A]">{record.fullName}</div>
                          {!record.hasAccount && (
                            <Badge className="border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B]">Conta sem usuário</Badge>
                          )}
                        </div>
                        <div className="text-sm text-[#64748B]">{record.jobPosition}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={cn("border text-xs", record.role === "MANAGER" ? "border-[#2563EB]/25 bg-[#EEF4FB] text-[#1E3A8A]" : "border-[#CBD5E1] bg-white text-[#64748B]")}>
                        {record.roleLabel}
                      </Badge>
                      <div className="text-sm text-[#64748B]">{record.hasAccount ? record.username : "Conta sem usuário"}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[#0F172A]">{record.scheduleLabel}</div>
                      <div className="text-xs text-[#64748B]">{record.companyName}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <StateBadge text={record.active ? "Ativo" : "Inativo"} tone={record.active ? "success" : "danger"} />
                      <StateBadge text={record.homeOffice ? "Home office" : "Presencial"} tone={record.homeOffice ? "neutral" : "warning"} />
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <StateBadge text={record.biometricLabel} tone={record.biometricTone} />
                      {record.hasAccount ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <UserX className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(record);
                        }}
                        className="h-9 w-9 rounded-full text-[#2563EB]"
                        aria-label={`Editar ${record.fullName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenBiometric(record);
                        }}
                        className="h-9 w-9 rounded-full text-[#1E3A8A]"
                        aria-label={`Biometria de ${record.fullName}`}
                      >
                        <Fingerprint className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRequestToggle(record);
                        }}
                        className={cn(
                          "h-9 w-9 rounded-full",
                          record.active ? "text-[#DC2626]" : "text-[#16A34A]"
                        )}
                        aria-label={`${record.active ? "Desativar" : "Reativar"} ${record.fullName}`}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
