import { api } from "@/config/api";
import { API_ROUTES, USER_PATHS, buildRoute } from "@/config/api-routes";

export interface AccessibleCompany {
    companyId: string;
    companyName: string;
    cnpj: string;
    role: string;
    defaultCompany: boolean;
    active: boolean;
}

export interface AddCompanyAccessPayload {
    companyId: string;
    employeeId: string;
    role: "CTO" | "MANAGER" | "PARTNER";
    defaultCompany: boolean;
}

export const getMyCompanies = async (): Promise<AccessibleCompany[]> => {
    const response = await api.get<AccessibleCompany[]>(
        buildRoute(API_ROUTES.USERS, USER_PATHS.ME_COMPANIES)
    );
    return Array.isArray(response.data) ? response.data : [];
};

export const addCompanyAccess = async (userId: string, payload: AddCompanyAccessPayload): Promise<void> => {
    await api.post(buildRoute(API_ROUTES.USERS, USER_PATHS.COMPANY_ACCESS(userId)), payload);
};
