import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { APP_PATHS } from "@/config/app-routes";
import {
  checkCompanyCnpjAvailability,
  createCompany,
  getGeolocationFromCEP,
  type CompanyOnboardingRequest,
} from "@/service/company.service";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  cnpj: z.string().length(14, {
    message: "CNPJ deve ter 14 caracteres.",
  }),
  email: z.string().email({
    message: "Email deve ser válido.",
  }),
  address: z.object({
    postalCode: z.string().length(8, {
      message: "CEP deve ter 8 caracteres.",
    }),
    number: z.string().min(1, {
      message: "Número é obrigatório.",
    }),
  }),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export type CreateCompanyFormData = z.infer<typeof formSchema>;
type CnpjAvailability = "available" | "unavailable" | "checking" | null;

export const useCreateCompany = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [cnpjAvailability, setCnpjAvailability] = useState<CnpjAvailability>(null);
  const [isCheckingCNPJ, setIsCheckingCNPJ] = useState(false);

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      address: {
        postalCode: "",
        number: "",
      },
      location: {
        latitude: undefined,
        longitude: undefined,
      },
    },
  });

  const cep = form.watch("address.postalCode");
  const numero = form.watch("address.number");
  const currentLatitude = form.watch("location.latitude");

  const handleGeocodeAddress = useCallback(
    async (postalCode: string, number: string) => {
      if (postalCode.length !== 8 || number.length < 1) return;

      setIsGeocoding(true);
      form.setValue("location.latitude", undefined);
      form.setValue("location.longitude", undefined);

      try {
        const location = await getGeolocationFromCEP(postalCode, number);

        form.setValue("location.latitude", location.latitude ?? undefined);
        form.setValue("location.longitude", location.longitude ?? undefined);

        toast({
          title: "Localização capturada",
          description: "Coordenadas obtidas com sucesso.",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao consultar a API de localização.";

        toast({
          title: "Erro na geolocalização",
          description: message,
          variant: "destructive",
        });
        form.setValue("location.latitude", undefined);
        form.setValue("location.longitude", undefined);
      } finally {
        setIsGeocoding(false);
      }
    },
    [form, toast]
  );

  useEffect(() => {
    const normalizedCep = cep.replace(/\D/g, "");
    const isAddressReady = normalizedCep.length === 8 && numero.length > 0;
    const isGeocodingNeeded = isAddressReady && !isGeocoding && currentLatitude === undefined;

    if (isGeocodingNeeded) {
      void handleGeocodeAddress(normalizedCep, numero);
    }
  }, [cep, numero, currentLatitude, handleGeocodeAddress, isGeocoding]);

  const handleCheckCNPJ = useCallback(
    async (cnpjValue: string) => {
      const cnpj = cnpjValue.replace(/\D/g, "");

      if (cnpj.length !== 14) {
        toast({
          title: "Erro de validação",
          description: "O CNPJ deve ter 14 dígitos.",
          variant: "destructive",
        });
        setCnpjAvailability(null);
        return;
      }

      setIsCheckingCNPJ(true);
      setCnpjAvailability("checking");

      try {
        const available = await checkCompanyCnpjAvailability(cnpj);

        if (!available) {
          toast({
            title: "CNPJ indisponível",
            description: "Este CNPJ já está cadastrado no sistema.",
            variant: "destructive",
          });
          setCnpjAvailability("unavailable");
          return;
        }

        toast({
          title: "CNPJ disponível!",
          description: "Você pode usar este CNPJ para o registro.",
        });
        setCnpjAvailability("available");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao conectar com o servidor.";
        toast({
          title: "Erro de rede",
          description: message,
          variant: "destructive",
        });
        setCnpjAvailability(null);
      } finally {
        setIsCheckingCNPJ(false);
      }
    },
    [toast]
  );

  const onSubmit = useCallback(
    async (values: CreateCompanyFormData) => {
      setIsSubmitting(true);

      if (values.location.latitude === undefined || values.location.longitude === undefined) {
        toast({
          title: "Erro de validação",
          description: "Aguarde a geolocalização automática ser concluída (Latitude/Longitude).",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (cnpjAvailability !== "available") {
        toast({
          title: "Ação pendente",
          description: "É necessário verificar a disponibilidade do CNPJ antes de cadastrar a empresa.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      try {
        const payload: CompanyOnboardingRequest = {
          name: values.name,
          cnpj: values.cnpj.replace(/\D/g, ""),
          email: values.email,
          address: {
            postalCode: values.address.postalCode.replace(/\D/g, ""),
            number: values.address.number,
          },
          location: values.location,
        };

        await createCompany(payload);

        toast({
          title: "Empresa criada com sucesso!",
          description: `Agora, crie o primeiro Administrador da ${values.name}.`,
        });

        form.reset();
        setCnpjAvailability(null);
        navigate(APP_PATHS.criarAdministrador);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
        toast({
          title: "Erro ao cadastrar empresa",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [cnpjAvailability, form, navigate, toast]
  );

  const handleReset = useCallback(() => {
    form.reset();
    form.setValue("location.latitude", undefined);
    form.setValue("location.longitude", undefined);
    setCnpjAvailability(null);
  }, [form]);

  return {
    form,
    isSubmitting,
    isGeocoding,
    cnpjAvailability,
    isCheckingCNPJ,
    handleCheckCNPJ,
    onSubmit,
    handleReset,
  };
};
