import { publicApi } from "@/config/api";

export interface CommercialLeadPayload {
  name: string;
  company: string;
  corporateEmail: string;
}

export const submitCommercialLead = async (payload: CommercialLeadPayload): Promise<void> => {
  await publicApi.post("/public/commercial-leads", payload);
};
