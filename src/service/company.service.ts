// src/services/companyService.ts

import { api } from "@/config/api";
import type {
    CompanyListItem,
    CompanyData,
    Location,
    CompanyUpdatePayload,
} from "@/types/company";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { resolveCompanyGeolocation } from "@/service/geolocation.service";

type CompanyReadResponse = Partial<CompanyData> & {
    address?: Partial<CompanyData["address"]>;
    location?: Partial<Location>;
};

const mapCompanyLocation = (payload: CompanyReadResponse) =>
    payload.location &&
    (typeof payload.location.latitude === "number" || typeof payload.location.longitude === "number")
        ? {
              location: {
                  latitude: payload.location.latitude ?? null,
                  longitude: payload.location.longitude ?? null,
              },
          }
        : {};

const mapCompanyListItem = (payload: CompanyReadResponse): CompanyListItem => ({
    id: payload.id ?? "",
    name: payload.name ?? "",
    cnpj: payload.cnpj ?? "",
    email: payload.email ?? "",
    active: payload.active ?? false,
    address: {
        street: payload.address?.street ?? "",
        number: payload.address?.number ?? "",
        postalCode: payload.address?.postalCode ?? "",
        city: payload.address?.city ?? "",
        state: payload.address?.state ?? "",
    },
    ...(typeof payload.activeEmployees === "number" ? { activeEmployees: payload.activeEmployees } : {}),
    ...(typeof payload.inactiveEmployees === "number" ? { inactiveEmployees: payload.inactiveEmployees } : {}),
    ...mapCompanyLocation(payload),
});

const mapCompanyReadModel = (payload: CompanyReadResponse): CompanyData => ({
    id: payload.id ?? "",
    name: payload.name ?? "",
    cnpj: payload.cnpj ?? "",
    email: payload.email ?? "",
    active: payload.active ?? false,
    address: {
        street: payload.address?.street ?? "",
        number: payload.address?.number ?? "",
        postalCode: payload.address?.postalCode ?? "",
        city: payload.address?.city ?? "",
        state: payload.address?.state ?? "",
        ...(payload.address?.neighborhood ? { neighborhood: payload.address.neighborhood } : {}),
    },
    activeEmployees: payload.activeEmployees ?? 0,
    inactiveEmployees: payload.inactiveEmployees ?? 0,
    ...mapCompanyLocation(payload),
});

/**
 * Payload oficial da etapa 1 do onboarding de empresa.
 * Esta requisição cria apenas a empresa; o administrador inicial é criado na etapa seguinte.
 */
export interface CompanyOnboardingRequest {
    name: string;
    cnpj: string;
    email: string;
    address: {
        postalCode: string;
        number: string;
    };
    location: Location;
}

export type CompanyCreationPayload = CompanyOnboardingRequest;

// --- Serviços de API ---

/**
 * Busca a lista resumida de todas as empresas.
 */
export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
    const response = await api.get<{ companies: CompanyReadResponse[] }>(`/${API_ROUTES.COMPANIES}`);

    return extractArray<CompanyReadResponse>(response.data, ["companies"]).map((company) => mapCompanyListItem(company));
};

/**
 * Busca os detalhes de uma empresa específica por CNPJ.
 */
export const fetchCompanyDetails = async (cnpj: string): Promise<CompanyData> => {
    const response = await api.get<CompanyReadResponse>(buildRoute(API_ROUTES.COMPANIES, cnpj));
    return mapCompanyReadModel(extractObject<CompanyReadResponse>(response.data) as CompanyReadResponse);
};

export const checkCompanyCnpjAvailability = async (cnpj: string): Promise<boolean> => {
    try {
        await api.get(buildRoute(API_ROUTES.COMPANIES, "check-cnpj"), {
            params: { cnpj },
        });
        return false;
    } catch (error) {
        const normalized = normalizeServiceError(error);

        if (normalized.status === 404) {
            return true;
        }

        throw normalized;
    }
};

export const createCompany = async (payload: CompanyOnboardingRequest): Promise<void> => {
    await api.post(buildRoute(API_ROUTES.COMPANIES), payload);
};

/**
 * Atualiza os dados de uma empresa (PATCH).
 */
export const updateCompany = async (cnpj: string, payload: CompanyUpdatePayload): Promise<void> => {
    await api.patch(buildRoute(API_ROUTES.COMPANIES, cnpj), payload);
};

export const getGeolocationFromCEP = async (cep: string, number: string): Promise<Location> => {
    return resolveCompanyGeolocation(cep, number);
};

/**
 * Alterna o status (Ativo/Inativo) de uma empresa.
 */
export const toggleCompanyStatus = async (cnpj: string, currentStatus: boolean): Promise<void> => {
    await api.patch(buildRoute(API_ROUTES.COMPANIES, cnpj, "toggle-activate"), { active: !currentStatus });
};

// Função utilitária para formatar CNPJ (Mantida como pura)
export const formatCNPJ = (cnpj: string) => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
