import { useMemo, type ReactNode } from "react";
import { ShieldCheck, Sparkles, BadgeCheck, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { UseCreateCollaboratorReturn } from "@/hooks/useCreateCollaborator";

import {
  COLLABORATOR_DAY_OPTIONS,
  COLLABORATOR_FLOW_RULES,
  COLLABORATOR_LONG_DAY_OPTIONS,
  COLLABORATOR_MOBILE_STEPS,
  COLLABORATOR_ROLE_OPTIONS,
  COLLABORATOR_SCHEDULE_OPTIONS,
} from "../constants";
import {
  formatJourney,
  formatScheduleSummary,
  getCpfVerificationLabel,
  getHomeOfficeLabel,
  getUsernameVerificationLabel,
} from "../utils/create-collaborator-formatters";
import { StatusBadge } from "./StatusBadge";

type CreateCollaboratorViewModel = UseCreateCollaboratorReturn;

interface CreateCollaboratorMobileProps {
  vm: CreateCollaboratorViewModel;
  activeStep: number;
  onStepChange: (step: number) => void;
  onPrimaryAction: () => Promise<void>;
}

const MobileStepHeader = ({
  step,
  active,
  locked,
  onClick,
}: {
  step: string;
  active: boolean;
  locked?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    disabled={locked}
    onClick={onClick}
    className={cn(
      "flex min-h-[76px] w-full items-center gap-3 rounded-[26px] border px-4 py-3 text-left transition-all",
      active
        ? "border-blue-300 bg-blue-50 text-slate-900 shadow-sm"
        : "border-slate-200 bg-white text-slate-500",
      locked && "cursor-not-allowed opacity-60"
    )}
  >
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
      )}
    >
      {step}
    </div>
    <div className="min-w-0">
      <div className="text-sm font-semibold">Etapa {step}</div>
      <div className="text-xs text-slate-500">{active ? "Em edição" : locked ? "Bloqueada" : "Toque para abrir"}</div>
    </div>
  </button>
);

const MobileCollapsedSummary = ({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: ReactNode;
}) => (
  <div className="space-y-2">
    <div className="text-lg font-semibold text-slate-900">{title}</div>
    <div className="text-sm leading-5 text-slate-500">{subtitle}</div>
    {badge ? <div className="pt-2">{badge}</div> : null}
  </div>
);

