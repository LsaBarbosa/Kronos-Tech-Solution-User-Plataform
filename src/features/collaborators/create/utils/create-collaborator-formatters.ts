import { COLLABORATOR_DAY_OPTIONS, COLLABORATOR_SCHEDULE_OPTIONS } from "../constants";

const cpfMask = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const phoneMask = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

const cepMask = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);

  return digits
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

const currencyMask = (raw: string) => {
  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return (Number.parseFloat(digits) / 100)
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    .replace(/\u00a0/g, " ");
};

const currencyValue = (raw: string) => {
  const normalized = raw.replace(/[^\d,]/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);

  return Number.isFinite(value) ? value : 0;
};

const getScheduleOption = (scheduleType?: string) =>
  COLLABORATOR_SCHEDULE_OPTIONS.find((option) => option.value === scheduleType);

const getDayLabel = (day?: string) =>
  COLLABORATOR_DAY_OPTIONS.find((option) => option.value === day)?.label ?? day ?? "";

const formatDays = (days: string[] = []) =>
  days
    .map((day) => getDayLabel(day))
    .filter(Boolean)
    .join(" · ");

const formatJourney = ({
  workStartTime,
  breakStartTime,
  breakEndTime,
  workEndTime,
}: {
  workStartTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  workEndTime?: string;
}) => {
  const segments = [
    workStartTime && `Entrada ${workStartTime}`,
    breakStartTime && breakEndTime && `Intervalo ${breakStartTime} - ${breakEndTime}`,
    workEndTime && `Saída ${workEndTime}`,
  ].filter(Boolean);

  return segments.join(" · ");
};

const getHomeOfficeLabel = (homeOffice?: string | boolean | null) => {
  const enabled = homeOffice === true || homeOffice === "true";

  return {
    title: enabled ? "Dispensa geolocalização" : "Exige geolocalização",
    description: enabled
      ? "O colaborador pode trabalhar em home office sem rastreio operacional."
      : "A operação espera geolocalização ativa ao registrar a jornada.",
    tone: enabled ? "success" : "warning",
  } as const;
};

const getCpfVerificationLabel = (state: "available" | "unavailable" | "checking" | null) => {
  if (state === "available") {
    return {
      label: "CPF verificado",
      tone: "success" as const,
      description: "Disponível para prosseguir com o cadastro.",
    };
  }

  if (state === "unavailable") {
    return {
      label: "CPF indisponível",
      tone: "destructive" as const,
      description: "Este CPF já existe no sistema.",
    };
  }

  if (state === "checking") {
    return {
      label: "Verificando CPF",
      tone: "pending" as const,
      description: "A consulta ao cadastro está em andamento.",
    };
  }

  return {
    label: "CPF pendente",
    tone: "neutral" as const,
    description: "Valide o CPF antes de salvar o colaborador.",
  };
};

const getUsernameVerificationLabel = (state: "available" | "unavailable" | "checking" | null) => {
  if (state === "available") {
    return {
      label: "Username verificado",
      tone: "success" as const,
      description: "Disponível para criar o vínculo de acesso.",
    };
  }

  if (state === "unavailable") {
    return {
      label: "Username indisponível",
      tone: "destructive" as const,
      description: "Escolha outro identificador de acesso.",
    };
  }

  if (state === "checking") {
    return {
      label: "Verificando username",
      tone: "pending" as const,
      description: "Estamos consultando a disponibilidade.",
    };
  }

  return {
    label: "Username pendente",
    tone: "neutral" as const,
    description: "Valide o username antes de concluir.",
  };
};

const formatScheduleSummary = (scheduleType?: string, fixedWorkDays: string[] = []) => {
  const schedule = getScheduleOption(scheduleType);
  const days = formatDays(fixedWorkDays);

  if (!schedule) {
    return "Selecione a escala para ver o resumo.";
  }

  if (scheduleType === "TRADITIONAL_5X2" && days) {
    return [schedule.label, days].filter(Boolean).join(" · ");
  }

  return schedule.label;
};

export {
  cepMask,
  cpfMask,
  currencyMask,
  currencyValue,
  formatDays,
  formatJourney,
  formatScheduleSummary,
  getCpfVerificationLabel,
  getHomeOfficeLabel,
  getScheduleOption,
  getUsernameVerificationLabel,
  phoneMask,
};
