import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { extractObject } from "@/service/helpers/response-normalizer.helper";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import type { Location } from "@/types/company";

interface GeolocationResolveResponse {
  latitude?: number;
  longitude?: number;
}

export const resolveCompanyGeolocation = async (
  postalCode: string,
  number: string
): Promise<Location> => {
  try {
    const response = await api.post<unknown>(
      buildRoute(API_ROUTES.GEOLOCATION, "resolve"),
      {
        postalCode,
        number,
      }
    );
    const payload = extractObject<GeolocationResolveResponse>(response.data);

    if (
      typeof payload.latitude !== "number" ||
      typeof payload.longitude !== "number"
    ) {
      throw new Error("Localização não encontrada para o endereço informado.");
    }

    return {
      latitude: Number(payload.latitude.toFixed(6)),
      longitude: Number(payload.longitude.toFixed(6)),
    };
  } catch (error) {
    throw new Error(normalizeServiceError(error).message);
  }
};
