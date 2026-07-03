import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGerenciarStatusEmpresa } from "@/hooks/useGerenciarStatusEmpresa";
import { useReportResponsiveMode } from "@/hooks/useReportResponsiveMode";
import { APP_PATHS } from "@/config/app-routes";
import StatusEmpresaDesktop from "./StatusEmpresaDesktop";
import StatusEmpresaMobile from "./StatusEmpresaMobile";

interface LocationState {
    cnpj?: string;
    name?: string;
    active?: boolean;
    employeeCount?: number;
}

const StatusEmpresaPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {}) as LocationState;
    const { isDesktop } = useReportResponsiveMode();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const cnpj = state.cnpj ?? "";
    const name = state.name ?? "";
    const active = state.active ?? true;
    const employeeCount = state.employeeCount ?? 0;

    const mutation = useGerenciarStatusEmpresa();

    if (!cnpj || !name) {
        navigate(APP_PATHS.empresaBuscar);
        return null;
    }

    const handleConfirm = useCallback(() => {
        mutation.mutate(cnpj);
    }, [mutation, cnpj]);

    const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

    const sharedProps = {
        sidebarOpen,
        onToggleSidebar: toggleSidebar,
        companyName: name,
        cnpj,
        active,
        employeeCount,
        isPending: mutation.isPending,
        success: mutation.isSuccess,
        onConfirm: handleConfirm,
    };

    return isDesktop
        ? <StatusEmpresaDesktop {...sharedProps} />
        : <StatusEmpresaMobile {...sharedProps} />;
};

export default StatusEmpresaPage;
