import { AlertTriangle, Briefcase, Building, DollarSign, Eye, EyeOff, Mail, Phone, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatPhone, formatSalary, getFirstName, getSecondName } from "@/utils/dashboard-utils";
import type { DashboardCommandCenterData } from "./dashboard-command-center.types";

interface DashboardProfilePanelProps {
  variant: "desktop" | "mobile";
  data: DashboardCommandCenterData;
  onOpenProfile: () => void;
  onOpenEmpresa?: () => void;
}

const DashboardProfilePanel = ({
  variant,
  data,
  onOpenProfile,
  onOpenEmpresa,
}: DashboardProfilePanelProps) => {
  const firstName = getFirstName(data.userData?.fullName);
  const secondName = data.userData?.fullName ? getSecondName(data.userData.fullName) : "";
  const showCtoActions = data.isCto && onOpenEmpresa;

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 shadow-sm transition",
        "cursor-pointer hover:border-[#2563EB] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
      )}
      role="button"
      tabIndex={0}
      aria-label="Abrir detalhes do colaborador"
      onClick={onOpenProfile}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenProfile();
        }
      }}
    >
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Perfil e segurança
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">Sua conta</h2>
      </div>
      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#5B21B6]"
          >
            <User2 className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-base font-semibold text-[#0F172A]">{firstName}</p>
            {secondName ? (
              <p className="line-clamp-1 text-sm text-[#475569]">{secondName}</p>
            ) : null}
            <p className="mt-0.5 text-xs text-[#64748B]">
              {data.userData?.jobPosition || "Cargo não informado"} ·{" "}
              <span className="font-semibold text-[#0F172A]">{data.roleLabel}</span>
            </p>
          </div>
          {showCtoActions ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1 border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6] hover:bg-[#EDE9FE]"
              onClick={(event) => {
                event.stopPropagation();
                onOpenEmpresa?.();
              }}
              aria-label="Gerenciar empresa"
              title="Gerenciar empresa"
            >
              <Briefcase className="h-4 w-4" />
              Empresa
            </Button>
          ) : null}
        </div>

        <Separator />

        {data.profileUnavailable ? (
          <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-3 py-2.5 text-[11px] leading-5 text-[#B91C1C]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Não foi possível carregar este bloco. Atualize a página para buscar o perfil novamente.
            </span>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-[#475569]">
              <Building className="h-4 w-4 text-[#2563EB]" />
              <span className="truncate text-[#0F172A]">{data.userData?.companyName || "N/A"}</span>
            </p>
            <p className="flex items-center gap-2 text-[#475569]">
              <Mail className="h-4 w-4 text-[#2563EB]" />
              <span className="truncate text-[#0F172A]">{data.userData?.email || "N/A"}</span>
            </p>
            <p className="flex items-center gap-2 text-[#475569]">
              <Phone className="h-4 w-4 text-[#2563EB]" />
              <span className="text-[#0F172A]">{formatPhone(data.userData?.phone)}</span>
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2.5">
              <DollarSign className="h-5 w-5 shrink-0 text-[#5B21B6]" />
              <span className="flex-1 text-base font-semibold text-[#5B21B6]">
                {data.showSalary ? formatSalary(data.userData?.salary) : "R$ *****,**"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#5B21B6] hover:bg-[#EDE9FE]"
                onClick={(event) => {
                  event.stopPropagation();
                  data.toggleSalary();
                }}
                aria-label={data.showSalary ? "Ocultar salário" : "Exibir salário"}
                title={data.showSalary ? "Ocultar salário" : "Exibir salário"}
              >
                {data.showSalary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {variant === "mobile" ? null : (
          <p className="text-[11px] text-[#94A3B8]">
            Toque/click no card para abrir a tela completa do perfil.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardProfilePanel;
