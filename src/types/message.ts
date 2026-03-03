// src/types/message.ts

export const MESSAGE_PRIORITY = {
  NORMAL: 'NORMAL',
  ALERT: 'ALERT',
  CRITICAL: 'CRITICAL',
} as const;

export type MessagePriority = (typeof MESSAGE_PRIORITY)[keyof typeof MESSAGE_PRIORITY];
export type MessagePriorityInput = Lowercase<MessagePriority>;

export interface Message {
  messageId: string;
  title: string;
  messageText: string;
  priority: MessagePriority;
  createdAt: string;
  senderEmployeeId: string;
  recipientEmployeeId?: string;
}

export interface MessagePayload {
  title: string;
  messageText: string;
  priority: MessagePriority;
  recipientEmployeeIds: string[];
}

const PRIORITY_TITLE_MAP: Record<MessagePriority, string> = {
  NORMAL: 'Aviso Informativo',
  ALERT: 'Aviso de Alerta',
  CRITICAL: 'Aviso Crítico',
};

const TIPO_LABEL_MAP: Record<MessagePriorityInput, string> = {
  normal: 'Normal',
  alert: 'Alerta',
  critical: 'Crítico',
};

const TIPO_COLOR_MAP: Record<MessagePriorityInput, string> = {
  normal: 'text-muted-foreground',
  alert: 'text-yellow-600',
  critical: 'text-destructive',
};

const normalizePriority = (value: string): MessagePriority | null => {
  const normalized = value.toUpperCase() as MessagePriority;
  return normalized in PRIORITY_TITLE_MAP ? normalized : null;
};

const normalizeTipo = (value: string): MessagePriorityInput | null => {
  const normalized = value.toLowerCase() as MessagePriorityInput;
  return normalized in TIPO_LABEL_MAP ? normalized : null;
};


export const toMessagePriority = (value: string): MessagePriority => {
  const normalized = normalizePriority(value);
  return normalized ?? MESSAGE_PRIORITY.NORMAL;
};

export const getMessagePriorityTitle = (priority: string): string => {
  const normalized = normalizePriority(priority);
  return normalized ? PRIORITY_TITLE_MAP[normalized] : 'Aviso';
};

export const getTipoLabel = (tipo: string): string => {
  const normalized = normalizeTipo(tipo);
  return normalized ? TIPO_LABEL_MAP[normalized] : 'Selecione o tipo';
};

export const getTipoColor = (tipo: string): string => {
  const normalized = normalizeTipo(tipo);
  return normalized ? TIPO_COLOR_MAP[normalized] : 'text-muted-foreground';
};

export const getRecipientIndicatorText = (
  message: Message,
): { text: string; isSenderOnly: boolean } => {
  const isSenderOnly = !message.recipientEmployeeId;
  return {
    text: isSenderOnly ? 'Visível Apenas para o Remetente' : 'Mensagem Direcionada',
    isSenderOnly,
  };
};
