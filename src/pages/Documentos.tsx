import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";
import { APP_PATHS } from "@/config/app-routes";
import { useDocumentsPage } from "@/hooks/useDocumentsPage";
import DocumentsDesktopView from "@/features/documents/components/DocumentsDesktopView";
import DocumentsMobileView from "@/features/documents/components/DocumentsMobileView";
import DocumentDeleteDialog from "@/features/documents/components/DocumentDeleteDialog";
import { useDocumentsResponsiveMode } from "@/features/documents/useDocumentsResponsiveMode";

const ITEMS_PER_PAGE = 10;

const Documentos = () => {
  const navigate = useNavigate();
  const { isDesktop } = useDocumentsResponsiveMode();
  const {
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
    handleSearch,
    handleDownload,
    handleDateFilterChange,
    formatDate,
    clearFilters,
    documentPendingDelete,
    isDeletingDocument,
    requestDeleteDocument,
    cancelDeleteDocument,
    confirmDeleteDocument,
  } = useDocumentsPage();

  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedEmployeeId, selectedDocumentType, searchDate, hasSearched]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE));
  const paginatedDocuments = useMemo(
    () =>
      filteredDocuments.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
      ),
    [currentPage, filteredDocuments]
  );

  const handleBack = useCallback(() => {
    navigate(APP_PATHS.dashboard);
  }, [navigate]);

  const sharedProps = {
    role,
    employees,
    selectedEmployeeId,
    onSelectEmployee: setSelectedEmployeeId,
    selectedDocumentType,
    onSelectDocumentType: setSelectedDocumentType,
    activeEmployeeFilter,
    onActiveEmployeeFilterChange: setActiveEmployeeFilter,
    isFetchingEmployees,
    searchDate,
    onSearchDateChange: handleDateFilterChange,
    documents,
    filteredDocuments,
    paginatedDocuments,
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    isSearching,
    hasSearched,
    isPartner,
    onSearch: handleSearch,
    onDownload: handleDownload,
    onRequestDelete: requestDeleteDocument,
    onBack: handleBack,
    formatDate,
  };

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 space-y-6 sm:space-y-8 relative z-10 overflow-x-hidden"
    >
      {isDesktop ? (
        <DocumentsDesktopView {...sharedProps} onClearFilters={clearFilters} />
      ) : (
        <DocumentsMobileView {...sharedProps} />
      )}

      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.DOCUMENTS} className="mt-4" />

      <DocumentDeleteDialog
        document={documentPendingDelete}
        open={Boolean(documentPendingDelete)}
        isDeleting={isDeletingDocument}
        onCancel={cancelDeleteDocument}
        onConfirm={confirmDeleteDocument}
        formatDate={formatDate}
      />
    </PageShell>
  );
};

export default Documentos;
