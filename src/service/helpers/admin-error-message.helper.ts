import { getServiceErrorMessage, normalizeServiceError } from "./service-error.helper";

export type AdminErrorDomain =
  | "document"
  | "fiscal"
  | "vacation"
  | "timeOff"
  | "manager";

const DOMAIN_FALLBACKS: Record<AdminErrorDomain, string> = {
  document: "Não foi possível salvar ou baixar o documento agora.",
  fiscal: "Não foi possível gerar o arquivo fiscal agora.",
  vacation: "Não foi possível processar a solicitação de férias.",
  timeOff: "Não foi possível processar a solicitação de abono.",
  manager: "Selecione um gestor válido da mesma empresa.",
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const getAdministrativeErrorMessage = (
  error: unknown,
  domain: AdminErrorDomain
): string => {
  const normalized = normalizeServiceError(error);
  const message = getServiceErrorMessage(normalized, DOMAIN_FALLBACKS[domain]);
  const comparable = normalizeText(`${message} ${JSON.stringify(normalized.data ?? {})}`);

  if (domain === "document") {
    if (comparable.includes("tipo") || comparable.includes("extensao") || comparable.includes("mime")) {
      return "O arquivo enviado não é aceito. Use PDF, JPG, JPEG ou PNG.";
    }

    if (comparable.includes("tamanho") || comparable.includes("limite") || comparable.includes("large")) {
      return "O arquivo excede o tamanho máximo permitido.";
    }

    if (comparable.includes("storage") || comparable.includes("s3") || comparable.includes("download")) {
      return "Não foi possível salvar ou baixar o documento agora.";
    }
  }

  if (domain === "fiscal") {
    if (normalized.kind === "rateLimit" || normalized.status === 429) {
      return message;
    }

    if (normalized.kind === "serviceUnavailable" || normalized.status === 503) {
      return "Serviço temporariamente indisponível. Tente novamente em instantes.";
    }

    if (comparable.includes("periodo") || comparable.includes("data")) {
      return "Confira as datas inicial e final do período.";
    }
  }

  if (domain === "vacation" && (comparable.includes("ja existe") || comparable.includes("duplic"))) {
    return "Já existe uma solicitação ou registro para esse período.";
  }

  if (domain === "timeOff" && (comparable.includes("ja existe") || comparable.includes("duplic"))) {
    return "Já existe registro ou solicitação para a data informada.";
  }

  if (domain === "manager" && (comparable.includes("manager") || comparable.includes("gestor"))) {
    return "Selecione um gestor válido da mesma empresa.";
  }

  return message || DOMAIN_FALLBACKS[domain];
};
