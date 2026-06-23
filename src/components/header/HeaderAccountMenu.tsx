import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, LogOut, ShieldCheck, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_PATHS } from "@/config/app-routes";
import { cn } from "@/lib/utils";
import { getInitials } from "./header.helpers";
import HeaderRoleChip from "./HeaderRoleChip";
import { switchCompany } from "@/service/auth.service";
import { getMyCompanies, type AccessibleCompany } from "@/service/user-company.service";

interface HeaderAccountMenuProps {
  fullName: string | null | undefined;
  email: string | null | undefined;
  role: string | null | undefined;
  variant: "desktop" | "mobile";
  onLogout: () => Promise<void>;
}

const HeaderAccountMenu = ({
  fullName,
  email,
  role,
  variant,
  onLogout,
}: HeaderAccountMenuProps) => {
  const navigate = useNavigate();
  const initials = getInitials(fullName);

  const [companies, setCompanies] = useState<AccessibleCompany[]>([]);
  const [loadingSwitch, setLoadingSwitch] = useState(false);

  useEffect(() => {
    getMyCompanies()
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, []);

  const handleProfile = () => navigate(APP_PATHS.usuario);
  const handlePrivacy = () => navigate(APP_PATHS.privacidade);
  const handleLogout = async () => {
    await onLogout();
    navigate(APP_PATHS.login, { replace: true });
  };

  const handleSwitchCompany = async (companyId: string) => {
    if (loadingSwitch) return;
    setLoadingSwitch(true);
    try {
      await switchCompany(companyId);
      window.location.reload();
    } catch {
      setLoadingSwitch(false);
    }
  };

  const showCompanySwitcher = companies.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="Abrir menu de conta"
          className={cn(
            "gap-2 rounded-full border border-[#E2E8F0] bg-white px-1.5 py-1 text-[#0F172A] hover:bg-[#F1F5F9]",
            variant === "desktop" ? "pr-3" : ""
          )}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B1220] text-xs font-semibold text-white"
          >
            {initials}
          </span>
          {variant === "desktop" ? (
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold leading-tight">
                {fullName?.split(" ")[0] ?? "Perfil"}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-[#64748B]">
                {role || "Conta"}
              </span>
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl border-border/70 p-1.5 shadow-xl">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1220] text-sm font-semibold text-white"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0F172A]">
                {fullName || "Perfil"}
              </p>
              {email ? (
                <p className="truncate text-[11px] text-[#64748B]">{email}</p>
              ) : null}
              <div className="mt-1">
                <HeaderRoleChip role={role} size="xs" />
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleProfile} className="gap-2 px-3 py-2 text-sm">
          <User2 className="h-4 w-4 text-[#1D4ED8]" />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handlePrivacy} className="gap-2 px-3 py-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
          Privacidade e dados
        </DropdownMenuItem>

        {showCompanySwitcher && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 px-3 py-2 text-sm">
                <Building2 className="h-4 w-4 text-[#7C3AED]" />
                <span>Trocar empresa</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56 rounded-xl border-border/70 p-1 shadow-xl">
                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company.companyId}
                    disabled={loadingSwitch}
                    onSelect={() => void handleSwitchCompany(company.companyId)}
                    className="flex flex-col items-start gap-0.5 px-3 py-2 text-sm"
                  >
                    <span className="font-medium leading-tight">{company.companyName}</span>
                    <span className="text-[10px] uppercase tracking-wide text-[#64748B]">
                      {company.role}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void handleLogout();
          }}
          className="gap-2 px-3 py-2 text-sm text-[#B91C1C] focus:bg-[#FEE2E2] focus:text-[#B91C1C]"
        >
          <LogOut className="h-4 w-4" />
          Sair com segurança
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderAccountMenu;
