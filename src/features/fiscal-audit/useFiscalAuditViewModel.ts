import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FiscalService } from "@/service/fiscal.service";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { dateToBackendDatePattern } from "@/utils/date-format";
import {
  FISCAL_REPORTS,
  type FiscalReportDescriptor,
  type FiscalReportType,
} from "./utils/fiscal-helpers";

export interface FiscalAuditViewModel {
  reportType: FiscalReportType;
  setReportType: (type: FiscalReportType) => void;
  descriptor: FiscalReportDescriptor;
  monthRef: Date | undefined;
  setMonthRef: (date: Date | undefined) => void;
  isLoading: boolean;
  isCtaDisabled: boolean;
  download: () => Promise<void>;
}

export const useFiscalAuditViewModel = (): FiscalAuditViewModel => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<FiscalReportType>("AEJ");
  const [monthRef, setMonthRef] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const descriptor = FISCAL_REPORTS[reportType];

  const isCtaDisabled = isLoading || (descriptor.requiresMonth && !monthRef);

  const download = useCallback(async () => {
    if (descriptor.requiresMonth && !monthRef) {
      toast({
        variant: "destructive",
        title: "Data obrigatória",
        description: "Selecione o mês de referência para gerar o AEJ.",
      });
      return;
    }

    setIsLoading(true);

    try {
      toast({ title: "Processando...", description: `Gerando arquivo ${reportType}...` });

      switch (reportType) {
        case "AEJ": {
          const year = monthRef?.getFullYear() ?? new Date().getFullYear();
          const month = monthRef?.getMonth() ?? new Date().getMonth();
          const startDate = dateToBackendDatePattern(new Date(year, month, 1));
          const endDate = dateToBackendDatePattern(new Date(year, month + 1, 0));
          await FiscalService.downloadAej(startDate, endDate);
          break;
        }
        case "AFD":
          await FiscalService.downloadAfd();
          break;
        case "ATESTADO":
          await FiscalService.downloadTechnicalCertificate();
          break;
      }

      toast({
        title: "Sucesso!",
        description: "Arquivo baixado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: getAdministrativeErrorMessage(error, "fiscal"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [descriptor.requiresMonth, monthRef, reportType, toast]);

  return useMemo(
    () => ({
      reportType,
      setReportType,
      descriptor,
      monthRef,
      setMonthRef,
      isLoading,
      isCtaDisabled,
      download,
    }),
    [descriptor, download, isCtaDisabled, isLoading, monthRef, reportType]
  );
};
