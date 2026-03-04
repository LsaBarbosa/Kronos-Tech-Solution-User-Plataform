import { api } from "@/config/api";

export const updateOwnProfile = async (payload: { email?: string; phone?: string }) => {
  await api.patch("employee/update-own-profile", payload);
};
