import type { ManagerOption } from "@/types/vacation";

const titleCase = (value: string) =>
  value
    .split(/[\s._-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const buildInitials = (value: string) => {
  const pieces = titleCase(value).split(" ").filter(Boolean);

  if (pieces.length === 0) {
    return "K";
  }

  return pieces
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export interface VacationManagerDisplay {
  userId: string;
  username: string;
  displayName: string;
  initials: string;
  subtitle: string;
}

export const mapManagerOptionToDisplay = (manager: ManagerOption): VacationManagerDisplay => {
  const displayName = titleCase(manager.username);

  return {
    userId: manager.userId,
    username: manager.username,
    displayName,
    initials: buildInitials(displayName),
    subtitle: "Manager responsável pela aprovação",
  };
};

export const mapManagerOptionsToDisplay = (managers: ManagerOption[]): VacationManagerDisplay[] =>
  managers.map(mapManagerOptionToDisplay);

