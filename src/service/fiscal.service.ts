// src/service/fiscal.service.ts
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

 

// Configuração base do Axios (ajuste conforme seu projeto já tenha uma instância configurada)
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
  // Espelho de Ponto (PDF)
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

  // AFD (TXT)
  downloadAfd: async (targetEmployeeId?: string) => {
    const params: any = {};
    if (targetEmployeeId) params.targetEmployeeId = targetEmployeeId;
    
    const response = await api.get('/legal/afd', { params, responseType: 'blob' });
    downloadBlob(new Blob([response.data]), 'AFD.txt');
  },

  // AEJ (P7S)
  downloadAej: async (startDate: string, endDate: string, targetEmployeeId?: string) => {
    const params: any = { startDate, endDate };
    if (targetEmployeeId) params.targetEmployeeId = targetEmployeeId;

    const response = await api.get('/legal/aej', { params, responseType: 'blob' });
    downloadBlob(new Blob([response.data]), `AEJ_${startDate}_${endDate}.p7s`);
  }
};