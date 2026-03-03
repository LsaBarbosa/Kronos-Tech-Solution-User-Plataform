// src/services/companyService.ts

import { API_BASE_URL } from "@/config/api"; //
import { CompanyListItem, CompanyData, Location, CompanyUpdatePayload, cleanCEP, getAuthToken } from "@/types/company";

// 💡 Constante crucial para geocodificação (idealmente, deve vir de .env)
const HERE_API_KEY = "4BOpnro1zHzBBh9olurKhD4aWIw9I-gcY6VRox9wSXU"; 

// --- Funções Auxiliares de Requisição ---

const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    if (!token) {
        // Lançar erro que será capturado pelo hook
        throw new Error("Token de autenticação não encontrado."); 
    }
    return { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
    };
};

const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || `Erro de API (${response.status})`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};

// --- Serviços de API ---

/**
 * Busca a lista resumida de todas as empresas.
 */
export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}companies`, { headers });
    const data = await handleResponse(response);
    return data.companies; // Assumindo que a API retorna { companies: [...] }
};

/**
 * Busca os detalhes de uma empresa específica por CNPJ.
 */
export const fetchCompanyDetails = async (cnpj: string): Promise<CompanyData> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}companies/${cnpj}`, { headers });
    return handleResponse(response) ;
};

/**
 * Atualiza os dados de uma empresa (PATCH).
 */
export const updateCompany = async (cnpj: string, payload: CompanyUpdatePayload): Promise<void> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}companies/${cnpj}`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload),
    });
    await handleResponse(response);
};

// --- Serviço de Geolocalização (Movido do componente) ---

/**
 * Obtém as coordenadas geográficas (Latitude/Longitude) a partir do CEP e número.
 */
export const getGeolocationFromCEP = async (cep: string, number: string): Promise<Location> => {
    
    if (!HERE_API_KEY) {
        throw new Error("A chave HERE_API_KEY não foi definida no serviço.");
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
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}companies/${cnpj}/toggle-activate`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ active: !currentStatus })
    });
    await handleResponse(response);
};

export { getAuthToken, formatCNPJ } from '@/types/company';
