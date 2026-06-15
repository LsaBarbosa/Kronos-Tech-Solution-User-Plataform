import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { AvisosViewModel } from "./useAvisosViewModel";
import NoticeHero from "./NoticeHero";
import NoticeMetrics from "./NoticeMetrics";
import NoticeSearchFilters from "./NoticeSearchFilters";
import NoticeCard from "./NoticeCard";
import NoticeDetailPanel from "./NoticeDetailPanel";
import NoticePermissionFooter from "./NoticePermissionFooter";

interface AvisosMobileViewProps {
  model: AvisosViewModel;
  onCreate: () => void;
  onBack: () => void;
}

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
  </div>
);

const AvisosMobileView = ({ model, onCreate, onBack }: AvisosMobileViewProps) => {
  const {
    messages,
    visibleMessages,
    selectedMessage,
    isLoading,
    isFetching,
    error,
    hasPreviousPage,
    hasNextPage,
    handlePreviousPage,
    handleNextPage,
    handleOpenMessage,
    handleCloseDialog,
    handleConfirmDelete,
    canCreate,
    canDelete,
    permissionCopy,
    metrics,
    searchTerm,
    priorityFilter,
    setSearchTerm,
    setPriorityFilter,
    clearFilters,
    hasActiveFilters,
  } = model;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Início
        </Button>
      </div>

      <NoticeHero
        variant="mobile"
        canCreate={canCreate}
        onCreate={onCreate}
        permissionCopy={permissionCopy}
      />

      <NoticeMetrics {...metrics} />

      <NoticeSearchFilters
        variant="mobile"
        searchTerm={searchTerm}
        priorityFilter={priorityFilter}
        visibleCount={visibleMessages.length}
        totalCount={messages.length}
        hasActiveFilters={hasActiveFilters}
        canCreate={canCreate}
        onSearchTermChange={setSearchTerm}
        onPriorityFilterChange={setPriorityFilter}
        onCreate={onCreate}
        onClearFilters={clearFilters}
      />

      {error ? (
        <Card className="border-red-200 bg-red-50/70 shadow-sm">
          <CardContent className="px-4 py-6 text-center">
            <AlertTriangle className="mx-auto h-9 w-9 text-red-600" />
            <p className="mt-3 text-sm font-semibold text-red-800">Não foi possível carregar os avisos</p>
            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex items-center justify-center gap-3 px-4 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Carregando avisos...</span>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error ? (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <EmptyState
              title="Nenhum aviso disponível"
              description="Não existem avisos publicados para sua conta neste momento."
            />
          ) : visibleMessages.length === 0 ? (
            <EmptyState
              title="Nenhum resultado encontrado"
              description="Altere a busca ou os chips de prioridade para encontrar avisos."
            />
          ) : (
            visibleMessages.map((message) => (
              <NoticeCard
                key={message.messageId}
                message={message}
                variant="mobile"
                selected={selectedMessage?.messageId === message.messageId}
                onClick={() => handleOpenMessage(message)}
              />
            ))
          )}

          {messages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage || isLoading || isFetching}
                className="h-11 w-full"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNextPage || isLoading || isFetching}
                className="h-11 w-full"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Drawer open={Boolean(selectedMessage)} onOpenChange={(open) => (!open ? handleCloseDialog() : undefined)}>
        <DrawerContent className="h-[92vh] overflow-hidden rounded-t-[24px] border-border/70 bg-background px-0">
          <div className="max-h-[calc(92vh-1rem)] overflow-y-auto px-4 pb-4 pt-2 sm:px-5">
            <NoticeDetailPanel
              message={selectedMessage}
              variant="mobile"
              showCreateAction={false}
              showDeleteAction={canDelete}
              onCreate={onCreate}
              onRequestDelete={handleConfirmDelete}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <NoticePermissionFooter
        canCreate={canCreate}
        permissionCopy={permissionCopy}
        onCreate={onCreate}
      />
    </div>
  );
};

export default AvisosMobileView;
