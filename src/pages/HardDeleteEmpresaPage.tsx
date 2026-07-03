import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useHardDeleteEmpresa } from "@/hooks/useHardDeleteEmpresa";
import { useReportResponsiveMode } from "@/hooks/useReportResponsiveMode";
import { APP_PATHS } from "@/config/app-routes";
import HardDeleteEmpresaDesktop from "./HardDeleteEmpresaDesktop";
import HardDeleteEmpresaMobile from "./HardDeleteEmpresaMobile";

interface LocationState {
    cnpj?: string;
    name?: string;
    employeeCount?: number;
}

const HardDeleteEmpresaPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {}) as LocationState;
    const { isDesktop } = useReportResponsiveMode();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const cnpj = state.cnpj ?? "";
    const name = state.name ?? "";
    const employeeCount = state.employeeCount ?? 0;

    const mutation = useHardDeleteEmpresa();

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
        employeeCount,
        isPending: mutation.isPending,
        result: mutation.data,
        onConfirm: handleConfirm,
    };

    return isDesktop ? (
        <HardDeleteEmpresaDesktop {...sharedProps} />
    ) : (
        <HardDeleteEmpresaMobile {...sharedProps} />
    );
};

export default HardDeleteEmpresaPage;
