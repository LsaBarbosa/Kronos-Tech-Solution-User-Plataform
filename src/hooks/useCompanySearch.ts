// src/hooks/useCompanySearch.ts

import { useState, useEffect, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; 
import type { 
    CompanyListItem, 
    CompanyData, 
    CompanyUpdatePayload} from "@/types/company";
import { 
    formatCNPJ, 
    formatCEP, 
    cleanCEP 
} from "@/types/company";
import { 
    fetchCompanyList, 
    fetchCompanyDetails,
    updateCompany, 
    toggleCompanyStatus
} from "@/service/company.service";
import { isAuthServiceError, normalizeServiceError } from "@/service/helpers/service-error.helper";

// --- SCHEMAS DE VALIDAÇÃO ---
const editEmpresaSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    active: z.boolean(),
    address: z.object({
        postalCode: z.string().min(8, "CEP deve ter 8 dígitos").max(8, "CEP deve ter 8 dígitos"),
        number: z.string().min(1, "Número é obrigatório"),
    }),
});

type EditFormData = z.infer<typeof editEmpresaSchema>;

interface UseCompanySearchReturn {
    // Estados de Dados
    empresas: CompanyListItem[];
    filteredEmpresas: CompanyListItem[];
    searchTerm: string;
    editingEmpresa: CompanyData | null;
    viewingEmpresa: CompanyData | null;
    // Estados de UI
    loading: boolean;
    error: string | null;
    isSubmitting: boolean;
    isEditDialogOpen: boolean;
    isViewDialogOpen: boolean;
    // Formulário
    editForm: UseFormReturn<EditFormData>;
    // Handlers
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    handleEditEmpresa: (empresa: CompanyListItem) => Promise<void>;
    handleViewEmpresa: (empresa: CompanyListItem) => Promise<void>;
    setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsViewDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleToggleStatus: (empresa: CompanyListItem) => Promise<void>;
    onSubmitEdit: (data: EditFormData) => Promise<void>;
    // Utilitários
    formatCNPJ: (cnpj: string) => string;
    formatCEP: (cep: string) => string;
}

export const useCompanySearch = (): UseCompanySearchReturn => {
    const [empresas, setEmpresas] = useState<CompanyListItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingEmpresa, setEditingEmpresa] = useState<CompanyData | null>(null);
    const [viewingEmpresa, setViewingEmpresa] = useState<CompanyData | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const { toast } = useToast();

    // 💡 Formulário de edição
    const editForm = useForm<EditFormData>({
        resolver: zodResolver(editEmpresaSchema),
        defaultValues: {
            name: "",
            email: "",
            active: true,
            address: {
                postalCode: "",
                number: "",
            },
        },
    });

    // --- LÓGICA DE DADOS ---

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCompanyList();
            setEmpresas(data);
        } catch (err: unknown) {
            const normalized = normalizeServiceError(err);
            console.error("Falha ao buscar empresas:", normalized);
            setError(normalized.message || "Falha ao carregar as empresas. Tente novamente.");
            if (isAuthServiceError(normalized)) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Chama a função de busca quando o componente é montado
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    // Lógica de filtro (pura)
    const filteredEmpresas = empresas.filter(empresa =>
        empresa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cnpj.includes(searchTerm) ||
        empresa.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- HANDLERS DE UI/MODAL ---

    const loadCompanyDetails = useCallback(async (empresa: CompanyListItem, mode: "edit" | "view") => {
        try {
            const companyDetails = await fetchCompanyDetails(empresa.cnpj);

            if (mode === "edit") {
                setEditingEmpresa(companyDetails);
                editForm.reset({
                    name: companyDetails.name,
                    email: companyDetails.email,
                    active: companyDetails.active,
                    address: {
                        postalCode: cleanCEP(companyDetails.address.postalCode),
                        number: companyDetails.address.number,
                    },
                });
                setIsEditDialogOpen(true);
                return;
            }

            setViewingEmpresa(companyDetails);
            setIsViewDialogOpen(true);
        } catch (err) {
            const normalized = normalizeServiceError(err);
            toast({
                title: "Erro",
                description: normalized.message,
                variant: "destructive",
            });

            if (isAuthServiceError(normalized)) {
                navigate("/login");
            }
        }
    }, [editForm, navigate, toast]);

    const handleEditEmpresa = useCallback(async (empresa: CompanyListItem) => {
        await loadCompanyDetails(empresa, "edit");
    }, [loadCompanyDetails]);

    const handleViewEmpresa = useCallback(async (empresa: CompanyListItem) => {
        await loadCompanyDetails(empresa, "view");
    }, [loadCompanyDetails]);

    // --- HANDLERS DE AÇÃO DE API ---

    const handleToggleStatus = useCallback(async (empresa: CompanyListItem) => {
        setIsSubmitting(true);
        try {
            await toggleCompanyStatus(empresa.cnpj, empresa.active);
            
            toast({
                title: "Sucesso!",
                description: `Status da empresa ${empresa.name} alterado para ${!empresa.active ? 'Ativa' : 'Inativa'}.`,
            });

            // Recarrega os dados após a alteração
            await fetchCompanies();
        } catch (error: unknown) {
            const normalized = normalizeServiceError(error);
            toast({
                title: 'Erro',
                description: normalized.message,
                variant: 'destructive',
            });
            if (isAuthServiceError(normalized)) {
                navigate("/login");
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [toast, fetchCompanies, navigate]);

    const onSubmitEdit = useCallback(async (data: EditFormData) => {
        if (!editingEmpresa) return;

        setIsSubmitting(true);
        try {
            // Monta o payload
            const updatePayload: CompanyUpdatePayload = {
                name: data.name,
                email: data.email,
                active: data.active,
                address: {
                    postalCode: cleanCEP(data.address.postalCode),
                    number: data.address.number
                },
                ...(editingEmpresa.location ? { location: editingEmpresa.location } : {}),
            };

            await updateCompany(editingEmpresa.cnpj, updatePayload);
            
            toast({
                title: "Sucesso!",
                description: `A empresa ${data.name} foi atualizada.`,
            });

            setIsEditDialogOpen(false);
            setEditingEmpresa(null);
            // Recarrega os dados após a alteração
            await fetchCompanies();
        } catch (error: unknown) {
            const normalized = normalizeServiceError(error);
            console.error("Erro ao atualizar a empresa:", normalized);
            toast({
                title: "Erro ao atualizar",
                description: normalized.message,
                variant: "destructive",
            });
            if (isAuthServiceError(normalized)) {
                navigate("/login");
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [editingEmpresa, toast, fetchCompanies, navigate]);


    return {
        empresas,
        filteredEmpresas,
        searchTerm,
        editingEmpresa,
        viewingEmpresa,
        loading,
        error,
        isSubmitting,
        isEditDialogOpen,
        isViewDialogOpen,
        editForm,
        setSearchTerm,
        handleEditEmpresa,
        handleViewEmpresa,
        setIsEditDialogOpen,
        setIsViewDialogOpen,
        handleToggleStatus,
        onSubmitEdit,
        formatCNPJ,
        formatCEP,
    };
};
