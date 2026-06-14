import { useState } from "react";
import { ArrowRight, ChevronLeft, RefreshCcw, Phone, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { APP_PATHS } from "@/config/app-routes";
import type { UsuarioProfileSharedProps, UsuarioMobileSection } from "./user-profile.types";
import UserIdentityHero from "./UserIdentityHero";
import ProfessionalIdentityCard from "./ProfessionalIdentityCard";
import PrivacyLgpdPanel from "./PrivacyLgpdPanel";
import SensitiveActionConfirmDialog from "./SensitiveActionConfirmDialog";
import MobileSectionChips from "./MobileSectionChips";
import MobileBottomNavigation from "./MobileBottomNavigation";
import MobileEditContactSheet from "./MobileEditContactSheet";
import MobilePasswordFlowSheet from "./MobilePasswordFlowSheet";

const UsuarioMobileView = ({
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
  const [section, setSection] = useState<UsuarioMobileSection>("identidade");
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F8FB] text-[#102A43]">
      <div className="absolute inset-0">
        <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-[#22B8CF]/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-56 w-56 rounded-full bg-[#635BFF]/10 blur-3xl" />
      </div>

      <main className="relative mx-auto min-h-screen max-w-3xl space-y-5 px-4 pb-36 pt-4 sm:px-6">
        <header className="flex flex-col gap-3 rounded-[24px] border border-[#D8E2EC] bg-white/92 px-4 py-3 shadow-[0_12px_30px_rgba(31,78,95,0.08)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Badge variant="outline" className="border-[#D8E2EC] bg-[#F5F8FB] text-[#1F4E5F]">
              Autoatendimento
            </Badge>
            <p className="text-sm font-semibold text-[#102A43]">Meu perfil</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 border-[#D8E2EC] bg-white text-[#102A43]"
            onClick={() => navigate(APP_PATHS.dashboard)}
          >
            <ChevronLeft className="h-4 w-4" />
            Início
          </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-[#D8E2EC] bg-white text-[#102A43]"
            onClick={() => void onRefreshProfile()}
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </header>

        {profileError ? (
          <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {profileError}
          </div>
        ) : null}

        <UserIdentityHero
          identity={profile.identity}
          loading={loadingProfile}
          compact
          subtitle="App de autoatendimento com navegação por chips e fluxos dedicados para contato, senha e LGPD."
        />

        <MobileSectionChips value={section} onChange={setSection} />

        {section === "identidade" ? (
          <div className="space-y-4">
            <ProfessionalIdentityCard
              identity={profile.identity}
              loading={loadingProfile}
              error={profileError}
            />
            <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#102A43]">Visão rápida</p>
                    <p className="text-sm leading-6 text-[#627D98]">
                      O modo mobile prioriza leitura rápida e ações dedicadas em sheets.
                    </p>
                  </div>
                  {profile.identity ? (
                    <StatusPill variant={profile.identity.accountStatusTone}>
                      {profile.identity.accountStatusLabel}
                    </StatusPill>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">CPF</p>
                    <p className="mt-1 text-sm font-medium text-[#102A43]">
                      {profile.identity?.maskedCpf ?? "Nao informado"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Remuneração</p>
                    <p className="mt-1 text-sm font-medium text-[#102A43]">
                      {profile.identity?.salaryLabel ?? "Protegida"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {section === "contato" ? (
          <div className="space-y-4">
            <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#102A43]">Contato próprio</p>
                    <p className="text-sm leading-6 text-[#627D98]">
                      Atualize e-mail e telefone em um fluxo dedicado de bottom sheet.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-[#D8E2EC] bg-[#F5F8FB] text-[#1F4E5F]">
                    Editável
                  </Badge>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">E-mail</p>
                    <p className="mt-1 break-words text-sm font-medium text-[#102A43]">
                      {profile.contact?.email || "Nao informado"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Telefone</p>
                    <p className="mt-1 text-sm font-medium text-[#102A43]">
                      {profile.contact?.phoneDisplay || profile.contact?.phone || "Nao informado"}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  className="h-11 w-full bg-[#1F4E5F] text-white hover:bg-[#102A43]"
                  onClick={() => setContactSheetOpen(true)}
                  disabled={Boolean(profileError)}
                >
                  <Phone className="h-4 w-4" />
                  Editar contato
                </Button>
                {profileError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    <p className="font-medium">Contato indisponivel</p>
                    <p className="mt-1">{profileError}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {section === "senha" ? (
          <div className="space-y-4">
            <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#102A43]">Fluxo de senha</p>
                    <p className="text-sm leading-6 text-[#627D98]">
                      A alteração é feita em fluxo próprio e encerra a sessão em segurança.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-[#D8E2EC] bg-[#F5F8FB] text-[#1F4E5F]">
                    Sessão
                  </Badge>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="flex items-start gap-2">
                    <LockKeyhole className="mt-0.5 h-4 w-4 text-amber-700" aria-hidden="true" />
                    <div className="space-y-1">
                      <p className="font-medium">A troca encerra a sessão atual.</p>
                      <p>{profile.security.passwordWarning}</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  className="h-11 w-full bg-[#102A43] text-white hover:bg-[#1F4E5F]"
                  onClick={() => setPasswordSheetOpen(true)}
                  disabled={Boolean(profileError)}
                >
                  <ArrowRight className="h-4 w-4" />
                  Abrir fluxo de senha
                </Button>
                {profileError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    <p className="font-medium">Senha indisponivel</p>
                    <p className="mt-1">{profileError}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {section === "lgpd" ? (
          <div className="space-y-4">
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
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-[#D8E2EC] bg-white text-[#102A43]"
              onClick={() => void onRefreshPrivacy()}
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar privacidade
            </Button>
          </div>
        ) : null}
      </main>

      <MobileBottomNavigation value={section} onChange={setSection} />

      <MobileEditContactSheet
        open={contactSheetOpen}
        contact={profile.contact}
        isSaving={actions.isSavingContact}
        onOpenChange={setContactSheetOpen}
        onSave={actions.saveContact}
      />

      <MobilePasswordFlowSheet
        open={passwordSheetOpen}
        security={profile.security}
        isChanging={actions.isChangingPassword}
        onOpenChange={setPasswordSheetOpen}
        onChangePassword={actions.changeUserPassword}
      />

      <SensitiveActionConfirmDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revogar consentimento biométrico?"
        description="A revogação encerra a sessão atual e desativa a biometria facial da sua conta."
        warning="Para reativar a biometria será necessário um novo aceite do termo."
        confirmLabel="Revogar biometria"
        isSubmitting={actions.isRevokingBiometric}
        onConfirm={actions.revokeBiometricConsent}
      />
    </div>
  );
};

export default UsuarioMobileView;
