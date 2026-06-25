import { api } from "@/config/api";
import { API_ROUTES, SUPPORT_CHAT_PATHS, buildRoute } from "@/config/api-routes";

export interface TawkChatConfig {
  enabled: boolean;
  propertyId: string;
  widgetId: string;
}

export interface TawkIdentity {
  userId: string;
  name: string;
  email: string;
  hash: string;
  ttlSeconds: number;
}

export const getChatConfig = async (): Promise<TawkChatConfig> => {
  const response = await api.get<TawkChatConfig>(
    buildRoute(API_ROUTES.SUPPORT_CHAT, SUPPORT_CHAT_PATHS.CONFIG)
  );
  return response.data;
};

export const getChatIdentity = async (): Promise<TawkIdentity> => {
  const response = await api.get<TawkIdentity>(
    buildRoute(API_ROUTES.SUPPORT_CHAT, SUPPORT_CHAT_PATHS.IDENTITY)
  );
  return response.data;
};
