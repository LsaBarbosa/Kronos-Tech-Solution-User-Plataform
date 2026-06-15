import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast, showSuccessToast } from "@/lib/feedback";
import {
  deleteDocument,
  downloadDocument,
  fetchDocuments,
  fetchEmployeesForSelection,
} from "@/service/document.service";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import type { DocumentType } from "@/types/document";

export interface DocumentItem {
  id: string;
  name: string;
  createdAt: string;
  type: DocumentType;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

export const useDocumentsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | "">("");
  const [searchDate, setSearchDate] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState("true");
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [documentPendingDelete, setDocumentPendingDelete] = useState<DocumentItem | null>(null);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);

  const { status: authStatus, role, user } = useAuth();

  const currentUserId = user?.profile?.employeeId || user?.account.employeeId || "";
  const currentUserName = user?.profile?.fullName || "";

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    setIsPartner(role === "PARTNER");

    if (role === "PARTNER") {
      setEmployees([{ id: currentUserId, name: currentUserName }]);
      setSelectedEmployeeId(currentUserId);
      return;
    }

    const fetchEmployees = async () => {
      setIsFetchingEmployees(true);
      try {
        const data = await fetchEmployeesForSelection(activeEmployeeFilter === "true");
        setEmployees(
          data.map((emp) => ({
            id: emp.employeeId,
            name: emp.fullName,
          }))
        );
        setSelectedEmployeeId("");
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
        showErrorToast("Erro", "Erro ao buscar a lista de funcionários. Tente novamente.");
      } finally {
        setIsFetchingEmployees(false);
      }
    };

    void fetchEmployees();
  }, [activeEmployeeFilter, authStatus, currentUserId, currentUserName, role]);

  const getDocumentTypeLabel = useCallback((type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      PAYSLIP: "Contracheque",
      TIME_OFF: "Abono de Horas",
      DOCUMENTS: "Documentos",
      EMPLOYEE_DOCUMENTS: "Documentos Pessoais",
      POINT_RECORD_RECEIPT: "Comprovante de Ponto",
      BIOMETRIC_CONSENT_TERM: "Termo de Consentimento Biométrico",
      SERVICE_CONTRACT_TERMS: "Termo de Contrato de Serviço",
    };

    return labels[type];
  }, []);

  const handleSearch = useCallback(async () => {
    if (!selectedEmployeeId || !selectedDocumentType) {
      showErrorToast("Atenção", "Por favor, selecione um funcionário e um tipo de documento.");
      return;
    }

    const documentType = selectedDocumentType;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const data = await fetchDocuments({
        employeeId: selectedEmployeeId,
        type: documentType,
        ...(searchDate ? { date: searchDate } : {}),
      });

      setDocuments(data);
      showSuccessToast(
        "Documentos encontrados",
        `${data.length} documento(s) encontrado(s) - ${getDocumentTypeLabel(documentType)}`
      );
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      showErrorToast("Erro", getAdministrativeErrorMessage(error, "document"));
      setDocuments([]);
    } finally {
      setIsSearching(false);
    }
  }, [getDocumentTypeLabel, searchDate, selectedEmployeeId, selectedDocumentType]);

  const normalizedDocuments = useMemo(() => documents, [documents]);

  const toISODate = useCallback((dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const [datePart] = dateStr.split(" T ");
      const parts = datePart.split("-");
      if (parts.length === 3) {
        const [day, month, twoDigitYear] = parts;
        if (twoDigitYear.length === 2) {
          return `20${twoDigitYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    } catch {
      return "";
    }
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!searchDate) {
      return normalizedDocuments;
    }

    return normalizedDocuments.filter((doc) => toISODate(doc.createdAt) === searchDate);
  }, [normalizedDocuments, searchDate, toISODate]);

  const handleDateFilterChange = useCallback((date: string) => {
    setSearchDate(date);
  }, []);

  const requestDeleteDocument = useCallback((document: DocumentItem) => {
    setDocumentPendingDelete(document);
  }, []);

  const cancelDeleteDocument = useCallback(() => {
    if (isDeletingDocument) return;
    setDocumentPendingDelete(null);
  }, [isDeletingDocument]);

  const confirmDeleteDocument = useCallback(async () => {
    const target = documentPendingDelete;
    if (!target) return;

    if (!selectedEmployeeId) {
      showErrorToast("Atenção", "Funcionário não selecionado. Não é possível deletar.");
      setDocumentPendingDelete(null);
      return;
    }

    setIsDeletingDocument(true);
    try {
      await deleteDocument(target.id, selectedEmployeeId || undefined);
      setDocuments((prev) => prev.filter((doc) => doc.id !== target.id));
      showSuccessToast("Documento excluído", `Documento "${target.name}" excluído com sucesso!`);
      setDocumentPendingDelete(null);
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      showErrorToast("Erro", getAdministrativeErrorMessage(error, "document"));
    } finally {
      setIsDeletingDocument(false);
    }
  }, [documentPendingDelete, selectedEmployeeId]);

  const handleDownload = useCallback(async (document: DocumentItem) => {
    try {
      await downloadDocument(document.id, document.name, selectedEmployeeId || undefined);
      showSuccessToast("Download iniciado", `Download de ${document.name} iniciado`);
    } catch (error) {
      console.error("Erro ao iniciar o download:", error);
      showErrorToast("Erro", getAdministrativeErrorMessage(error, "document"));
    }
  }, [selectedEmployeeId]);

  const formatDate = useCallback((dateString: string) => {
    try {
      const [datePart] = dateString.split(" T ");
      const [day, month, year] = datePart.split("-");
      const formattedDate = new Date(`20${year}-${month}-${day}`);
      if (Number.isNaN(formattedDate.getTime())) {
        return dateString;
      }
      return formattedDate.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedDocumentType("");
    setSearchDate("");
    if (!isPartner) {
      setSelectedEmployeeId("");
    }
  }, [isPartner]);

  return {
    sidebarOpen,
    handleToggleSidebar,
    role,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedDocumentType,
    setSelectedDocumentType,
    searchDate,
    filteredDocuments,
    documents,
    isSearching,
    hasSearched,
    activeEmployeeFilter,
    setActiveEmployeeFilter,
    isFetchingEmployees,
    isPartner,
    currentUserName,
    handleSearch,
    handleDownload,
    handleDateFilterChange,
    formatDate,
    getDocumentTypeLabel,
    clearFilters,
    documentPendingDelete,
    isDeletingDocument,
    requestDeleteDocument,
    cancelDeleteDocument,
    confirmDeleteDocument,
  };
};
