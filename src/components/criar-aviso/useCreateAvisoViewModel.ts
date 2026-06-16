import { useMemo } from "react";
import { useCreateAvisoForm } from "@/hooks/useCreateAvisoForm";
import { getTipoLabel } from "@/types/message";

export type CreateAvisoToneClass = {
  dot: string;
  badge: string;
};

const TIPO_TONES: Record<string, CreateAvisoToneClass> = {
  normal: {
    dot: "bg-[#3B82F6]",
    badge: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  },
  alert: {
    dot: "bg-[#F59E0B]",
    badge: "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  },
  critical: {
    dot: "bg-[#DC2626]",
    badge: "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
  },
};

const NEUTRAL_TONE: CreateAvisoToneClass = {
  dot: "bg-[#94A3B8]",
  badge: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
};

export const useCreateAvisoViewModel = () => {
  const base = useCreateAvisoForm();
  const { formState, employees } = base;
  const { title, tipo, mensagem, selectedEmployeeIds } = formState;

  const tipoLabel = useMemo(
    () => (tipo ? getTipoLabel(tipo) : "Não definido"),
    [tipo]
  );

  const tipoTone = useMemo<CreateAvisoToneClass>(
    () => TIPO_TONES[tipo] ?? NEUTRAL_TONE,
    [tipo]
  );

  const recipientsLabel = useMemo(() => {
    if (selectedEmployeeIds.length === 0) return "Apenas para você";
    if (selectedEmployeeIds.length === employees.length && employees.length > 0) {
      return `Todos os colaboradores (${employees.length})`;
    }
    return `${selectedEmployeeIds.length} de ${employees.length} colaboradores`;
  }, [employees.length, selectedEmployeeIds.length]);

  const messageLength = mensagem.length;
  const isMessageTooLong = messageLength > 500;
  const titleLength = title.length;

  return {
    ...base,
    tipoLabel,
    tipoTone,
    recipientsLabel,
    messageLength,
    isMessageTooLong,
    titleLength,
  };
};

export type CreateAvisoViewModel = ReturnType<typeof useCreateAvisoViewModel>;
