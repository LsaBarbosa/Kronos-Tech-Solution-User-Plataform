import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCompanies } from "@/service/user-company.service";
import { APP_PATHS } from "@/config/app-routes";

export const usePostLoginRedirect = () => {
  const navigate = useNavigate();

  const redirectAfterLogin = useCallback(async () => {
    try {
      const companies = await getMyCompanies();
      const active = companies.filter((c) => c.active);
      if (active.length > 1) {
        navigate(APP_PATHS.selecionarEmpresa, { replace: true });
      } else {
        navigate(APP_PATHS.dashboard, { replace: true });
      }
    } catch {
      navigate(APP_PATHS.dashboard, { replace: true });
    }
  }, [navigate]);

  return { redirectAfterLogin };
};
