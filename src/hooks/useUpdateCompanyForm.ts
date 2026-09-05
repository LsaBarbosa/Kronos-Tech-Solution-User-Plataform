// src/hooks/useUpdateCompanyForm.ts

import { useState, useCallback, useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; //
import type { CompanyListItem, CompanyData, Location, CompanyUpdatePayload} from "@/types/company";
import { cleanCEP } from "@/types/company";
import { 
    fetchCompanyList, 
    fetchCompanyDetails, 
    updateCompany, 
    getGeolocationFromCEP,
    formatCNPJ
} from "@/service/company.service";
import { isAuthServiceError, normalizeServiceError } from "@/service/helpers/service-error.helper";
import { safeLogger } from "@/utils/security/safeLogger";

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
    latitude: z.number().min(-90, { message: "Latitude deve ser entre -90 e 90." }).max(90, { message: "Latitude deve ser entre -90 e 90." }).nullable().optional(),
    longitude: z.number().min(-180, { message: "Longitude deve ser entre -180 e 180." }).max(180, { message: "Longitude deve ser entre -180 e 180." }).nullable().optional(),
    manualLatitude: z.string().optional(),
    manualLongitude: z.string().optional(),
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
    useManualCoords: boolean;
    setUseManualCoords: (v: boolean) => void;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    formatCNPJ: (cnpj: string) => string;
    cleanCEP: (cep: string) => string;
    handleCancel: () => void;
}

const MAX_GEOCODE_ATTEMPTS = 3;

