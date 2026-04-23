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

export interface CompanyCreationPayload {
    name: string;
    cnpj: string;
    email: string;
    address: {
        postalCode: string;
        number: string;
    };
    location: Location;
}

// --- Serviços de API ---

/**
 * Busca a lista resumida de todas as empresas.
 */
export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
    const response = await api.get<{ companies: CompanyListItem[] }>(`/${API_ROUTES.COMPANIES}`);
    return extractArray<CompanyListItem>(response.data, ["companies"]);
};

/**
 * Busca os detalhes de uma empresa específica por CNPJ.
 */
export const fetchCompanyDetails = async (cnpj: string): Promise<CompanyData> => {
    const response = await api.get<CompanyData>(buildRoute(API_ROUTES.COMPANIES, cnpj));
    return extractObject<CompanyData>(response.data) as CompanyData;
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

export const createCompany = async (payload: CompanyCreationPayload): Promise<void> => {
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
    } catch (error: any) {
        throw new Error(error.message || "Falha ao obter coordenadas geográficas.");
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
