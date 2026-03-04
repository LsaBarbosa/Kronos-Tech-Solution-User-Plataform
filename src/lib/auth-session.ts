import { queryClient } from "@/lib/queryClient";

export const clearLocalAuthSession = (): void => {
  localStorage.removeItem("token");
  queryClient.clear();
};
