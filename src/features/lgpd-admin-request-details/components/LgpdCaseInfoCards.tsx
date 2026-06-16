import { Building2, User, UserCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { LgpdRequestDetailsResponse } from "@/service/lgpd.service";
import { formatLgpdDateTime } from "../utils/lgpdCaseFormatters";

interface LgpdCaseInfoCardsProps {
  request: LgpdRequestDetailsResponse;
}

const InfoLine = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-0.5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
      {label}
    </p>
    <p className="text-sm font-medium text-[#0F172A] break-words">{value || "—"}</p>
  </div>
);

export const LgpdCaseInfoCards = ({ request }: LgpdCaseInfoCardsProps) => {
  return (
    <div className="space-y-3">
      <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#1F4E5F]" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Titular
            </p>
          </div>
          <InfoLine label="Nome" value={request.employee.fullName} />
          <InfoLine label="E-mail" value={request.employee.email} />
          <InfoLine label="Cargo" value={request.employee.jobPosition} />
        </div>
      </Card>

      <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#0F766E]" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Empresa
            </p>
          </div>
          <InfoLine label="Razão social" value={request.company.tradeName} />
          <InfoLine label="CNPJ" value={request.company.cnpj} />
        </div>
      </Card>

      <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCircle2 className="h-4 w-4 text-[#1D4ED8]" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Responsável
            </p>
          </div>
          {request.assignedTo ? (
            <>
              <InfoLine label="Usuário" value={request.assignedTo.username} />
              <InfoLine label="Papel" value={request.assignedTo.role} />
            </>
          ) : (
            <p className="text-sm text-[#94A3B8]">Não atribuído</p>
          )}
        </div>
      </Card>

      <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Datas
          </p>
          <InfoLine label="Criação" value={formatLgpdDateTime(request.request.createdAt)} />
          <InfoLine
            label="Última atualização"
            value={formatLgpdDateTime(request.request.updatedAt)}
          />
          {request.request.resolvedAt ? (
            <InfoLine label="Resolvida em" value={formatLgpdDateTime(request.request.resolvedAt)} />
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default LgpdCaseInfoCards;
