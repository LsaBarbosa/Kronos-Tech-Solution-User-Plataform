import type {
  TodayTimeRecordItemResponse,
  TodayTimeRecordStatusResponse,
} from "@/types/today-time-record";

type Tone = {
  badgeClassName: string;
  surfaceClassName: string;
  textClassName: string;
  dotClassName: string;
};

type SequenceSummary = {
  label: string;
  description: string;
  tone: Tone;
};

type SequenceAnalysis = {
  isValid: boolean;
  balance: number;
};

type PrimaryActionDescriptor = {
  enabled: boolean;
  label: string;
};

const CHECKIN_CODES = new Set(["CHECK_IN", "CHECKIN", "CHECKIN_AFTER_BREAK", "CHECKIN_ON_DAY_OFF"]);
const CHECKOUT_CODES = new Set(["CHECK_OUT", "CHECKOUT"]);
const PENDING_CODES = new Set([
  "PENDING",
  "PENDING_APPROVAL",
  "TIME_OFF_REQUEST",
  "WORK_TIME_REQUEST",
  "REQUEST_VACATION",
  "UNKNOWN",
]);

const toneInfo: Tone = {
  badgeClassName: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  surfaceClassName: "bg-[#EFF6FF] text-[#1D4ED8]",
  textClassName: "text-[#1D4ED8]",
  dotClassName: "bg-[#2563EB]",
};

const toneSuccess: Tone = {
  badgeClassName: "border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
  surfaceClassName: "bg-[#DCFCE7] text-[#15803D]",
  textClassName: "text-[#15803D]",
  dotClassName: "bg-[#16A34A]",
};

const toneWarning: Tone = {
  badgeClassName: "border-[#FCD34D] bg-[#FEF3C7] text-[#B45309]",
  surfaceClassName: "bg-[#FEF3C7] text-[#B45309]",
  textClassName: "text-[#B45309]",
  dotClassName: "bg-[#F59E0B]",
};

const toneDanger: Tone = {
  badgeClassName: "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
  surfaceClassName: "bg-[#FEE2E2] text-[#B91C1C]",
  textClassName: "text-[#B91C1C]",
  dotClassName: "bg-[#DC2626]",
};

const toneNeutral: Tone = {
  badgeClassName: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  surfaceClassName: "bg-[#F8FAFC] text-[#475569]",
  textClassName: "text-[#475569]",
  dotClassName: "bg-[#94A3B8]",
};

const normalizeCode = (value?: string | null) =>
  (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const humanizeCode = (value?: string | null) => {
  const normalized = normalizeCode(value);
  if (!normalized) {
    return "Nao informado";
  }

  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

const hasTimeComponent = (value?: string | null) =>
  Boolean(value && /[T\s]\d{2}:\d{2}/.test(value));

const parseTodayDateValue = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const native = new Date(trimmed);
  if (!Number.isNaN(native.getTime())) {
    return native;
  }

  const brMatch = trimmed.match(
    /^(\d{2})-(\d{2})-(\d{4})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!brMatch) {
    return null;
  }

  const [, day, month, year, hours = "0", minutes = "0", seconds = "0"] = brMatch;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds)
  );
};

const asTimelineAction = (value?: string | null) => {
  const normalized = normalizeCode(value);
  if (CHECKIN_CODES.has(normalized)) {
    return "IN";
  }
  if (CHECKOUT_CODES.has(normalized)) {
    return "OUT";
  }
  return "OTHER";
};

const formatDateWithOptions = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
  fallback = "Nao informado"
) => {
  const parsed = parseTodayDateValue(value);
  if (!parsed) {
    return value?.trim() || fallback;
  }

  return new Intl.DateTimeFormat("pt-BR", options).format(parsed);
};

const analyzeTodaySequence = (
  todayStatus: TodayTimeRecordStatusResponse | null
): SequenceAnalysis => {
  if (!todayStatus?.records.length) {
    return {
      isValid: true,
      balance: 0,
    };
  }

  let balance = 0;
  let lastAction = "";

  for (const record of todayStatus.records) {
    const action = asTimelineAction(record.actionType);

    if (action === "OTHER") {
      return {
        isValid: false,
        balance,
      };
    }

    if (!lastAction && action !== "IN") {
      return {
        isValid: false,
        balance,
      };
    }

    if (lastAction === action) {
      return {
        isValid: false,
        balance,
      };
    }

    balance += action === "IN" ? 1 : -1;
    if (balance < 0 || balance > 1) {
      return {
        isValid: false,
        balance,
      };
    }

    lastAction = action;
  }

  return {
    isValid: true,
    balance,
  };
};

