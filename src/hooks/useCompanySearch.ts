// src/hooks/useCompanySearch.ts

import { useState, useEffect, useCallback } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; 
import { 
    CompanyListItem, 
    CompanyData, 
    CompanyUpdatePayload, 
    formatCNPJ, 
    formatCEP, 
    cleanCEP 
} from "@/types/company";
import { 
    fetchCompanyList, 
    updateCompany, 
    toggleCompanyStatus
} from "@/service/company.service";

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
    handleEditEmpresa: (empresa: CompanyData) => void;
    handleViewEmpresa: (empresa: CompanyData) => void;
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
        } catch (err: any) {
            console.error("Falha ao buscar empresas:", err);
            setError(err.message || "Falha ao carregar as empresas. Tente novamente.");
            if (err.message.includes("Token")) {
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

    const handleEditEmpresa = useCallback((empresa: CompanyData) => {
        // Assume que a empresa passada tem os dados completos para a edição
        setEditingEmpresa(empresa);
        editForm.reset({
            name: empresa.name,
            email: empresa.email,
            active: empresa.active,
            address: {
                postalCode: cleanCEP(empresa.address.postalCode),
                number: empresa.address.number,
            },
        });
        setIsEditDialogOpen(true);
    }, [editForm]);

    const handleViewEmpresa = useCallback((empresa: CompanyData) => {
        // Assume que a empresa passada tem os dados completos para visualização
        setViewingEmpresa(empresa);
        setIsViewDialogOpen(true);
    }, []);

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
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [toast, fetchCompanies]);

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
                location: editingEmpresa.location // Mantém a localização original
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
        } catch (error: any) {
            console.error("Erro ao atualizar a empresa:", error);
            toast({
                title: "Erro ao atualizar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [editingEmpresa, toast, fetchCompanies]);


    return {
        empresas,
        filteredEmpresas,
        searchTerm,
        editingEmpresa: editingEmpresa as CompanyData | null, // Casting seguro para uso no componente
        viewingEmpresa: viewingEmpresa as CompanyData | null, // Casting seguro para uso no componente
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
