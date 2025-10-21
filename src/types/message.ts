// src/types/message.ts

export type MessagePriority = 'NORMAL' | 'ALERT' | 'CRITICAL';

/**
 * Interface para os dados da mensagem lida/buscada.
 */
export interface Message {
  messageId: string;
  title: string;
  messageText: string;
  priority: MessagePriority;
  createdAt: string;
  senderEmployeeId: string;
  recipientEmployeeId?: string; // Se nulo, visível apenas para o remetente (Manager/CTO)
}

/**
 * Interface para o payload de envio de uma nova mensagem (para CriarAviso.tsx).
 */
export interface MessagePayload {
    title: string;
    messageText: string;
    priority: MessagePriority;
    recipientEmployeeIds: string[]; // Pode ser vazia
}

// --- Funções Utilitárias Puras de Exibição ---

/**
 * Retorna o título formatado com base na prioridade.
 */
export const getMessagePriorityTitle = (priority: string): string => {
    const p = priority.toUpperCase();
    switch (p) {
      case 'NORMAL':
        return "Aviso Informativo";
      case 'ALERT':
        return "Aviso de Alerta";
      case 'CRITICAL':
        return "Aviso Crítico";
      default:
        return "Aviso";
    }
};

/**
 * Retorna o rótulo formatado (para o Select).
 */
export const getTipoLabel = (tipo: string): string => {
    switch (tipo) {
      case "normal": return "Normal";
      case "alert": return "Alerta";
      case "critical": return "Crítico";
      default: return "Selecione o tipo";
    }
};

/**
 * Retorna a cor do texto formatada com base na prioridade (para estilização).
 */
export const getTipoColor = (tipo: string): string => { 
    switch (tipo) {
      case "normal": return "text-muted-foreground";
      case "alert": return "text-yellow-600";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
};

/**
 * Retorna o texto do indicador de destinatário e se a mensagem é só para o remetente.
 */
export const getRecipientIndicatorText = (message: Message): { text: string; isSenderOnly: boolean } => {
    const isSenderOnly = !message.recipientEmployeeId;
    return {
        text: isSenderOnly ? "Visível Apenas para o Remetente" : "Mensagem Direcionada",
        isSenderOnly: isSenderOnly
    };
};