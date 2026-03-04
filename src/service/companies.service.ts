import { apiFetch, parseApiResponse } from '@/config/api';

interface CompanyApiItem {
  id: string;
  name: string;
}

export interface CompanyOption {
  companyId: string;
  name: string;
}

export const listCompanies = async (): Promise<CompanyOption[]> => {
  const response = await apiFetch('companies', { credentials: 'include' });
  const data = await parseApiResponse<{ companies: CompanyApiItem[] }>(response);

  return (data.companies ?? []).map((company) => ({
    companyId: company.id,
    name: company.name,
  }));
};

export const checkCnpjAvailability = async (
  cnpj: string,
): Promise<'available' | 'unavailable' | 'unknown'> => {
  const response = await apiFetch(`companies/check-cnpj?cnpj=${encodeURIComponent(cnpj)}`, {
    credentials: 'include',
  });

  if (response.ok) return 'unavailable';
  if (response.status === 404) return 'available';

  return 'unknown';
};

export interface CreateCompanyPayload {
  name: string;
  cnpj: string;
  email: string;
  address: {
    postalCode: string;
    number: string;
  };
  location: {
    latitude?: number;
    longitude?: number;
  };
}

export const createCompany = async (payload: CreateCompanyPayload): Promise<void> => {
  const response = await apiFetch('companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  await parseApiResponse(response);
};

interface ViaCepResponse {
  erro?: boolean;
  logradouro: string;
  localidade: string;
  uf: string;
}

interface HereResponse {
  items: Array<{ position: { lat: number; lng: number } }>;
  error?: string;
}

export const geocodeAddressByPostalCode = async (
  postalCode: string,
  number: string,
  hereApiKey: string,
): Promise<{ latitude: number; longitude: number }> => {
  const cepResponse = await apiFetch(`https://viacep.com.br/ws/${postalCode}/json/`, {
    credentials: 'omit',
  });
  const cepData = await parseApiResponse<ViaCepResponse>(cepResponse);

  if (cepData.erro) {
    throw new Error('CEP não encontrado ou inválido.');
  }

  const fullAddress = `${cepData.logradouro}, ${number}, ${cepData.localidade}, ${cepData.uf}, Brasil`;

  const geocodeResponse = await apiFetch(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${hereApiKey}&in=countryCode:BRA`,
    { credentials: 'omit' },
  );
  const geocodeData = await parseApiResponse<HereResponse>(geocodeResponse);

  if (!geocodeData.items?.length) {
    throw new Error(`Erro na API HERE: ${geocodeData.error || 'Localização não encontrada.'}`);
  }

  return {
    latitude: geocodeData.items[0].position.lat,
    longitude: geocodeData.items[0].position.lng,
  };
};
