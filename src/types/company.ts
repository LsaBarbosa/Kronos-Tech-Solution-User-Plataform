// src/types/company.ts

// Usado para o modal de visualização
export interface Address {
    street: string;
    number: string;
    postalCode: string; // Ex: 12345678 (sem formatação)
    city: string;
    state: string;
    neighborhood?: string; // Adicionado, usado no viewingEmpresa
}

export interface Location {
    latitude: number | null;
    longitude: number | null;
}

/**
 * Interface para os itens da lista de empresas retornados pela API.
 */
export interface CompanyListItem {
    id: string; // UUID
    name: string;
    cnpj: string;
    email: string;
    active: boolean;
    terminalFlag?: boolean;
    // Detalhes parciais necessários para a tabela
    address: Omit<Address, 'city' | 'state' | 'neighborhood'> & { city: string; state: string; }; // Garante CEP e número
    location?: Location;

    // Contadores usados no Modal de Visualização (assumindo que a API retorna isso)
    activeEmployees?: number;
    inactiveEmployees?: number;
}

/**
 * Interface para os dados completos (usada para edição/visualização completa no modal).
 */
export interface CompanyData extends CompanyListItem {
    address: Address; // Usa o tipo Address completo
    activeEmployees: number; // Garante o contador
    inactiveEmployees: number; // Garante o contador
    terminalFlag: boolean;
    location?: Location;
}

/**
 * Interface para o payload de atualização (PATCH) para o formulário de edição.
 */
export interface CompanyUpdatePayload {
    name: string;
    email: string;
    active: boolean;
    address: {
        postalCode: string;
        number: string;
    };
    location?: Location; // Opcional quando a API não devolve coordenadas
}

// --- Funções Utilitárias Puras ---

// Função para formatar CNPJ (do seu código)
export const formatCNPJ = (cnpj: string): string => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

// Função para formatar CEP (do seu código)
export const formatCEP = (cep: string): string => cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");

// Função para limpar o CEP (do seu código)
export const cleanCEP = (cep: string): string => cep.replace(/\D/g, "");
