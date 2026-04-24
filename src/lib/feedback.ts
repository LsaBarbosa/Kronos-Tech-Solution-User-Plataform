import { toast } from "@/hooks/use-toast";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

type ToastVariant = "default" | "destructive";

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, description ? { description } : undefined);
};

export const showErrorToast = (
  message: string,
  description?: string,
  variant: ToastVariant = "destructive"
) => {
  toast.error(message, {
    description,
    variant,
  });
};

export const showServiceErrorToast = (
  error: unknown,
  fallbackMessage: string,
  options?: {
    title?: string;
    variant?: ToastVariant;
  }
) => {
  const description = getServiceErrorMessage(error, fallbackMessage);

  toast.error(options?.title ?? "Erro", {
    description,
    variant: options?.variant ?? "destructive",
  });
};
