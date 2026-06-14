import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  IdCard,
  LockKeyhole,
  Phone,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { APP_PATHS } from "@/config/app-routes";
import type { UsuarioProfileSharedProps } from "./user-profile.types";
import UserIdentityHero from "./UserIdentityHero";
import ProfessionalIdentityCard from "./ProfessionalIdentityCard";
import EditableContactCard from "./EditableContactCard";
import SecurityPasswordCard from "./SecurityPasswordCard";
import PrivacyLgpdPanel from "./PrivacyLgpdPanel";
import SensitiveActionConfirmDialog from "./SensitiveActionConfirmDialog";

const desktopSectionNav = [
  {
    id: "identidade",
    label: "Identidade",
    description: "Dados profissionais e status da conta",
    icon: IdCard,
  },
  {
    id: "contato",
    label: "Contato",
    description: "E-mail e telefone próprios",
    icon: Phone,
  },
  {
    id: "senha",
    label: "Senha",
    description: "Troca de credencial com saída segura",
    icon: LockKeyhole,
  },
  {
    id: "lgpd",
    label: "LGPD",
    description: "Biometria, histórico e exportação",
    icon: ShieldCheck,
  },
] as const;

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const DesktopSummarySidebar = ({ profile }: Pick<UsuarioProfileSharedProps, "profile">) => {
  const identity = profile.identity;

  return (
    <Card className="sticky top-6 overflow-hidden rounded-[28px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
      <div
        className="h-28 bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#1C8C7C]"
      />
      <CardContent className="space-y-5 px-5 pb-5 pt-0">
        <div className="-mt-12 flex items-end gap-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-[#102A43] text-lg font-semibold text-white">
              {identity?.initials ?? "K"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 pb-1">
            <p className="text-sm font-semibold text-[#102A43]">{identity?.fullName ?? "Perfil indisponivel"}</p>
            <p className="text-xs text-[#627D98]">{identity?.username ?? "Nao informado"}</p>
            {identity ? (
              <StatusPill variant={identity.accountStatusTone}>{identity.accountStatusLabel}</StatusPill>
            ) : null}
          </div>
        </div>

        {identity ? (
          <div className="space-y-3 rounded-[22px] border border-[#D8E2EC] bg-[#D9E2EB] p-4">
            <div className="flex items-center gap-2 text-[#1F4E5F]">
              <BadgeCheck className="h-4 w-4" />
              <p className="text-sm font-semibold">Resumo protegido</p>
            </div>
            <div className="space-y-2 text-sm text-[#627D98]">
              <p>{identity.jobPosition}</p>
              <p>{identity.companyName}</p>
              <p>{identity.roleLabel}</p>
              <p>{identity.salaryLabel}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Navegação</p>
          <div className="space-y-2">
            {desktopSectionNav.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-[18px] border border-[#D8E2EC] bg-white px-4 py-3 text-left hover:bg-[#D9E2EB] hover:text-[#102A43]"
                  onClick={() => scrollToSection(item.id)}
                >
                  <Icon className="h-4 w-4 text-[#1F4E5F]" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-[#102A43]">{item.label}</span>
                    <span className="block text-xs font-normal text-[#627D98]">{item.description}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#627D98]" />
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Ações rápidas</p>
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
              onClick={() => void window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <RefreshCcw className="h-4 w-4" />
              Voltar ao topo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UsuarioDesktopView = ({
  profile,
  actions,
  loadingProfile,
  loadingPrivacy,
  profileError,
  biometricStatusError,
  currentBiometricTermError,
  consentHistoryError,
  processingCatalogError,
  onRefreshProfile,
  onRefreshPrivacy,
}: UsuarioProfileSharedProps) => {
  const navigate = useNavigate();
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#D9E2EB] text-[#102A43]">
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-[-6rem] h-72 w-72 rounded-full bg-[#22B8CF]/10 blur-3xl" />
        <div className="absolute right-[-5rem] top-32 h-80 w-80 rounded-full bg-[#635BFF]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#1C8C7C]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1680px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="hidden lg:block lg:w-[320px]">
          <DesktopSummarySidebar profile={profile} />
        </div>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4 rounded-[28px] border border-[#D8E2EC] bg-white/90 p-5 shadow-[0_12px_30px_rgba(31,78,95,0.08)] backdrop-blur">
            <div className="space-y-2">
              <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#1F4E5F]">
                Central pessoal
              </Badge>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-[#102A43]">Meu perfil</h1>
                <p className="max-w-3xl text-sm leading-6 text-[#627D98]">
                  Painel de gestão pessoal para identidade profissional, contato, segurança e LGPD. O layout desktop prioriza densidade e navegação lateral persistente.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                onClick={() => navigate(APP_PATHS.dashboard)}
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar ao início
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                onClick={() => void onRefreshProfile()}
              >
                <RefreshCcw className="h-4 w-4" />
                Atualizar perfil
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                onClick={() => void onRefreshPrivacy()}
              >
                <ShieldCheck className="h-4 w-4" />
                Atualizar LGPD
              </Button>
            </div>
          </header>

          {profileError ? (
            <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              {profileError}
            </div>
          ) : null}

          <UserIdentityHero identity={profile.identity} loading={loadingProfile} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),360px]">
            <div className="space-y-6">
              <section id="identidade">
                <ProfessionalIdentityCard
                  identity={profile.identity}
                  loading={loadingProfile}
                  error={profileError}
                />
              </section>

              <section id="contato">
                <EditableContactCard
                  contact={profile.contact}
                  isSaving={actions.isSavingContact}
                  error={profileError}
                  onSave={actions.saveContact}
                />
              </section>

              <section id="senha">
                <SecurityPasswordCard
                  security={profile.security}
                  isChanging={actions.isChangingPassword}
                  error={profileError}
                  onChangePassword={actions.changeUserPassword}
                />
              </section>

              <section id="lgpd">
                <PrivacyLgpdPanel
                  privacy={profile.privacy}
                  loading={loadingPrivacy}
                  isExportingData={actions.isExportingData}
                  isRevokingBiometric={actions.isRevokingBiometric}
                  lastExportManifest={actions.lastExportManifest}
                  biometricError={biometricStatusError}
                  currentTermError={currentBiometricTermError}
                  consentHistoryError={consentHistoryError}
                  processingCatalogError={processingCatalogError}
                  onExport={actions.exportUserData}
                  onClearExportManifest={actions.clearExportManifest}
                  onRequestBiometricRevocation={() => setRevokeDialogOpen(true)}
                />
              </section>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
                <CardContent className="space-y-4 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                    Segurança de leitura
                  </p>
                  <p className="text-sm leading-6 text-[#627D98]">
                    A remuneração aparece protegida por padrão, o CPF fica mascarado e a biometria facial nunca é exposta.
                  </p>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Contato próprio</p>
                      <p className="mt-1 text-sm font-medium text-[#102A43]">
                        Apenas e-mail e telefone podem ser editados por esta tela.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Sessão</p>
                      <p className="mt-1 text-sm font-medium text-[#102A43]">
                        Troca de senha e revogação biométrica encerram a sessão em segurança.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">LGPD</p>
                      <p className="mt-1 text-sm font-medium text-[#102A43]">
                        Exportação própria e histórico de consentimentos permanecem visíveis em painel dedicado.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <SensitiveActionConfirmDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revogar consentimento biométrico?"
        description="Essa ação desativa a biometria facial da sua conta e encerra a sessão atual."
        warning="O cancelamento é irreversível nesta tela. Para reativar a biometria, será necessário novo aceite."
        confirmLabel="Revogar biometria"
        isSubmitting={actions.isRevokingBiometric}
        onConfirm={actions.revokeBiometricConsent}
      />
    </div>
  );
};

export default UsuarioDesktopView;
