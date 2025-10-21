// src/types/document.ts

/**
 * Interface base para o Documento.
 */
export interface Document {
  id: string;
  name: string;
  createdAt: string;
  type: string;
  // A URL de download não é mantida no estado, mas sim gerada pela API
}

/**
 * Interface para os dados resumidos do colaborador usados em listas de seleção (para DocumentoColaborador).
 */
export interface EmployeeListItem {
  employeeId: string;
  fullName: string;
}

/**
 * Interface para os dados de upload (usado no EnviarDocumentos).
 */
export interface UploadData {
  file: File | null;
  selectedEmployeeId: string;
  // Outros campos de metadados se necessário (ex: tipo de documento)
}

// --- Funções Utilitárias Puras ---

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc'];
export const ALLOWED_ACCEPT_STRING = ALLOWED_MIME_TYPES.join(', ');

export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
      // Formata para DD/MM/AAAA
      return new Date(dateString).toLocaleDateString('pt-BR');
  } catch (e) {
      return "Data Inválida";
  }
};