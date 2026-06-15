import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AvisosViewModel } from "./useAvisosViewModel";
import NoticeCard from "./NoticeCard";
import NoticeHero from "./NoticeHero";
import NoticeMetrics from "./NoticeMetrics";
import NoticeSearchFilters from "./NoticeSearchFilters";
import NoticeDetailPanel from "./NoticeDetailPanel";

interface AvisosDesktopViewProps {
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
  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-5 py-10 text-center">
    <Inbox className="mx-auto h-10 w-10 text-muted-foreground/50" />
    <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
  </div>
);

const AvisosDesktopView = ({ model, onCreate, onBack }: AvisosDesktopViewProps) => {
  const {
    messages,
    visibleMessages,
    selectedMessage,
    isLoading,
    isFetching,
    error,
    currentPage,
    hasPreviousPage,
    hasNextPage,
    handlePreviousPage,
    handleNextPage,
    handleOpenMessage,
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
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao início
        </Button>
      </div>

      <NoticeHero
        variant="desktop"
        canCreate={canCreate}
        onCreate={onCreate}
        permissionCopy={permissionCopy}
      />

      <NoticeMetrics {...metrics} />

      <div className="mx-auto w-full max-w-5xl">
        <NoticeSearchFilters
          variant="desktop"
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
      </div>

      {error ? (
        <Card className="mx-auto max-w-3xl border-red-200 bg-red-50/70 shadow-sm">
          <CardContent className="px-6 py-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-600" />
            <h3 className="mt-3 text-lg font-semibold text-red-800">Não foi possível carregar os avisos</h3>
            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex items-center justify-center gap-3 px-6 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Carregando avisos...</span>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_420px] items-start">
          <section className="min-w-0">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-muted/10 px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Inbox de avisos
                    </p>
                    <CardTitle className="text-xl">Leitura e priorização</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-border/70 text-[11px]">
                    {visibleMessages.length} visíveis
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 px-4 py-4 sm:px-5">
                {messages.length === 0 ? (
                  <EmptyState
                    title="Nenhum aviso disponível"
                    description="Ainda não existem avisos publicados para a sua companhia."
                  />
                ) : visibleMessages.length === 0 ? (
                  <EmptyState
                    title="Nenhum resultado para os filtros atuais"
                    description="Ajuste a busca ou limpe os filtros para visualizar os avisos disponíveis."
                  />
                ) : (
                  <>
                    <div className="space-y-3">
                      {visibleMessages.map((message) => (
                        <NoticeCard
                          key={message.messageId}
                          message={message}
                          variant="desktop"
                          selected={selectedMessage?.messageId === message.messageId}
                          onClick={() => handleOpenMessage(message)}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage || isLoading || isFetching}
                        className="w-full sm:w-auto"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
                        <span>Página {currentPage + 1}</span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasNextPage || isLoading || isFetching}
                        className="w-full sm:w-auto"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          <aside className="min-w-0 self-start">
            <NoticeDetailPanel
              message={selectedMessage}
              variant="desktop"
              showCreateAction={canCreate}
              showDeleteAction={canDelete}
              onCreate={onCreate}
              onRequestDelete={handleConfirmDelete}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default AvisosDesktopView;
