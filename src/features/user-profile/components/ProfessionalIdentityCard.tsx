import {
  BadgeCheck,
  Briefcase,
  Building2,
  Clock3,
  DollarSign,
  Home,
  IdCard,
  MapPin,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import type { ReactNode } from "react";
import type { UsuarioIdentitySummary } from "@/features/user-profile/mappers/usuario-profile.mapper";

interface ProfessionalIdentityCardProps {
  identity: UsuarioIdentitySummary | null;
  loading?: boolean;
  error?: string | null;
}

const Field = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-[#D8E2EC] bg-white px-4 py-3 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#D9E2EB] text-[#1F4E5F]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-[#102A43]">{value}</p>
      </div>
    </div>
  </div>
);

const ProfessionalIdentityCard = ({
  identity,
  loading = false,
  error,
}: ProfessionalIdentityCardProps) => {
  if (loading && !identity) {
    return (
      <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
        <CardHeader className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!identity) {
    return (
      <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
        <CardHeader>
          <CardTitle className="text-xl text-[#102A43]">Identidade profissional</CardTitle>
          <CardDescription className="text-[#627D98]">
            {error ?? "Nao foi possivel carregar os dados profissionais."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            compact
            icon={<BadgeCheck className="h-6 w-6" />}
            title="Perfil indisponivel"
            description="Os dados de colaborador nao foram carregados."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-xl text-[#102A43]">Identidade profissional</CardTitle>
            <CardDescription className="max-w-2xl text-[#627D98]">
              Base consultiva do seu cadastro. Os campos sensíveis permanecem protegidos e não podem ser alterados aqui.
            </CardDescription>
          </div>
          <StatusPill variant={identity.accountStatusTone}>
            {identity.accountStatusLabel}
          </StatusPill>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
            <UserRound className="mr-1 h-3.5 w-3.5" />
            {identity.roleLabel}
          </Badge>
          <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
            <Briefcase className="mr-1 h-3.5 w-3.5" />
            {identity.jobPosition}
          </Badge>
          <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
            <Building2 className="mr-1 h-3.5 w-3.5" />
            {identity.companyName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Field icon={<IdCard className="h-4 w-4" />} label="CPF mascarado" value={identity.maskedCpf} />
          <Field icon={<DollarSign className="h-4 w-4" />} label="Remuneração protegida" value={identity.salaryLabel} />
          <Field icon={<Home className="h-4 w-4" />} label="Modelo de jornada" value={identity.homeOfficeLabel} />
          <Field icon={<MapPin className="h-4 w-4" />} label="Endereço" value={identity.addressLine} />
          <Field icon={<MapPin className="h-4 w-4" />} label="Cidade e UF" value={identity.cityStateLine} />
          <Field icon={<Clock3 className="h-4 w-4" />} label="Última atividade" value={identity.lastSeenMessageLabel} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Usuário</p>
            <p className="mt-2 text-sm font-medium text-[#102A43]">{identity.username}</p>
          </div>
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Localização</p>
            <p className="mt-2 text-sm font-medium text-[#102A43]">{identity.postalCode}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8E2EC] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">Status protegido</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
              <BadgeCheck className="mr-1 h-3.5 w-3.5" />
              Empresa não editável
            </Badge>
            <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
              <BadgeCheck className="mr-1 h-3.5 w-3.5" />
              Salário protegido
            </Badge>
            <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
              <BadgeCheck className="mr-1 h-3.5 w-3.5" />
              Papel não editável
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalIdentityCard;
