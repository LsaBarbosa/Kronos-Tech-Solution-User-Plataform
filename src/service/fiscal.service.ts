import { api } from '@/config/api';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const FiscalService = {
  downloadMirror: async (startDate: string, endDate: string, targetEmployeeId?: string) => {
    const params: any = { startDate, endDate };
    if (targetEmployeeId) params.targetEmployeeId = targetEmployeeId;
    const response = await api.get('/legal/espelho-ponto', { params, responseType: 'blob' });
    downloadBlob(new Blob([response.data]), `Espelho_${startDate}_${endDate}.pdf`);
  },

  downloadTechnicalCertificate: async () => {
    const response = await api.get('/legal/technical-certificate', { responseType: 'blob' });
    downloadBlob(new Blob([response.data]), `Atestado_Tecnico.p7s`);
  },

  downloadAfd: async (targetEmployeeId?: string) => {
    const params: any = {};
    if (targetEmployeeId) params.targetEmployeeId = targetEmployeeId;
    const response = await api.get('/legal/afd', { params, responseType: 'blob' });
    downloadBlob(new Blob([response.data]), 'AFD.txt');
  },

  downloadAej: async (startDate: string, endDate: string, targetEmployeeId?: string) => {
    const params: any = { startDate, endDate };
    if (targetEmployeeId) params.targetEmployeeId = targetEmployeeId;
    const response = await api.get('/legal/aej', { params, responseType: 'blob' });
    downloadBlob(new Blob([response.data]), `AEJ_${startDate}_${endDate}.p7s`);
  }
};
