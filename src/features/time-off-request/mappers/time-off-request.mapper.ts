import type { ManagerOption } from "@/types/vacation";
import type { TimeOffRequestType, TimeOffTypeOption } from "../types";

const titleCase = (value: string) =>
  value
    .split(/[\s._-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const initialsFrom = (value: string) => {
  const parts = titleCase(value).split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "K";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export interface TimeOffManagerDisplay {
  userId: string;
  username: string;
  displayName: string;
  initials: string;
  subtitle: string;
}

export const mapManagerOptionToDisplay = (manager: ManagerOption): TimeOffManagerDisplay => {
  const displayName = titleCase(manager.username);

  return {
    userId: manager.userId,
    username: manager.username,
    displayName,
    initials: initialsFrom(displayName),
    subtitle: "Gestor responsável pela aprovação",
  };
};

export const mapManagerOptionsToDisplay = (managers: ManagerOption[]) => managers.map(mapManagerOptionToDisplay);

export const TIME_OFF_TYPE_OPTIONS: TimeOffTypeOption[] = [
  {
    value: "TIME_OFF_REQUEST",
    label: "Abono de horas",
    description: "Atestado, folga acordada ou justificativa médica.",
  },
  {
    value: "FORGOTTEN_REGISTRATION",
    label: "Esquecimento de ponto",
    description: "Correção quando a marcação não foi registrada.",
  },
];

export const getTimeOffTypeOption = (type: TimeOffRequestType | "") =>
  TIME_OFF_TYPE_OPTIONS.find((option) => option.value === type);
