import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchEmployeesForSelection, uploadDocument } from "@/service/document.service";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES, type DocumentType, type EmployeeListItem } from "@/types/document";

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
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>("PAYSLIP");
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState("true");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [userRole, setUserRole] = useState("");

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

    setSelectedDocumentType(isManager ? "PAYSLIP" : "TIME_OFF");

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
        console.error("Erro ao buscar funcionários:", error);
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

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleFileSelect = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const isAllowed = ALLOWED_MIME_TYPES.some(
        (ext) => file.type.includes(ext.substring(1)) || fileExtension === ext.substring(1)
      );

      if (!isAllowed) {
        toast({
          title: "Formato de arquivo inválido",
          description: `O arquivo "${file.name}" não é suportado. Tipos aceitos: ${ALLOWED_MIME_TYPES.join(", ")}.`,
          variant: "destructive",
        });
        resetFileInput();
        return;
      }

      try {
        const finalFile = await compressImage(file);
        if (finalFile.size > MAX_UPLOAD_SIZE_BYTES) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo "${file.name}" excede o limite máximo de 5MB.`,
            variant: "destructive",
          });
          resetFileInput();
          return;
        }

        setSelectedFile(finalFile);
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        toast({
          title: "Erro",
          description: "Não foi possível processar o arquivo selecionado.",
          variant: "destructive",
        });
        resetFileInput();
      }
    },
    [resetFileInput, toast]
  );

  const removeFile = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setSelectedFile(null);
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
      resetFileInput();
      if (userRole !== "MANAGER") {
        setSelectedEmployeeId("");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao enviar documento. Tente novamente.";
      console.error("Erro de upload:", error);
      toast({
        title: "Erro",
        description: message,
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
    isFetchingEmployees,
    isPartner,
    currentUserName,
    userRole,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleUpload,
    removeFile,
  };
};
