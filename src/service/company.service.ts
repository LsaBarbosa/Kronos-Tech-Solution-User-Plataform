// src/services/companyService.ts

import { api } from "@/config/api";
import {
    CompanyListItem,
    CompanyData,
    Location,
    CompanyUpdatePayload,
} from "@/types/company";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY ?? "";

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

// --- Serviço de Geolocalização (Movido do componente) ---

/**
 * Obtém as coordenadas geográficas (Latitude/Longitude) a partir do CEP e número.
 */
export const getGeolocationFromCEP = async (cep: string, number: string): Promise<Location> => {
    
    if (!HERE_API_KEY) {
        throw new Error("A chave VITE_HERE_API_KEY não foi definida.");
    }

    try {
        // 1. Busca Endereço completo pelo ViaCEP
        const cepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const cepData = await cepResponse.json();

        if (cepData.erro) {
            throw new Error("CEP não encontrado ou inválido.");
        }

        const fullAddress = `${cepData.logradouro}, ${number}, ${cepData.localidade}, ${cepData.uf}, Brasil`;

        // 2. Geocodificação pelo HERE Maps API
        const geocodeResponse = await fetch(
            `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${HERE_API_KEY}&in=countryCode:BRA`,
        );

        const geocodeData = await geocodeResponse.json();

        if (!geocodeResponse.ok || geocodeData.items.length === 0) {
            throw new Error(geocodeData.error || "Localização não encontrada pelo serviço de Geocodificação.");
        }
        
        const position = geocodeData.items[0].position;
        const lat = position.lat;
        const lon = position.lng;
        
        return {
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lon.toFixed(6))
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }

        throw new Error("Falha ao obter coordenadas geográficas.");
    }
};

/**
 * Alterna o status (Ativo/Inativo) de uma empresa.
 */
export const toggleCompanyStatus = async (cnpj: string, currentStatus: boolean): Promise<void> => {
    await api.patch(buildRoute(API_ROUTES.COMPANIES, cnpj, "toggle-activate"), { active: !currentStatus });
};

// Função utilitária para formatar CNPJ (Mantida como pura)
export const formatCNPJ = (cnpj: string) => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
