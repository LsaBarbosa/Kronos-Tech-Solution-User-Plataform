import { api } from "@/config/api";
import { API_ROUTES } from "@/config/api-routes";

export interface PartnerHardDeletePayload {
  faceImageBase64: string;
  password: string;
  livenessPassed?: boolean;
}

export const hardDeletePartner = async (
  employeeId: string,
  payload: PartnerHardDeletePayload
): Promise<void> => {
  await api.delete(`${API_ROUTES.EMPLOYEE}/manager/${employeeId}/hard-delete`, {
    data: payload,
  });
};
