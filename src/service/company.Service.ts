import { api } from "@/config/api";
import { CompanyListItem, CompanyData, Location, CompanyUpdatePayload } from "@/types/company";

const HERE_API_KEY = "4BOpnro1zHzBBh9olurKhD4aWIw9I-gcY6VRox9wSXU";

export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
  const { data } = await api.get("companies");
  return data.companies;
};

export const fetchCompanyDetails = async (cnpj: string): Promise<CompanyData> => {
  const { data } = await api.get(`companies/${cnpj}`);
  return data;
};

export const updateCompany = async (cnpj: string, payload: CompanyUpdatePayload): Promise<void> => {
  await api.patch(`companies/${cnpj}`, payload);
};

export const getGeolocationFromCEP = async (cep: string, number: string): Promise<Location> => {
  if (!HERE_API_KEY) throw new Error("A chave HERE_API_KEY não foi definida no serviço.");

  const cepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const cepData = await cepResponse.json();
  if (cepData.erro) throw new Error("CEP não encontrado ou inválido.");

  const fullAddress = `${cepData.logradouro}, ${number}, ${cepData.localidade}, ${cepData.uf}, Brasil`;
  const geocodeResponse = await fetch(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${HERE_API_KEY}&in=countryCode:BRA`,
  );
  const geocodeData = await geocodeResponse.json();

  if (!geocodeResponse.ok || geocodeData.items.length === 0) {
    throw new Error(geocodeData.error || "Localização não encontrada pelo serviço de Geocodificação.");
  }

  const position = geocodeData.items[0].position;
  return {
    latitude: parseFloat(position.lat.toFixed(6)),
    longitude: parseFloat(position.lng.toFixed(6))
  };
};

export const toggleCompanyStatus = async (cnpj: string, currentStatus: boolean): Promise<void> => {
  await api.patch(`companies/${cnpj}/toggle-activate`, { active: !currentStatus });
};

export const formatCNPJ = (cnpj: string) => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
