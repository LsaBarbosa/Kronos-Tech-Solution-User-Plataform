// src/services/companyService.ts

import { api } from "@/config/api";
import { CompanyListItem, CompanyData, Location, CompanyUpdatePayload, cleanCEP, getAuthToken } from "@/types/company";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY ?? "";

// --- Serviços de API ---

/**
 * Busca a lista resumida de todas as empresas.
 */
export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
    const response = await api.get<{ companies: CompanyListItem[] }>("/companies");
    return extractArray<CompanyListItem>(response.data, ["companies"]);
};

/**
 * Busca os detalhes de uma empresa específica por CNPJ.
 */
export const fetchCompanyDetails = async (cnpj: string): Promise<CompanyData> => {
    const response = await api.get<CompanyData>(`/companies/${cnpj}`);
    return extractObject<CompanyData>(response.data) as CompanyData;
};

/**
 * Atualiza os dados de uma empresa (PATCH).
 */
export const updateCompany = async (cnpj: string, payload: CompanyUpdatePayload): Promise<void> => {
    await api.patch(`/companies/${cnpj}`, payload);
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
    await api.patch(`/companies/${cnpj}/toggle-activate`, { active: !currentStatus });
};

// Função utilitária para formatar CNPJ (Mantida como pura)
export const formatCNPJ = (cnpj: string) => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

export { getAuthToken };
