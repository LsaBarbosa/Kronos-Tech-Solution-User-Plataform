import { BadgeCheck, Building2, Clock3, IdCard, MapPin, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import { usuarioProfileTokens } from "@/features/user-profile/styles/usuario-profile.tokens";
import type { UsuarioIdentitySummary } from "@/features/user-profile/mappers/usuario-profile.mapper";

interface UserIdentityHeroProps {
  identity: UsuarioIdentitySummary | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

const HeroMetric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/90 backdrop-blur-sm">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{label}</p>
    <p className="mt-1 text-sm font-medium text-white">{value}</p>
  </div>
);

const UserIdentityHero = ({
  identity,
  loading = false,
  error,
  compact = false,
  title = "Meu perfil",
  subtitle = "Painel pessoal com identidade profissional, contato, segurança e LGPD.",
}: UserIdentityHeroProps) => {
  if (loading && !identity) {
    return (
      <Card className="overflow-hidden rounded-[28px] border-0 shadow-[0_18px_50px_rgba(16,42,67,0.08)]">
        <div className="grid gap-6 bg-white p-6 lg:grid-cols-[auto,1fr]">
          <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-slate-100" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!identity) {
    return (
      <Card
        className="overflow-hidden rounded-[28px] border-0 shadow-[0_18px_50px_rgba(16,42,67,0.08)]"
        style={{ background: usuarioProfileTokens.gradients.hero }}
      >
        <div className={cn("relative overflow-hidden p-6 text-white", compact ? "lg:p-5" : "lg:p-8")}>
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white/80">
              <BadgeCheck className="h-3.5 w-3.5" />
              {title}
            </div>
            <p className="max-w-2xl text-sm leading-6 text-white/80">
              {error ?? subtitle}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const isCompact = compact;

  return (
    <Card
      className={cn(
        "overflow-hidden border-0 shadow-[0_18px_50px_rgba(16,42,67,0.08)]",
        isCompact ? "rounded-[24px]" : "rounded-[28px]"
      )}
      style={{ background: usuarioProfileTokens.gradients.hero }}
    >
      <div className={cn("relative overflow-hidden text-white", isCompact ? "p-5" : "p-6 lg:p-8")}>
        <div className="absolute inset-0">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl" />
        </div>

        <div className={cn("relative grid gap-5", isCompact ? "lg:grid-cols-[auto,1fr]" : "lg:grid-cols-[auto,1fr]")}>
          <div className="flex items-start gap-4">
            <Avatar className={cn("ring-1 ring-white/20", isCompact ? "h-16 w-16" : "h-20 w-20")}>
              <AvatarFallback className="bg-white/10 text-lg font-semibold text-white">
                {identity.initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  <UserRound className="h-3.5 w-3.5" />
                  {title}
                </div>
                <h1 className={cn("font-semibold tracking-tight", isCompact ? "text-2xl" : "text-3xl lg:text-4xl")}>
                  {identity.fullName}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-white/80">
                  {subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill variant={identity.accountStatusTone} className="border-white/20 bg-white/10 text-white">
                  {identity.accountStatusLabel}
                </StatusPill>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                  {identity.roleLabel}
                </Badge>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                  {identity.homeOfficeLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <HeroMetric label="Cargo" value={identity.jobPosition} />
            <HeroMetric label="Empresa" value={identity.companyName} />
            <HeroMetric label="CPF" value={identity.maskedCpf} />
            <HeroMetric label="Remuneração" value={identity.salaryLabel} />
            <HeroMetric label="Última atividade" value={identity.lastSeenMessageLabel} />
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Empresa</p>
            </div>
            <p className="mt-2 text-sm font-medium text-white">{identity.companyName}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4 text-cyan-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">CPF mascarado</p>
            </div>
            <p className="mt-2 text-sm font-medium text-white">{identity.maskedCpf}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-cyan-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Jornada</p>
            </div>
            <p className="mt-2 text-sm font-medium text-white">{identity.homeOfficeLabel}</p>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2 text-xs text-white/80">
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            {identity.username}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            {identity.userId}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            {identity.addressLine}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            {identity.cityStateLine}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default UserIdentityHero;
