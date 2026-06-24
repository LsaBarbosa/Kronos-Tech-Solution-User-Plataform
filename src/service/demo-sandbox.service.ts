import { api } from "@/config/api";
import { API_ROUTES, CTO_DEMO_PATHS, buildRoute } from "@/config/api-routes";
import type {
  DemoCreateResponse,
  DemoPurgeResponse,
  DemoStatusResponse,
  DemoValidationResult,
} from "@/types/demo";

export const createDemoSandbox = async (): Promise<DemoCreateResponse> => {
  const response = await api.post<DemoCreateResponse>(
    buildRoute(API_ROUTES.CTO_DEMO, CTO_DEMO_PATHS.CREATE)
  );
  return response.data;
};

export const deleteDemoSandbox = async (): Promise<DemoPurgeResponse> => {
  const response = await api.delete<DemoPurgeResponse>(
    buildRoute(API_ROUTES.CTO_DEMO, CTO_DEMO_PATHS.PURGE)
  );
  return response.data;
};

export const fetchDemoStatus = async (): Promise<DemoStatusResponse> => {
  const response = await api.get<DemoStatusResponse>(
    buildRoute(API_ROUTES.CTO_DEMO, CTO_DEMO_PATHS.STATUS)
  );
  return response.data;
};

export const validateDemoSandbox = async (): Promise<DemoValidationResult> => {
  const response = await api.post<DemoValidationResult>(
    buildRoute(API_ROUTES.CTO_DEMO, CTO_DEMO_PATHS.VALIDATE)
  );
  return response.data;
};
