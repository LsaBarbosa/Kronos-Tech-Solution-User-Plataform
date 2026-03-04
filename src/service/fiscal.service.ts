// src/service/fiscal.service.ts
import { buildApiUrl, downloadFile } from "./fileDownload.service";

export const FiscalService = {
  downloadMirror: async (startDate: string, endDate: string, targetEmployeeId?: string) => {
    const url = buildApiUrl("legal/espelho-ponto", {
      startDate,
      endDate,
      targetEmployeeId,
    });

    await downloadFile(url, {
      filename: `Espelho_${startDate}_${endDate}.pdf`,
    });
  },

  downloadTechnicalCertificate: async () => {
    const url = buildApiUrl("legal/technical-certificate");
    await downloadFile(url, {
      filename: "Atestado_Tecnico.p7s",
    });
  },

  downloadAfd: async (targetEmployeeId?: string) => {
    const url = buildApiUrl("legal/afd", { targetEmployeeId });
    await downloadFile(url, {
      filename: "AFD.txt",
    });
  },

  downloadAej: async (startDate: string, endDate: string, targetEmployeeId?: string) => {
    const url = buildApiUrl("legal/aej", {
      startDate,
      endDate,
      targetEmployeeId,
    });

    await downloadFile(url, {
      filename: `AEJ_${startDate}_${endDate}.p7s`,
    });
  },
};
