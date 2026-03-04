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
