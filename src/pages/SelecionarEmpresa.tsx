import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getMyCompanies, type AccessibleCompany } from "@/service/user-company.service";
import { switchCompany } from "@/service/auth.service";
import { toast } from "@/hooks/use-toast";
import { APP_PATHS } from "@/config/app-routes";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

const SelecionarEmpresa = () => {
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  const [companies, setCompanies] = useState<AccessibleCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getMyCompanies()
      .then((list) => {
        if (cancelled) return;
        const active = list.filter((c) => c.active);
        if (active.length === 0) {
          navigate(APP_PATHS.dashboard, { replace: true });
          return;
        }
        if (active.length === 1) {
          void handleSelect(active[0].companyId);
          return;
        }
        setCompanies(active);
      })
      .catch(() => {
        if (!cancelled) navigate(APP_PATHS.dashboard, { replace: true });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = useCallback(
    async (companyId: string) => {
      setSwitchingId(companyId);
      try {
        await switchCompany(companyId);
        await checkSession();
        navigate(APP_PATHS.dashboard, { replace: true });
      } catch (error) {
        toast({
          title: "Erro ao selecionar empresa",
          description: getServiceErrorMessage(error, "Tente novamente."),
          variant: "destructive",
        });
        setSwitchingId(null);
      }
    },
    [checkSession, navigate]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
            <Building2 className="h-7 w-7 text-[#2563EB]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Selecionar empresa</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Você tem acesso a mais de uma empresa. Escolha com qual deseja trabalhar agora.
          </p>
        </div>

        <Card className="border-[#E2E8F0] shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)]">
          <CardContent className="divide-y divide-[#F1F5F9] p-0">
            {companies.map((company) => {
              const isSwitching = switchingId === company.companyId;
              return (
                <Button
                  key={company.companyId}
                  variant="ghost"
                  disabled={switchingId !== null}
                  onClick={() => void handleSelect(company.companyId)}
                  className="flex h-auto w-full items-center justify-between rounded-none px-5 py-4 text-left first:rounded-t-lg last:rounded-b-lg hover:bg-[#EFF6FF]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE]">
                      <Building2 className="h-4 w-4 text-[#2563EB]" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-[#0F172A]">{company.companyName}</p>
                      <p className="text-xs text-[#64748B]">{company.role}</p>
                    </div>
                  </div>
                  {isSwitching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                  )}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelecionarEmpresa;
