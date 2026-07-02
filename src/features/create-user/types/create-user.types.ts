import * as z from "zod";

export type UserCreationType = "ADMINISTRADOR" | "COLABORADOR";

export const ROLE_BY_TYPE = {
  ADMINISTRADOR: "MANAGER",
  COLABORADOR: "PARTNER",
} as const satisfies Record<UserCreationType, string>;

export const USER_TYPE_OPTIONS: Array<{ value: UserCreationType; label: string; description: string }> = [
  {
    value: "ADMINISTRADOR",
    label: "Administrador",
    description: "Acesso gerencial ao tenant da empresa.",
  },
  {
    value: "COLABORADOR",
    label: "Colaborador",
    description: "Acesso padrão do colaborador vinculado.",
  },
];

export const SCHEDULE_OPTIONS = [
  { value: "TRADITIONAL_5X2", label: "Tradicional 5x2 (Seg-Sex)" },
  { value: "SIX_BY_ONE_FIXED", label: "6x1 com Folga Fixa" },
  { value: "ROTATING_12X36", label: "Plantão 12x36" },
  { value: "ROTATING_24X72", label: "Plantão 24x72" },
  { value: "SIX_BY_ONE_TWO_WEEKENDS", label: "6x1 + 2 Finais de Semana" },
  { value: "SIX_BY_ONE_ONE_WEEKEND", label: "6x1 + 1 Final de Semana" },
] as const;

export const DAY_OPTIONS = [
  { value: "MONDAY", label: "Seg" },
  { value: "TUESDAY", label: "Ter" },
  { value: "WEDNESDAY", label: "Qua" },
  { value: "THURSDAY", label: "Qui" },
  { value: "FRIDAY", label: "Sex" },
  { value: "SATURDAY", label: "Sáb" },
  { value: "SUNDAY", label: "Dom" },
] as const;

export const DAY_OPTIONS_LONG = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

export const PREFERRED_DAY_OPTIONS = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

// Schema base compartilhado entre os dois tipos
export const baseEmployeeSchema = z.object({
  companyId: z.string().min(1, "Selecione a empresa"),
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().length(14, "CPF deve ter 11 dígitos"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  salario: z.string().min(1, "Salário é obrigatório"),
  telefone: z.string().length(15, "Telefone deve ter 11 dígitos"),
  cep: z.string().length(9, "CEP deve ter 8 dígitos"),
  numero: z.string().min(1, "Número é obrigatório"),
  scheduleType: z.string().min(1, "Tipo de escala é obrigatório"),
  scaleStartDate: z.string().optional(),
  preferredDayOff: z.string().optional(),
  weekendOffIndex: z.string().optional(),
  fixedWorkDays: z.array(z.string()).optional(),
});

// Campos extras exclusivos do tipo COLABORADOR
export const colaboradorExtraSchema = z.object({
  homeOffice: z.enum(["true", "false"]).optional(),
  workStartTime: z.string().min(1, "Hora de início é obrigatória").optional(),
  workEndTime: z.string().min(1, "Hora de fim é obrigatória").optional(),
  breakStartTime: z.string().min(1, "Início do intervalo é obrigatório").optional(),
  breakEndTime: z.string().min(1, "Fim do intervalo é obrigatório").optional(),
});

export const userStepSchema = z.object({
  username: z.string().min(4, "Usuário deve ter pelo menos 4 caracteres"),
});

export const unifiedFormSchema = baseEmployeeSchema
  .merge(colaboradorExtraSchema)
  .extend({
    username: z.string().optional(),
  });

export type UnifiedFormData = z.infer<typeof unifiedFormSchema>;

export type AvailabilityStatus = "available" | "unavailable" | "checking" | null;
