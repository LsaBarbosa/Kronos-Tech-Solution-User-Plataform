// src/hooks/useUpdateCompanyForm.ts

import { useState, useCallback, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; //
import { isAuthenticationError } from "@/service/helpers/service-error.helper";
import { CompanyListItem, CompanyData, Location, CompanyUpdatePayload, cleanCEP } from "@/types/company";
import { 
    fetchCompanyList, 
    fetchCompanyDetails, 
    updateCompany, 
    getGeolocationFromCEP,
    formatCNPJ
} from "@/service/company.Service";

// --- SCHEMAS DE VALIDAÇÃO ---
const formSchema = z.object({
    selectedCnpj: z.string().min(1, { message: "Selecione uma empresa para editar." }),
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
    email: z.string().email({ message: "Email inválido." }),
    active: z.string(), 
    address: z.object({
        postalCode: z.string().length(8, { message: "CEP deve ter 8 dígitos (somente números)." }),
        number: z.string().min(1, { message: "Número é obrigatório." }),
    }),
    latitude: z.number().nullable().optional(), 
    longitude: z.number().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UseUpdateCompanyFormReturn {
    form: UseFormReturn<FormData>;
    companies: CompanyListItem[];
    originalCompany: CompanyData | null;
    isSubmitting: boolean;
    isFetchingCompanies: boolean;
    isLoadingDetails: boolean;
    isGeocoding: boolean;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    formatCNPJ: (cnpj: string) => string;
    cleanCEP: (cep: string) => string;
    handleCancel: () => void;
}

export const useUpdateCompanyForm = (): UseUpdateCompanyFormReturn => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companies, setCompanies] = useState<CompanyListItem[]>([]);
    const [isFetchingCompanies, setIsFetchingCompanies] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [originalCompany, setOriginalCompany] = useState<CompanyData | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();
    const isSessionError = (error: any) => error?.response?.status === 401 || error?.response?.status === 403;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedCnpj: "",
            name: "",
            email: "",
            active: "true",
            address: {
                postalCode: "",
                number: "",
            },
            latitude: null,
            longitude: null,
        },
    });
    
    // Observadores de estado do formulário
    const selectedCnpj = form.watch("selectedCnpj");
    const watchedPostalCode = form.watch("address.postalCode");
    const watchedNumber = form.watch("address.number");

    // --- FUNÇÕES DE API ORQUESTRADAS ---

    const fetchList = useCallback(async () => {
        setIsFetchingCompanies(true);
        try {
            const data = await fetchCompanyList();
            setCompanies(data);
        } catch (error: any) {
            console.error("Erro ao buscar empresas:", error);
            if (isSessionError(error)) navigate("/login");
            
            toast({ 
                title: "Erro", 
                description: error.message || "Não foi possível carregar a lista de empresas.", 
                variant: "destructive" 
            });
        } finally {
            setIsFetchingCompanies(false);
        }
    }, [toast, navigate]);


    const fetchDetails = useCallback(async (cnpj: string) => {
        if (!cnpj) return;

        setIsLoadingDetails(true);
        setOriginalCompany(null);
        
        try {
            const data = await fetchCompanyDetails(cnpj);
            setOriginalCompany(data);
            
            form.reset({
                selectedCnpj: cnpj,
                name: data.name,
                email: data.email,
                active: String(data.active),
                address: {
                    postalCode: data.address.postalCode, 
                    number: data.address.number,
                },
                latitude: data.location?.latitude, 
                longitude: data.location?.longitude,
            });

            toast({ title: "Dados carregados", description: `Detalhes de ${data.name} preenchidos no formulário.` });
        } catch (error: any) {
            console.error("Erro ao buscar detalhes da empresa:", error);
            toast({ 
                title: "Erro", 
                description: error.message || "Não foi possível carregar os detalhes da empresa.", 
                variant: "destructive" 
            });
            form.reset({ selectedCnpj: cnpj }); 
        } finally {
            setIsLoadingDetails(false);
        }
    }, [toast, form]);
    
    // --- LÓGICA DE GEOCÓDIGO ---
    const handleGeocode = useCallback(async () => {
        const cep = cleanCEP(watchedPostalCode);
        const number = watchedNumber;
        
        if (!originalCompany || cep.length !== 8 || number.length < 1) {
            form.setValue("latitude", originalCompany?.location.latitude || null);
            form.setValue("longitude", originalCompany?.location.longitude || null);
            return;
        }
        
        const cepChanged = cep !== originalCompany.address.postalCode;
        const numberChanged = number !== originalCompany.address.number;
        
        if (cepChanged || numberChanged) {
             setIsGeocoding(true);
             form.setValue("latitude", null);
             form.setValue("longitude", null);

             try {
                const newLocation = await getGeolocationFromCEP(cep, number);
                
                form.setValue("latitude", newLocation.latitude);
                form.setValue("longitude", newLocation.longitude);
                toast({ title: "Geolocalização atualizada", description: "Novas coordenadas obtidas com sucesso." });
             } catch (error: any) {
                console.error("Erro de Geocodificação:", error);
                toast({ 
                    title: "Erro de Geocodificação", 
                    description: error.message || "Não foi possível obter as coordenadas. Verifique o CEP/Número.", 
                    variant: "destructive" 
                });
                form.setValue("latitude", null); 
                form.setValue("longitude", null);
             } finally {
                setIsGeocoding(false);
             }
        } else {
             // Se nada mudou, garante que os valores originais estão no form (caso contrário, o useForm pode perdê-los)
             form.setValue("latitude", originalCompany.location.latitude);
             form.setValue("longitude", originalCompany.location.longitude);
        }
        
    }, [watchedPostalCode, watchedNumber, originalCompany, form, toast]);


    // --- FUNÇÃO DE SUBMISSÃO (Chamada pelo form.handleSubmit) ---
    const submitHandler = useCallback(async (values: FormData) => {
        if (!originalCompany) return;
        
        const isAddressChanged = cleanCEP(values.address.postalCode) !== originalCompany.address.postalCode ||
                                values.address.number !== originalCompany.address.number;

        if (isAddressChanged && (values.latitude === null || values.longitude === null)) {
            toast({ 
                title: "Ação Necessária", 
                description: "O endereço foi alterado, mas as coordenadas geográficas (Latitude/Longitude) não puderam ser obtidas. Por favor, corrija o CEP/Número.", 
                variant: "destructive" 
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let finalLocation: Location = originalCompany.location;
            if(isAddressChanged && values.latitude !== null && values.longitude !== null) {
                finalLocation = {
                    latitude: values.latitude,
                    longitude: values.longitude,
                };
            }
            
            const updatePayload: CompanyUpdatePayload = {
                name: values.name,
                email: values.email,
                active: values.active === "true",
                address: {
                    postalCode: cleanCEP(values.address.postalCode), 
                    number: values.address.number,
                },
                location: finalLocation
            };

            await updateCompany(originalCompany.cnpj, updatePayload);

            toast({
                title: "Sucesso!",
                description: `A empresa ${values.name} foi atualizada.`,
            });
            
            // Recarrega a lista e reseta o formulário
            await fetchList(); 
            form.reset({ selectedCnpj: "" });
            setOriginalCompany(null);
            
        } catch (error: any) {
            console.error("Erro no processo de atualização:", error);
            toast({
                title: "Erro ao atualizar empresa",
                description: error.message || "Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [originalCompany, fetchList, form, toast]);


    // --- EFEITOS DE ORQUESTRAÇÃO ---
    
    useEffect(() => {
        fetchList();
    }, [fetchList]);

    useEffect(() => {
        if (selectedCnpj && selectedCnpj !== originalCompany?.cnpj && !isLoadingDetails) {
            fetchDetails(selectedCnpj);
        }
    }, [selectedCnpj, originalCompany, isLoadingDetails, fetchDetails]);

    useEffect(() => {
        if (originalCompany && cleanCEP(watchedPostalCode).length === 8 && watchedNumber.length >= 1) {
            handleGeocode();
        }
    }, [watchedPostalCode, watchedNumber, originalCompany, handleGeocode]);
    
    // --- HANDLER DE CANCELAMENTO ---
    const handleCancel = useCallback(() => {
        form.reset({ selectedCnpj: "" });
        setOriginalCompany(null);
    }, [form]);


    return {
        // Dados e Estados
        form,
        companies,
        originalCompany,
        isSubmitting,
        isFetchingCompanies,
        isLoadingDetails,
        isGeocoding,
        // Handlers e Funções
        onSubmit: form.handleSubmit(submitHandler), // Retorna a função de submit ligada ao hook-form
        formatCNPJ, // Função de utilidade pura
        cleanCEP, // Função de utilidade pura
        handleCancel
    };
};
