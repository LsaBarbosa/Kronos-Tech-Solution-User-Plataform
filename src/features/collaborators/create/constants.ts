export type CollaboratorAccessRole = "MANAGER" | "PARTNER";

export const COLLABORATOR_ROLE_OPTIONS: Array<{
  value: CollaboratorAccessRole;
  label: string;
  description: string;
}> = [
  {
    value: "MANAGER",
    label: "MANAGER",
    description: "Acesso gerencial com visão operacional.",
  },
  {
    value: "PARTNER",
    label: "PARTNER",
    description: "Acesso padrão do colaborador vinculado.",
  },
];

export const COLLABORATOR_SCHEDULE_OPTIONS = [
  {
    value: "TRADITIONAL_5X2",
    label: "Tradicional 5x2",
    description: "Segunda a sexta com rotina fixa.",
  },
  {
    value: "SIX_BY_ONE_FIXED",
    label: "6x1 com folga fixa",
    description: "Uma folga semanal definida.",
  },
  {
    value: "ROTATING_12X36",
    label: "Plantão 12x36",
    description: "Doze horas de trabalho por trinta e seis de descanso.",
  },
  {
    value: "ROTATING_24X72",
    label: "Plantão 24x72",
    description: "Vinte e quatro horas de trabalho por setenta e duas de descanso.",
  },
  {
    value: "SIX_BY_ONE_TWO_WEEKENDS",
    label: "6x1 + 2 fins de semana",
    description: "Inclui duas folgas de fim de semana no mês.",
  },
  {
    value: "SIX_BY_ONE_ONE_WEEKEND",
    label: "6x1 + 1 fim de semana",
    description: "Inclui um fim de semana de folga no mês.",
  },
  {
    value: "CUSTOM_DAYS",
    label: "Dias de trabalho",
    description: "Defina quais dias da semana o colaborador trabalha.",
  },
] as const;

export const COLLABORATOR_DAY_OPTIONS = [
  { value: "MONDAY", label: "Seg" },
  { value: "TUESDAY", label: "Ter" },
  { value: "WEDNESDAY", label: "Qua" },
  { value: "THURSDAY", label: "Qui" },
  { value: "FRIDAY", label: "Sex" },
  { value: "SATURDAY", label: "Sáb" },
  { value: "SUNDAY", label: "Dom" },
] as const;

export const COLLABORATOR_LONG_DAY_OPTIONS = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

export const COLLABORATOR_MOBILE_STEPS = [
  { number: "1", title: "Dados e empresa" },
  { number: "2", title: "Escala e jornada" },
] as const;
