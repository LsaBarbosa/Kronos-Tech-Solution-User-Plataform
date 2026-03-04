// src/services/companyService.ts

import { apiFetch, parseApiResponse } from '@/config/api';
import { CompanyListItem, CompanyData, Location, CompanyUpdatePayload, cleanCEP, formatCNPJ } from '@/types/company';

const HERE_API_KEY = '4BOpnro1zHzBBh9olurKhD4aWIw9I-gcY6VRox9wSXU';

export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
  const response = await apiFetch('companies');
  const data = await parseApiResponse<{ companies: CompanyListItem[] }>(response);
  return data.companies;
};

export const fetchCompanyDetails = async (cnpj: string): Promise<CompanyData> => {
  const response = await apiFetch(`companies/${cnpj}`);
  return parseApiResponse(response);
};

export const updateCompany = async (cnpj: string, payload: CompanyUpdatePayload): Promise<void> => {
  const response = await apiFetch(`companies/${cnpj}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await parseApiResponse(response);
};

export const getGeolocationFromCEP = async (cep: string, number: string): Promise<Location> => {
  if (!HERE_API_KEY) {
    throw new Error('A chave HERE_API_KEY não foi definida no serviço.');
  }

  try {
    const cleanPostalCode = cleanCEP(cep);
    const cepResponse = await fetch(`https://viacep.com.br/ws/${cleanPostalCode}/json/`);
    const cepData = await cepResponse.json();

    if (cepData.erro) {
      throw new Error('CEP não encontrado ou inválido.');
    }

    const fullAddress = `${cepData.logradouro}, ${number}, ${cepData.localidade}, ${cepData.uf}, Brasil`;
    const geocodeResponse = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${HERE_API_KEY}&in=countryCode:BRA`
    );
    const geocodeData = await geocodeResponse.json();

    if (!geocodeResponse.ok || geocodeData.items.length === 0) {
      throw new Error(geocodeData.error || 'Localização não encontrada pelo serviço de Geocodificação.');
    }

    const position = geocodeData.items[0].position;
    return {
      latitude: parseFloat(position.lat.toFixed(6)),
      longitude: parseFloat(position.lng.toFixed(6)),
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar geolocalização.');
  }
};

export const toggleCompanyStatus = async (cnpj: string): Promise<void> => {
  const response = await apiFetch(`companies/${cnpj}/toggle-activate`, { method: 'PATCH' });
  await parseApiResponse(response);
};

export { formatCNPJ };

export const getAuthToken = (): string => localStorage.getItem('token') || '';
