// src/types/company.ts

export interface Address {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  state: string;
  neighborhood?: string;
}

export interface Location {
  latitude: number | null;
  longitude: number | null;
}

export interface CompanyListItem {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  active: boolean;
  address: Omit<Address, 'city' | 'state' | 'neighborhood'> & { city: string; state: string };
  location: Location;
  activeEmployees?: number;
  inactiveEmployees?: number;
}

export interface CompanyData extends CompanyListItem {
  address: Address;
  activeEmployees: number;
  inactiveEmployees: number;
}

export interface CompanyUpdatePayload {
  name: string;
  email: string;
  active: boolean;
  address: {
    postalCode: string;
    number: string;
  };
  location: Location;
}

const NON_DIGIT_REGEX = /\D/g;
const CNPJ_REGEX = /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/;
const CEP_REGEX = /^(\d{5})(\d{3})$/;

export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('token') ?? '';
};

export const formatCNPJ = (cnpj: string): string => cnpj.replace(CNPJ_REGEX, '$1.$2.$3/$4-$5');

export const formatCEP = (cep: string): string => cep.replace(CEP_REGEX, '$1-$2');

export const cleanCEP = (cep: string): string => cep.replace(NON_DIGIT_REGEX, '');
