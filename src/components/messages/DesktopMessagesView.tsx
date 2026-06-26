import { ChevronLeft, ChevronRight, Inbox, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message, MessageScope } from "@/types/message";
import { MessagePriorityBadge } from "./MessagePriorityBadge";
import { MessageScopeBadge } from "./MessageScopeBadge";

export type MessageScopeFilter = "ALL" | MessageScope;

interface DesktopMessagesViewProps {
  messages: Message[];
  filteredMessages: Message[];
  selectedMessage: Message | null;
  scopeFilter: MessageScopeFilter;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  canCreate: boolean;
  canDeleteSelected: boolean;
  onFilterChange: (value: MessageScopeFilter) => void;
  onSelectMessage: (message: Message) => void;
  onCreate: () => void;
  onRequestDelete: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const FILTER_OPTIONS: Array<{ value: MessageScopeFilter; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "GLOBAL", label: "Globais" },
  { value: "DIRECT", label: "Direcionados" },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const DesktopMessagesView = ({
  messages,
  filteredMessages,
  selectedMessage,
  scopeFilter,
  isLoading,
  isFetching,
  error,
  currentPage,
  hasPreviousPage,
  hasNextPage,
  canCreate,
  canDeleteSelected,
  onFilterChange,
  onSelectMessage,
  onCreate,
  onRequestDelete,
  onPreviousPage,
  onNextPage,
}: DesktopMessagesViewProps) => (
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#486581]">Avisos</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#102A43]">Central interna</h1>
      </div>
      {canCreate ? (
        <Button onClick={onCreate} className="bg-[#0F4C81] text-white hover:bg-[#0B3A61]">
          Novo Aviso
        </Button>
      ) : null}
    </div>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
      <Card className="border-[#D9E2EC] bg-white">
        <CardHeader className="gap-4 border-b border-[#D9E2EC]">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl text-[#102A43]">Inbox</CardTitle>
            <span className="text-sm text-[#627D98]">{filteredMessages.length} de {messages.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={scopeFilter === option.value ? "default" : "outline"}
                className={scopeFilter === option.value ? "bg-[#0F4C81]" : "border-[#BCCCDC] text-[#102A43]"}
                onClick={() => onFilterChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {isLoading ? (
            <div className="flex items-center gap-3 py-10 text-[#627D98]">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando avisos...
            </div>
          ) : null}
          {!isLoading && filteredMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D9E2EC] px-6 py-12 text-center text-[#627D98]">
              <Inbox className="mx-auto h-10 w-10 opacity-60" />
              <p className="mt-4">Nenhum aviso encontrado para o filtro atual.</p>
            </div>
          ) : null}
          {!isLoading ? (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <button
                  key={message.messageId}
                  type="button"
                  onClick={() => onSelectMessage(message)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedMessage?.messageId === message.messageId
                      ? "border-[#0F4C81] bg-[#F0F4F8]"
                      : "border-[#D9E2EC] bg-white hover:border-[#9FB3C8]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <MessageScopeBadge scope={message.scope} />
                    <MessagePriorityBadge priority={message.priority} />
                    {typeof message.deliveredCount === "number" ? (
                      <span className="text-xs text-[#627D98]">{message.deliveredCount} entrega(s)</span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-[#102A43]">{message.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#486581]">{message.messageText}</p>
                  <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[#829AB1]">
                    <span>{message.senderName || "Remetente interno"}</span>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-[#D9E2EC] pt-4">
            <Button variant="outline" onClick={onPreviousPage} disabled={!hasPreviousPage || isFetching}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-[#627D98]">Pagina {currentPage + 1}</span>
            <Button variant="outline" onClick={onNextPage} disabled={!hasNextPage || isFetching}>
              Proxima
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#D9E2EC] bg-white">
        <CardHeader className="border-b border-[#D9E2EC]">
          <CardTitle className="text-xl text-[#102A43]">Detalhe do aviso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {selectedMessage ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <MessageScopeBadge scope={selectedMessage.scope} />
                <MessagePriorityBadge priority={selectedMessage.priority} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#102A43]">{selectedMessage.title}</h2>
                <p className="mt-2 text-sm text-[#627D98]">
                  {selectedMessage.senderName || "Remetente interno"} • {formatDate(selectedMessage.createdAt)}
                </p>
              </div>
              {selectedMessage.scope === "GLOBAL" ? (
                <div className="rounded-2xl border border-[#D9E2EC] bg-[#F8FAFC] px-4 py-3 text-sm text-[#334E68]">
                  Aviso global entregue automaticamente para usuarios ativos da plataforma.
                </div>
              ) : null}
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#243B53]">{selectedMessage.messageText}</p>
              {typeof selectedMessage.seen === "boolean" ? (
                <p className="text-sm text-[#627D98]">
                  {selectedMessage.seen ? "Marcado como lido" : "Ainda nao lido"}
                </p>
              ) : null}
              <div className="flex gap-3">
                {canCreate ? (
                  <Button onClick={onCreate} className="bg-[#0F4C81] text-white hover:bg-[#0B3A61]">
                    Novo Aviso
                  </Button>
                ) : null}
                {canDeleteSelected ? (
                  <Button variant="destructive" onClick={onRequestDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D9E2EC] px-6 py-16 text-center text-[#627D98]">
              Selecione um aviso para visualizar o detalhe.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);
