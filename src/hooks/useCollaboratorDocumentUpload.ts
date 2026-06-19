import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchEmployeesForSelection, uploadDocument } from "@/service/document.service";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES, type DocumentType, type EmployeeListItem } from "@/types/document";
import { safeLogger } from "@/utils/security/safeLogger";

const MAX_COMPRESS_SIZE_MB = 3;

type SelectedEmployee = {
  id: string;
  name: string;
};

const compressImage = (file: File, maxSizeMB: number = MAX_COMPRESS_SIZE_MB): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/") || file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0, img.width, img.height);

        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: blob.type,
                lastModified: Date.now(),
              });

              if (compressedFile.size <= maxSizeMB * 1024 * 1024 || quality <= 0.3) {
                resolve(compressedFile);
                return;
              }

              tryCompress(quality - 0.1);
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress(0.9);
      };
      img.onerror = () => reject(new Error("Falha ao carregar a imagem."));
      img.src = event?.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
};

export const useCollaboratorDocumentUpload = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<SelectedEmployee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>("EMPLOYEE_DOCUMENTS");
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState("true");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizingFile, setIsOptimizingFile] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [lastUploadAt, setLastUploadAt] = useState<Date | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { status: authStatus, role, user } = useAuth();

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    const userId = user?.profile?.employeeId || user?.account.employeeId || "";
    const userName = user?.profile?.fullName || "";
    const isManager = role === "MANAGER";
    const isPartnerRole = role === "PARTNER";

    setIsPartner(isPartnerRole);
    setCurrentUserName(userName);
    setUserRole(role || "");

    if (!isManager) {
      setEmployees([{ id: userId, name: userName }]);
      setSelectedEmployeeId(userId);
    } else {
      setSelectedEmployeeId("");
    }

    setSelectedDocumentType("EMPLOYEE_DOCUMENTS");

    if (!isManager) {
      return;
    }

    const loadEmployees = async () => {
      setIsFetchingEmployees(true);
      try {
        const data: EmployeeListItem[] = await fetchEmployeesForSelection(activeEmployeeFilter === "true");
        setEmployees(
          data.map((employee) => ({
            id: employee.employeeId,
            name: employee.fullName,
          }))
        );
      } catch (error) {
        safeLogger.error("Erro ao buscar funcionários:", error);
        toast({
          title: "Erro",
          description: "Erro ao buscar a lista de funcionários. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingEmployees(false);
      }
    };

    void loadEmployees();
  }, [activeEmployeeFilter, authStatus, role, toast, user]);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const validateAndSetFile = useCallback(
    async (file: File) => {
      setFileError(null);

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const isAllowed = ALLOWED_MIME_TYPES.some(
        (ext) => file.type.includes(ext.substring(1)) || fileExtension === ext.substring(1)
      );

      if (!isAllowed) {
        const message = `Formato não suportado. Aceitos: ${ALLOWED_MIME_TYPES.join(", ").toUpperCase()}.`;
        setFileError(message);
        toast({
          title: "Formato de arquivo inválido",
          description: `O arquivo "${file.name}" não é suportado.`,
          variant: "destructive",
        });
        resetFileInput();
        return;
      }

      setIsOptimizingFile(true);
      try {
        const finalFile = await compressImage(file);
        if (finalFile.size > MAX_UPLOAD_SIZE_BYTES) {
          const message = `Arquivo "${file.name}" excede o limite de 5MB.`;
          setFileError(message);
          toast({
            title: "Arquivo muito grande",
            description: message,
            variant: "destructive",
          });
          resetFileInput();
          return;
        }

        setSelectedFile(finalFile);
      } catch (error) {
        safeLogger.error("Erro ao processar arquivo:", error);
        const message = "Não foi possível processar o arquivo selecionado.";
        setFileError(message);
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        resetFileInput();
      } finally {
        setIsOptimizingFile(false);
      }
    },
    [resetFileInput, toast]
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        void validateAndSetFile(file);
      }
    },
    [validateAndSetFile]
  );

  const handleFileSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      await validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const removeFile = useCallback(
    (event?: MouseEvent<HTMLButtonElement>) => {
      event?.stopPropagation();
      setSelectedFile(null);
      setFileError(null);
      resetFileInput();
    },
    [resetFileInput]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !selectedEmployeeId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um funcionário e um arquivo.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      await uploadDocument(selectedFile, selectedEmployeeId, selectedDocumentType);
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

      setSelectedFile(null);
      setFileError(null);
      setLastUploadAt(new Date());
      resetFileInput();
      if (userRole !== "MANAGER") {
        setSelectedEmployeeId("");
      }
    } catch (error: unknown) {
      safeLogger.error("Erro de upload:", error);
      toast({
        title: "Erro",
        description: getAdministrativeErrorMessage(error, "document"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [resetFileInput, selectedDocumentType, selectedEmployeeId, selectedFile, toast, userRole]);

  return {
    sidebarOpen,
    handleToggleSidebar,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedDocumentType,
    setSelectedDocumentType,
    activeEmployeeFilter,
    setActiveEmployeeFilter,
    selectedFile,
    isDragOver,
    isUploading,
    isOptimizingFile,
    isFetchingEmployees,
    isPartner,
    currentUserName,
    userRole,
    fileError,
    lastUploadAt,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    validateAndSetFile,
    handleUpload,
    removeFile,
  };
};
