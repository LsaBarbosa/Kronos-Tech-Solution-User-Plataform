import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { Message, MessageScope } from "@/types/message";
import { MessagePriorityBadge } from "./MessagePriorityBadge";
import { MessageScopeBadge } from "./MessageScopeBadge";

export type MobileMessageScopeFilter = "ALL" | MessageScope;

interface MobileMessagesViewProps {
  messages: Message[];
  filteredMessages: Message[];
  selectedMessage: Message | null;
  scopeFilter: MobileMessageScopeFilter;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  canCreate: boolean;
  canDeleteSelected: boolean;
  onFilterChange: (value: MobileMessageScopeFilter) => void;
  onSelectMessage: (message: Message) => void;
  onCloseDetail: () => void;
  onCreate: () => void;
  onRequestDelete: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const FILTER_OPTIONS: Array<{ value: MobileMessageScopeFilter; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "GLOBAL", label: "Globais" },
  { value: "DIRECT", label: "Diretos" },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export const MobileMessagesView = ({
  messages,
  filteredMessages,
  selectedMessage,
  scopeFilter,
  isLoading,
  isFetching,
  error,
  hasPreviousPage,
  hasNextPage,
  canCreate,
  canDeleteSelected,
  onFilterChange,
  onSelectMessage,
  onCloseDetail,
  onCreate,
  onRequestDelete,
  onPreviousPage,
  onNextPage,
}: MobileMessagesViewProps) => (
  <div className="flex w-full flex-col gap-4 pb-28">
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTER_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={scopeFilter === option.value ? "default" : "outline"}
          className={`shrink-0 ${scopeFilter === option.value ? "bg-[#0F4C81]" : "border-[#BCCCDC] text-[#102A43]"}`}
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>

    {error ? <p className="text-sm text-red-600">{error}</p> : null}
    {isLoading ? (
      <div className="flex items-center gap-3 rounded-2xl border border-[#D9E2EC] bg-white px-4 py-5 text-[#627D98]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando avisos...
      </div>
    ) : null}

    {!isLoading && filteredMessages.length === 0 ? (
      <Card className="border-[#D9E2EC] bg-white">
        <CardContent className="px-4 py-8 text-center text-[#627D98]">
          Nenhum aviso encontrado neste filtro.
        </CardContent>
      </Card>
    ) : null}

    {!isLoading ? (
      <div className="space-y-3">
        {filteredMessages.map((message) => (
          <button
            key={message.messageId}
            type="button"
            onClick={() => onSelectMessage(message)}
            className="w-full rounded-2xl border border-[#D9E2EC] bg-white p-4 text-left shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <MessageScopeBadge scope={message.scope} />
              <MessagePriorityBadge priority={message.priority} />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-[#102A43]">{message.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#486581]">{message.messageText}</p>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#829AB1]">
              <span>{message.senderName || "Remetente interno"}</span>
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    ) : null}

    {messages.length > 0 ? (
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onPreviousPage} disabled={!hasPreviousPage || isFetching}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button variant="outline" onClick={onNextPage} disabled={!hasNextPage || isFetching}>
          Proxima
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ) : null}

    <Drawer open={Boolean(selectedMessage)} onOpenChange={(open) => (!open ? onCloseDetail() : undefined)}>
      <DrawerContent className="max-h-[88vh] rounded-t-[28px] bg-white">
        {selectedMessage ? (
          <div className="space-y-4 overflow-y-auto px-4 pb-6 pt-4">
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
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#243B53]">{selectedMessage.messageText}</p>
            <div className="flex gap-3">
              {canDeleteSelected ? (
                <Button variant="destructive" onClick={onRequestDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>

    {canCreate ? (
      <div className="fixed bottom-5 left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
        <Button onClick={onCreate} className="h-12 w-full bg-[#0F4C81] text-white hover:bg-[#0B3A61]">
          <Plus className="mr-2 h-4 w-4" />
          Novo Aviso
        </Button>
      </div>
    ) : null}
  </div>
);
