import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import UploadDesktopView from "@/features/upload-document/components/UploadDesktopView";
import UploadMobileView from "@/features/upload-document/components/UploadMobileView";
import { useUploadResponsiveMode } from "@/features/upload-document/useUploadResponsiveMode";
import { useCollaboratorDocumentUpload } from "@/hooks/useCollaboratorDocumentUpload";

const DocumentoColaborador = () => {
  const navigate = useNavigate();
  const { isDesktop } = useUploadResponsiveMode();
  const {
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
    currentUserName,
    userRole,
    fileError,
    lastUploadAt,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleUpload,
    removeFile,
  } = useCollaboratorDocumentUpload();

  const handleBack = useCallback(() => {
    navigate(APP_PATHS.dashboard);
  }, [navigate]);

  const sharedProps = {
    role: userRole,
    currentUserName,
    employees,
    selectedEmployeeId,
    onSelectEmployee: setSelectedEmployeeId,
    selectedDocumentType,
    onSelectDocumentType: setSelectedDocumentType,
    activeEmployeeFilter,
    onActiveEmployeeFilterChange: setActiveEmployeeFilter,
    isFetchingEmployees,
    selectedFile,
    isDragOver,
    isOptimizing: isOptimizingFile,
    isUploading,
    fileError,
    fileInputRef,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onFileSelect: handleFileSelect,
    onRemoveFile: () => removeFile(),
    onSubmit: handleUpload,
    onBack: handleBack,
  };

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 space-y-6 sm:space-y-8 relative z-10 overflow-x-hidden"
    >
      {isDesktop ? (
        <UploadDesktopView {...sharedProps} lastUploadAt={lastUploadAt} />
      ) : (
        <UploadMobileView {...sharedProps} />
      )}
    </PageShell>
  );
};

export default DocumentoColaborador;