const CreateCollaboratorMobile = ({
  vm,
  activeStep,
  onStepChange,
  onPrimaryAction,
}: CreateCollaboratorMobileProps) => {
  const { user } = useAuth();
  const roleLabel = user?.role ?? "MANAGER";

  const cpfBadge = getCpfVerificationLabel(vm.cpfAvailability);
  const usernameBadge = getUsernameVerificationLabel(vm.usernameAvailability);
  const homeOfficeLabel = getHomeOfficeLabel(vm.form.watch("homeOffice"));
  const selectedScheduleType = vm.form.watch("scheduleType");
  const scheduleSummary = formatScheduleSummary(selectedScheduleType, vm.form.watch("fixedWorkDays") ?? []);
  const journeySummary = formatJourney({
    workStartTime: vm.form.watch("workStartTime"),
    breakStartTime: vm.form.watch("breakStartTime"),
    breakEndTime: vm.form.watch("breakEndTime"),
    workEndTime: vm.form.watch("workEndTime"),
  });
  const isTraditional = selectedScheduleType === "TRADITIONAL_5X2";
  const isSixByOne = selectedScheduleType?.includes("SIX_BY_ONE");
  const isRotating = selectedScheduleType?.startsWith("ROTATING");

  const actionLabel = useMemo(() => {
    if (activeStep === 0) {
      return "Próximo: Escala";
    }

    if (activeStep === 1) {
      return "Salvar dados e continuar";
    }

    return "Concluir cadastro";
  }, [activeStep]);

  const actionDescription = useMemo(() => {
    if (activeStep === 0) {
      return "Revise os dados pessoais antes de avançar.";
    }

    if (activeStep === 1) {
      return "Salvar colaborador para liberar o vínculo de acesso.";
    }

    return "Username e perfil serão enviados para criação do vínculo.";
  }, [activeStep]);

  const handleCpfMask = (value: string) => vm.maskCPF(value);
  const handlePhoneMask = (value: string) => vm.maskPhone(value);
  const handleCepMask = (value: string) => vm.maskCEP(value);
  const handleCurrencyMask = (value: string) => vm.maskCurrency(value);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#0B1220_0%,#1E3A8A_22%,#F8FAFC_22%,#F8FAFC_100%)] text-slate-900">
      <header className="px-4 pt-4 sm:px-6">
        <div className="rounded-[28px] bg-[linear-gradient(90deg,#0B1220_0%,#12367A_60%,#2563EB_100%)] px-4 py-5 text-white shadow-[0_30px_80px_-60px_rgba(37,99,235,0.8)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">K</div>
              <div>
                <div className="text-lg font-semibold leading-tight">Criar colaborador</div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/70">Onboarding</div>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
              {roleLabel}
            </Badge>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Novo cadastro</h1>
            <p className="mt-1 text-sm text-white/78">Dados, escala e acesso.</p>
          </div>
        </div>
      </header>

      <main className="space-y-4 px-4 pb-28 pt-4 sm:px-6">
        <section className="rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {COLLABORATOR_MOBILE_STEPS.map((step, index) => {
              const locked = (vm.stepCompleted && index < 2) || (index === 2 && !vm.savedEmployeeId);

              return (
                <MobileStepHeader
                  key={step.title}
                  step={step.number}
                  active={activeStep === index}
                  locked={locked}
                  onClick={locked ? undefined : () => onStepChange(index)}
                />
              );
            })}
          </div>
        </section>

        <Card className={cn("rounded-[28px] border-slate-200 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)]", activeStep === 0 ? "bg-white" : "bg-white/92")}>
          <CardHeader className="gap-2 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-slate-900">1. Dados pessoais</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">Nome, CPF, cargo, email e telefone.</CardDescription>
              </div>
              <StatusBadge label={cpfBadge.label} tone={cpfBadge.tone} description={cpfBadge.description} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            {activeStep === 0 ? (
              <div className="space-y-4">
                <FormField
                  control={vm.form.control}
                  name="nomeCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" className="h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vm.form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            className="h-12 rounded-xl"
                            maxLength={14}
                            {...field}
                            onChange={(event) => field.onChange(handleCpfMask(event.target.value))}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={vm.handleCheckCPF}
                          disabled={vm.isCheckingCPF || field.value.replace(/\D/g, "").length < 11}
                          className="h-12 rounded-xl px-4"
                        >
                          {vm.isCheckingCPF ? "Verificando" : "Validar"}
                        </Button>
                      </div>
                      <FormDescription className="text-xs text-slate-500">A validação bloqueia duplicidade antes do envio.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vm.form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Cargo" className="h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vm.form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nome@empresa.com" className="h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={vm.form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            className="h-12 rounded-xl"
                            maxLength={15}
                            {...field}
                            onChange={(event) => field.onChange(handlePhoneMask(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="salario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="R$ 0,00"
                            className="h-12 rounded-xl"
                            {...field}
                            onChange={(event) => field.onChange(handleCurrencyMask(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-3">
                  <FormField
                    control={vm.form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            className="h-12 rounded-xl bg-white"
                            maxLength={9}
                            {...field}
                            onChange={(event) => field.onChange(handleCepMask(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="151" className="h-12 rounded-xl bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={vm.form.control}
                  name="homeOffice"
                  render={({ field }) => {
                    const homeOffice = getHomeOfficeLabel(field.value);

                    return (
                      <FormItem className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <FormLabel>Home office</FormLabel>
                            <FormDescription className="text-xs text-slate-500">{homeOffice.description}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "true"}
                              onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                            />
                          </FormControl>
                        </div>
                        <div className="pt-3">
                          <StatusBadge
                            label={homeOffice.title}
                            tone={homeOffice.tone}
                            description={field.value === "true" ? "Geolocalização dispensada." : "Geolocalização obrigatória."}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <StatusBadge
                  label={cpfBadge.label}
                  tone={cpfBadge.tone}
                  description={cpfBadge.description}
                  className="w-full justify-between rounded-[18px]"
                />
              </div>
            ) : (
              <MobileCollapsedSummary
                title="Dados pessoais prontos"
                subtitle="Nome, CPF, cargo, email e telefone já foram validados para a próxima etapa."
                badge={
                  <StatusBadge
                    label={cpfBadge.label}
                    tone={cpfBadge.tone}
                    description={cpfBadge.description}
                    className="w-full justify-between rounded-[18px]"
                  />
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className={cn("rounded-[28px] border-slate-200 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)]", activeStep === 1 ? "bg-white" : "bg-white/92")}>
          <CardHeader className="gap-2 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-slate-900">2. Escala e jornada</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">5x2, 6x1, 12x36 ou 24x72.</CardDescription>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold",
                  vm.stepCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                {vm.stepCompleted ? "Concluída" : "Pendente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            {activeStep === 1 ? (
              <div className="space-y-4">
                <FormField
                  control={vm.form.control}
                  name="scheduleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de escala</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Selecione a escala" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLLABORATOR_SCHEDULE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                <span className="text-xs text-slate-500">{option.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedScheduleType?.startsWith("ROTATING") && (
                  <FormField
                    control={vm.form.control}
                    name="scaleStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de início da escala</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isSixByOne && (
                  <FormField
                    control={vm.form.control}
                    name="preferredDayOff"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Folga preferencial</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="Selecione um dia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COLLABORATOR_LONG_DAY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedScheduleType === "SIX_BY_ONE_ONE_WEEKEND" && (
                  <FormField
                    control={vm.form.control}
                    name="weekendOffIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim de semana de folga</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="Selecione a ordem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["1", "2", "3", "4"].map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}º fim de semana
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isTraditional && (
                  <FormField
                    control={vm.form.control}
                    name="fixedWorkDays"
                    render={({ field }) => (
                      <FormItem className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                        <FormLabel>Dias de trabalho</FormLabel>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {COLLABORATOR_DAY_OPTIONS.map((day) => {
                            const checked = field.value?.includes(day.value);

                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => {
                                  const next = checked
                                    ? (field.value || []).filter((value) => value !== day.value)
                                    : [...(field.value || []), day.value];
                                  field.onChange(next);
                                }}
                                className={cn(
                                  "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                                  checked
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-slate-200 bg-white text-slate-600"
                                )}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={vm.form.control}
                    name="workStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entrada</FormLabel>
                        <FormControl>
                          <Input type="time" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="breakStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo saída</FormLabel>
                        <FormControl>
                          <Input type="time" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="breakEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo retorno</FormLabel>
                        <FormControl>
                          <Input type="time" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="workEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saída</FormLabel>
                        <FormControl>
                          <Input type="time" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Resumo da jornada</div>
                      <div className="text-xs text-slate-500">Entrada, intervalo e saída.</div>
                    </div>
                    <StatusBadge label={scheduleSummary} tone="info" className="max-w-full" />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
                      <div className="text-xs text-slate-500">Entrada</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{vm.form.watch("workStartTime") || "--:--"}</div>
                    </div>
                    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
                      <div className="text-xs text-slate-500">Intervalo</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {vm.form.watch("breakStartTime") && vm.form.watch("breakEndTime")
                          ? `${vm.form.watch("breakStartTime")} - ${vm.form.watch("breakEndTime")}`
                          : "--:--"}
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
                      <div className="text-xs text-slate-500">Saída</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{vm.form.watch("workEndTime") || "--:--"}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <MobileCollapsedSummary
                title="Escala pronta"
                subtitle={journeySummary || "Escolha a escala e formalize a jornada antes de salvar."}
                badge={<StatusBadge label={scheduleSummary} tone="info" description="Resumo operacional." className="w-full justify-between rounded-[18px]" />}
              />
            )}
          </CardContent>
        </Card>

        <Card className={cn("rounded-[28px] border-slate-200 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)]", activeStep === 2 ? "bg-white" : "bg-white/92")}>
          <CardHeader className="gap-2 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-slate-900">3. Acesso do usuário</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">Username e perfil MANAGER/PARTNER.</CardDescription>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold",
                  vm.savedEmployeeId
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                {vm.savedEmployeeId ? "Pronto" : "Pendente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            {activeStep === 2 ? (
              <div className="space-y-4">
                <div className={cn("rounded-[24px] border px-4 py-4", vm.stepCompleted ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70")}>
                  <div className="flex items-start gap-3">
                    {vm.stepCompleted ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    ) : (
                      <BadgeCheck className="mt-0.5 h-5 w-5 text-amber-600" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {vm.stepCompleted ? "Colaborador salvo" : "Passo 1 bloqueado"}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {vm.stepCompleted
                          ? "Agora é possível validar username e concluir o vínculo."
                          : "Salve os dados pessoais e a escala antes de criar o acesso."}
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={vm.form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel>Username</FormLabel>
                        <StatusBadge label={usernameBadge.label} tone={usernameBadge.tone} description={usernameBadge.description} />
                      </div>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="mariana.costa"
                            className="h-12 rounded-xl"
                            disabled={!vm.stepCompleted}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={vm.handleCheckUsername}
                          disabled={vm.isCheckingUsername || !vm.stepCompleted || field.value.length < 4}
                          className="h-12 rounded-xl px-4"
                        >
                          {vm.isCheckingUsername ? "Validando" : "Validar"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vm.form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!vm.stepCompleted}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLLABORATOR_ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                <span className="text-xs text-slate-500">{option.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
                    <ShieldCheck className="h-4 w-4" />
                    Regra de fluxo
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                    {COLLABORATOR_FLOW_RULES.map((rule) => (
                      <li key={rule} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <StatusBadge
                  label={vm.savedEmployeeId ? "CPF verificado" : "CPF pendente"}
                  tone={vm.savedEmployeeId ? "success" : "warning"}
                  description={vm.savedEmployeeId ? "Agora o vínculo pode ser finalizado." : "O acesso continua bloqueado."}
                  className="w-full justify-between rounded-[18px]"
                />
              </div>
            ) : (
              <MobileCollapsedSummary
                title="Acesso bloqueado"
                subtitle="Username e perfil serão liberados após salvar os dados e a escala."
                badge={<StatusBadge label={usernameBadge.label} tone={usernameBadge.tone} description={usernameBadge.description} className="w-full justify-between rounded-[18px]" />}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[640px] items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">{actionLabel}</div>
            <div className="truncate text-xs text-slate-500">{actionDescription}</div>
          </div>
          <Button
            type="button"
            onClick={() => void onPrimaryAction()}
            disabled={vm.isSubmitting || (activeStep === 1 && (vm.cpfAvailability !== "available" || vm.stepCompleted)) || (activeStep === 2 && (!vm.stepCompleted || vm.usernameAvailability !== "available"))}
            className="h-12 rounded-2xl px-5"
          >
            {vm.isSubmitting ? "Aguarde..." : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCollaboratorMobile;