export const formatTodayHeadlineDate = (value?: string | null) =>
  formatDateWithOptions(value, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const formatTodayRecordedAt = (value?: string | null) => {
  if (!value) {
    return "Sem horario";
  }

  if (!parseTodayDateValue(value)) {
    return value;
  }

  return hasTimeComponent(value)
    ? formatDateWithOptions(value, { hour: "2-digit", minute: "2-digit" })
    : formatDateWithOptions(value, { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const getTodayStatusLabel = (status?: string | null) => {
  switch (normalizeCode(status)) {
    case "READY_TO_CHECKIN":
      return "Pronto para entrada";
    case "READY_TO_CHECKOUT":
      return "Jornada em andamento";
    case "COMPLETED":
      return "Jornada concluida";
    case "TERMS_REQUIRED":
      return "Termo biometrico pendente";
    case "CREATED":
      return "Registrado";
    case "UPDATED":
      return "Ajustado";
    case "PENDING":
      return "Pendente";
    case "PENDING_APPROVAL":
      return "Aguardando aprovacao";
    case "UPDATE_REJECTED":
      return "Ajuste rejeitado";
    case "TIME_OFF_REQUEST":
      return "Abono solicitado";
    case "WORK_TIME_REQUEST":
      return "Ajuste solicitado";
    case "TIME_OFF_REJECTED":
      return "Abono rejeitado";
    case "REQUEST_VACATION":
      return "Ferias solicitadas";
    case "VACATION":
      return "Ferias";
    case "VACATION_REJECTED":
      return "Ferias rejeitadas";
    case "DAY_OFF":
      return "Folga";
    case "ABSENCE":
      return "Ausencia";
    case "UNKNOWN":
      return "Status indisponivel";
    default:
      return humanizeCode(status);
  }
};

export const getTodayStatusTone = (status?: string | null): Tone => {
  switch (normalizeCode(status)) {
    case "READY_TO_CHECKIN":
    case "UPDATED":
      return toneInfo;
    case "READY_TO_CHECKOUT":
    case "PENDING":
    case "PENDING_APPROVAL":
    case "TIME_OFF_REQUEST":
    case "WORK_TIME_REQUEST":
    case "REQUEST_VACATION":
    case "TERMS_REQUIRED":
      return toneWarning;
    case "COMPLETED":
    case "CREATED":
    case "VACATION":
      return toneSuccess;
    case "UPDATE_REJECTED":
    case "TIME_OFF_REJECTED":
    case "VACATION_REJECTED":
    case "ABSENCE":
      return toneDanger;
    default:
      return toneNeutral;
  }
};

export const getTodayNextActionLabel = (nextAction?: string | null) => {
  switch (normalizeCode(nextAction)) {
    case "CHECK_IN":
    case "CHECKIN":
    case "CHECKIN_AFTER_BREAK":
    case "CHECKIN_ON_DAY_OFF":
      return "Registrar entrada";
    case "CHECK_OUT":
    case "CHECKOUT":
      return "Registrar saida";
    case "VIEW_REPORT":
      return "Jornada concluida";
    case "ACCEPT_TERMS":
      return "Aceitar termo biometrico";
    case "NONE":
      return "Sem acao pendente";
    default:
      return humanizeCode(nextAction);
  }
};

export const getTodayPrimaryActionDescriptor = (
  todayStatus: TodayTimeRecordStatusResponse | null
): PrimaryActionDescriptor => {
  if (!todayStatus) {
    return {
      enabled: false,
      label: "Registrar ponto",
    };
  }

  if (normalizeCode(todayStatus.status) === "TERMS_REQUIRED") {
    return {
      enabled: true,
      label: getTodayNextActionLabel(todayStatus.nextAction),
    };
  }

  const normalizedNextAction = normalizeCode(todayStatus.nextAction);
  if (CHECKIN_CODES.has(normalizedNextAction) || CHECKOUT_CODES.has(normalizedNextAction)) {
    return {
      enabled: true,
      label: getTodayNextActionLabel(todayStatus.nextAction),
    };
  }

  const sequence = analyzeTodaySequence(todayStatus);
  if (!sequence.isValid) {
    return {
      enabled: false,
      label: getTodayNextActionLabel(todayStatus.nextAction),
    };
  }

  return {
    enabled: true,
    label: sequence.balance === 1 ? "Registrar saida" : "Registrar entrada",
  };
};

export const getTodayActionTypeLabel = (actionType?: string | null) => {
  switch (normalizeCode(actionType)) {
    case "CHECK_IN":
    case "CHECKIN":
      return "Entrada";
    case "CHECK_OUT":
    case "CHECKOUT":
      return "Saida";
    case "CHECKIN_AFTER_BREAK":
      return "Volta da pausa";
    case "CHECKIN_ON_DAY_OFF":
      return "Registro em folga";
    default:
      return humanizeCode(actionType);
  }
};

export const getTodayLastRecordTypeLabel = (lastRecordType?: string | null) =>
  getTodayActionTypeLabel(lastRecordType);

export const getTodayPendingCount = (todayStatus: TodayTimeRecordStatusResponse | null) => {
  if (!todayStatus) {
    return 0;
  }

  const recordPendingCount = todayStatus.records.reduce((count, record) => {
    return PENDING_CODES.has(normalizeCode(record.status)) ? count + 1 : count;
  }, 0);

  const extraPending = normalizeCode(todayStatus.status) === "TERMS_REQUIRED" ? 1 : 0;
  return recordPendingCount + extraPending;
};

export const getTodaySourceLabel = (source?: string | null) => {
  switch (normalizeCode(source)) {
    case "PERSISTED":
      return "Banco principal";
    case "REDIS_CACHE":
      return "Cache Redis";
    case "BIOMETRIC":
      return "Biometria";
    case "UNKNOWN":
      return "Origem nao informada";
    default:
      return source?.trim() || "Origem nao informada";
  }
};

export const getTodayTimezoneLabel = (timezone?: string | null) =>
  timezone?.trim() || "Fuso nao informado";

export const getTodayWorkedTimeLabel = (todayStatus: TodayTimeRecordStatusResponse | null) => {
  if (!todayStatus?.records.length) {
    return "00h00";
  }

  let lastCheckin: Date | null = null;
  let workedMinutes = 0;

  for (const record of todayStatus.records) {
    const action = asTimelineAction(record.actionType);
    const parsed = parseTodayDateValue(record.recordedAt);

    if (!parsed) {
      continue;
    }

    if (action === "IN") {
      lastCheckin = parsed;
      continue;
    }

    if (action === "OUT" && lastCheckin) {
      const diffMinutes = Math.max(0, Math.round((parsed.getTime() - lastCheckin.getTime()) / 60000));
      workedMinutes += diffMinutes;
      lastCheckin = null;
    }
  }

  const hours = String(Math.floor(workedMinutes / 60)).padStart(2, "0");
  const minutes = String(workedMinutes % 60).padStart(2, "0");
  return `${hours}h${minutes}`;
};

export const getTodaySequenceSummary = (
  todayStatus: TodayTimeRecordStatusResponse | null
): SequenceSummary => {
  if (!todayStatus) {
    return {
      label: "Indisponivel",
      description: "A consulta de hoje ainda nao foi carregada.",
      tone: toneNeutral,
    };
  }

  if (normalizeCode(todayStatus.status) === "TERMS_REQUIRED") {
    return {
      label: "Revisar",
      description: "A biometria depende da aceitacao do termo para prosseguir.",
      tone: toneWarning,
    };
  }

  if (!todayStatus.records.length) {
    return {
      label: "Pronto",
      description: "Nenhuma marcacao registrada. Aguardando a primeira acao do dia.",
      tone: toneInfo,
    };
  }

  const sequence = analyzeTodaySequence(todayStatus);

  if (!sequence.isValid) {
    return {
      label: "Inconsistente",
      description: "A sequencia do dia precisa de revisao antes da proxima marcacao.",
      tone: toneDanger,
    };
  }

  const pendingCount = getTodayPendingCount(todayStatus);
  if (pendingCount > 0) {
    return {
      label: "Revisar",
      description: `${pendingCount} pendencia(s) operacional(is) na timeline de hoje.`,
      tone: toneWarning,
    };
  }

  if (sequence.balance === 1) {
    return {
      label: "Em aberto",
      description: "A jornada esta consistente e ainda aguarda a proxima saida.",
      tone: toneInfo,
    };
  }

  return {
    label: "Valida",
    description: "",
    tone: toneSuccess,
  };
};

export const getTodaySecondaryActionLabel = (todayStatus: TodayTimeRecordStatusResponse | null) =>
  normalizeCode(todayStatus?.nextAction) === "VIEW_REPORT" ? "Abrir relatorio" : "Abrir espelho";

export const getTodayRecordSourceLabel = (record: TodayTimeRecordItemResponse) =>
  getTodaySourceLabel(record.source);