export const useUpdateCompanyForm = (): UseUpdateCompanyFormReturn => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companies, setCompanies] = useState<CompanyListItem[]>([]);
    const [isFetchingCompanies, setIsFetchingCompanies] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [originalCompany, setOriginalCompany] = useState<CompanyData | null>(null);
    const [geocodeAttempts, setGeocodeAttempts] = useState(0);
    const [useManualCoords, setUseManualCoords] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

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
            manualLatitude: "",
            manualLongitude: "",
        },
    });
    
    // Observadores de estado do formulário
    const selectedCnpj = form.watch("selectedCnpj");
    const watchedPostalCode = form.watch("address.postalCode");
    const watchedNumber = form.watch("address.number");
    const normalizedWatchedPostalCode = cleanCEP(watchedPostalCode || "");
    const hasAddressChanged = useMemo(() => {
        if (!originalCompany) return false;
        return normalizedWatchedPostalCode !== originalCompany.address.postalCode ||
            watchedNumber !== originalCompany.address.number;
    }, [normalizedWatchedPostalCode, watchedNumber, originalCompany]);

    // --- FUNÇÕES DE API ORQUESTRADAS ---

    const fetchList = useCallback(async () => {
        setIsFetchingCompanies(true);
        try {
            const data = await fetchCompanyList();
            setCompanies(data);
        } catch (error) {
            const normalized = normalizeServiceError(error);
            safeLogger.error("Erro ao buscar empresas:", normalized);
            if (isAuthServiceError(normalized)) navigate("/login");
            
            toast({ 
                title: "Erro", 
                description: normalized.message || "Não foi possível carregar a lista de empresas.", 
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
                latitude: data.location?.latitude ?? null, 
                longitude: data.location?.longitude ?? null,
            });

            toast({ title: "Dados carregados", description: `Detalhes de ${data.name} preenchidos no formulário.` });
        } catch (error) {
            const normalized = normalizeServiceError(error);
            safeLogger.error("Erro ao buscar detalhes da empresa:", normalized);
            toast({ 
                title: "Erro", 
                description: normalized.message || "Não foi possível carregar os detalhes da empresa.", 
                variant: "destructive" 
            });
            form.reset({ selectedCnpj: cnpj }); 
        } finally {
            setIsLoadingDetails(false);
        }
    }, [toast, form]);
    
    useEffect(() => {
        if (!originalCompany) return;
        if (useManualCoords) return;

        if (hasAddressChanged) {
            form.setValue("latitude", null, { shouldDirty: true, shouldValidate: false });
            form.setValue("longitude", null, { shouldDirty: true, shouldValidate: false });
            return;
        }

        form.setValue("latitude", originalCompany.location?.latitude ?? null, { shouldDirty: false, shouldValidate: false });
        form.setValue("longitude", originalCompany.location?.longitude ?? null, { shouldDirty: false, shouldValidate: false });
    }, [form, hasAddressChanged, originalCompany, useManualCoords]);


    // --- FUNÇÃO DE SUBMISSÃO (Chamada pelo form.handleSubmit) ---
    const submitHandler = useCallback(async (values: FormData) => {
        if (!originalCompany) return;

        const isAddressChanged = cleanCEP(values.address.postalCode) !== originalCompany.address.postalCode ||
                                values.address.number !== originalCompany.address.number;

        setIsSubmitting(true);
        setIsGeocoding(false);

        try {
            let finalLocation: Location | undefined = originalCompany.location ?? undefined;

            if (useManualCoords) {
                const parsedLat = values.manualLatitude ? parseFloat(values.manualLatitude) : null;
                const parsedLng = values.manualLongitude ? parseFloat(values.manualLongitude) : null;
                if (parsedLat !== null && parsedLng !== null && !isNaN(parsedLat) && !isNaN(parsedLng)) {
                    finalLocation = { latitude: parsedLat, longitude: parsedLng };
                    form.setValue("latitude", parsedLat, { shouldDirty: false });
                    form.setValue("longitude", parsedLng, { shouldDirty: false });
                } else {
                    toast({ title: "Coordenadas inválidas", description: "Informe latitude e longitude válidas.", variant: "destructive" });
                    return;
                }
            } else if (isAddressChanged) {
                setIsGeocoding(true);
                try {
                    const resolvedLocation = await getGeolocationFromCEP(
                        cleanCEP(values.address.postalCode),
                        values.address.number
                    );

                    finalLocation = resolvedLocation;
                    form.setValue("latitude", resolvedLocation.latitude, { shouldDirty: false, shouldValidate: false });
                    form.setValue("longitude", resolvedLocation.longitude, { shouldDirty: false, shouldValidate: false });
                    toast({ title: "Geolocalização atualizada", description: "Novas coordenadas obtidas com sucesso." });
                } catch (geoError) {
                    const geoMessage = geoError instanceof Error ? geoError.message : "Falha ao consultar a API de localização.";
                    toast({
                        title: "Aviso: Endereço não geolocalizado",
                        description: geoMessage,
                        variant: "destructive",
                    });
                } finally {
                    setIsGeocoding(false);
                }
            }

            const updatePayload: CompanyUpdatePayload = {
                name: values.name,
                email: values.email,
                active: values.active === "true",
                address: {
                    postalCode: cleanCEP(values.address.postalCode),
                    number: values.address.number,
                },
                ...(finalLocation ? { location: finalLocation } : {}),
            };

            await updateCompany(originalCompany.cnpj, updatePayload);

            toast({
                title: "Sucesso!",
                description: `A empresa ${values.name} foi atualizada.`,
            });

            await fetchList();
            form.reset({ selectedCnpj: "" });
            setOriginalCompany(null);
            setGeocodeAttempts(0);

        } catch (error) {
            const normalized = normalizeServiceError(error);
            safeLogger.error("Erro no processo de atualização:", normalized);
            toast({
                title: "Erro ao atualizar empresa",
                description: normalized.message || "Tente novamente mais tarde.",
                variant: "destructive",
            });
            if (isAuthServiceError(normalized)) navigate("/login");
        } finally {
            setIsSubmitting(false);
            setIsGeocoding(false);
        }
    }, [fetchList, form, navigate, originalCompany, toast, useManualCoords]);


    // --- EFEITOS DE ORQUESTRAÇÃO ---
    
    useEffect(() => {
        fetchList();
    }, [fetchList]);

    useEffect(() => {
        if (selectedCnpj && selectedCnpj !== originalCompany?.cnpj && !isLoadingDetails) {
            fetchDetails(selectedCnpj);
        }
    }, [selectedCnpj, originalCompany, isLoadingDetails, fetchDetails]);

    // --- HANDLER DE CANCELAMENTO ---
    const handleCancel = useCallback(() => {
        form.reset({ selectedCnpj: "" });
        setOriginalCompany(null);
        setGeocodeAttempts(0);
        setUseManualCoords(false);
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
        useManualCoords,
        setUseManualCoords,
        // Handlers e Funções
        onSubmit: form.handleSubmit(submitHandler),
        formatCNPJ,
        cleanCEP,
        handleCancel
    };
};
