import type { Location } from "@/types/company";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY ?? "";

interface ViaCepResponse {
  erro?: boolean;
  logradouro?: string;
  localidade?: string;
  uf?: string;
}

interface HereGeocodeResponse {
  items?: Array<{
    position?: {
      lat?: number;
      lng?: number;
    };
  }>;
  error?: string;
}

const fetchJson = async <T>(input: string): Promise<T> => {
  const response = await fetch(input);
  const data = (await response.json()) as T;

  if (!response.ok) {
    const fallbackMessage =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Falha ao consultar o serviço de geolocalização.";

    throw new Error(fallbackMessage);
  }

  return data;
};

export const resolveCompanyGeolocation = async (
  postalCode: string,
  number: string,
  apiKey = HERE_API_KEY
): Promise<Location> => {
  if (!apiKey) {
    throw new Error("A chave VITE_HERE_API_KEY não foi definida.");
  }

  const cepData = await fetchJson<ViaCepResponse>(`https://viacep.com.br/ws/${postalCode}/json/`);

  if (cepData.erro || !cepData.logradouro || !cepData.localidade || !cepData.uf) {
    throw new Error("CEP não encontrado ou inválido.");
  }

  const fullAddress = `${cepData.logradouro}, ${number}, ${cepData.localidade}, ${cepData.uf}, Brasil`;
  const geocodeData = await fetchJson<HereGeocodeResponse>(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${apiKey}&in=countryCode:BRA`
  );

  const position = geocodeData.items?.[0]?.position;

  if (
    typeof position?.lat !== "number" ||
    typeof position.lng !== "number"
  ) {
    throw new Error(geocodeData.error || "Localização não encontrada pelo serviço de Geocodificação.");
  }

  return {
    latitude: Number(position.lat.toFixed(6)),
    longitude: Number(position.lng.toFixed(6)),
  };
};
