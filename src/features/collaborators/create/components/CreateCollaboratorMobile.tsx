import { useMemo, type ReactNode } from "react";
import { Building2, CheckCircle2, KeyRound, ShieldCheck, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { APP_PATHS } from "@/config/app-routes";
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
  COLLABORATOR_LONG_DAY_OPTIONS,
  COLLABORATOR_MOBILE_STEPS,
  COLLABORATOR_SCHEDULE_OPTIONS,
} from "../constants";
import {
  formatJourney,
  formatScheduleSummary,
  getCpfVerificationLabel,
  getHomeOfficeLabel,
} from "../utils/create-collaborator-formatters";
import { StatusBadge } from "./StatusBadge";
import { CustomDaysSelector } from "./CustomDaysSelector";

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
      "flex min-h-[76px] w-full items-start gap-3 rounded-[26px] border px-4 py-3 text-left transition-all",
      active
        ? "border-blue-300 bg-blue-50 text-slate-900 shadow-sm"
        : "border-slate-200 bg-white text-slate-500",
      locked && "cursor-not-allowed opacity-60"
    )}
  >
    <div
      className={cn(
        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
      )}
    >
      {step}
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold leading-5">Etapa {step}</div>
      <div className="text-xs leading-4 text-slate-500">{active ? "Em edição" : locked ? "Bloqueada" : "Toque para abrir"}</div>
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
    <div className="break-words text-lg font-semibold text-slate-900">{title}</div>
    <div className="break-words text-sm leading-5 text-slate-500">{subtitle}</div>
    {badge ? <div className="pt-2">{badge}</div> : null}
  </div>
);

const CreateCollaboratorMobile = ({
  vm,
  activeStep,
  onStepChange,
  onPrimaryAction,
}: CreateCollaboratorMobileProps) => {
  const cpfBadge = getCpfVerificationLabel(vm.cpfAvailability);
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
  const isCustomDays = selectedScheduleType === "CUSTOM_DAYS";

  const selectedCompanyName = vm.companies.find((c) => c.companyId === vm.selectedCompanyId)?.companyName ?? "";

  const actionLabel = useMemo(() => {
    if (activeStep === 0) return "Próximo: Escala";
    if (activeStep === 2) return "Criar acesso";
    return "Cadastrar colaborador";
  }, [activeStep]);

  const actionDescription = useMemo(() => {
    if (activeStep === 0) return "Revise os dados e a empresa antes de avançar.";
    if (activeStep === 2) return "Defina login e perfil ou pule esta etapa.";
    return "Confirme a escala e salve o colaborador.";
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
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Novo cadastro</h1>
            <p className="mt-1 text-sm text-white/78">
              {selectedCompanyName ? `Empresa: ${selectedCompanyName}` : "Selecione a empresa e preencha os dados."}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-2xl border-white/20 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15 hover:text-white"
            >
              <Link to={APP_PATHS.dashboard}>
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-2xl border-white/20 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15 hover:text-white"
            >
              <Link to={APP_PATHS.listaColaboradores}>
                <span>Lista</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="space-y-4 px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-4 sm:px-6">
        <section className="rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            {COLLABORATOR_MOBILE_STEPS.map((step, index) => (
              <MobileStepHeader
                key={step.title}
                step={step.number}
                active={activeStep === index}
                onClick={() => onStepChange(index)}
              />
            ))}
          </div>
        </section>

        {/* ── Passo 1: Dados pessoais e empresa ── */}
        <Card
          className={cn(
            "overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)]",
            activeStep === 0 ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"
          )}
        >
          <CardHeader className="gap-2 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-slate-900">1. Dados e empresa</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">CPF, dados pessoais e empresa de destino.</CardDescription>
              </div>
              <StatusBadge label={cpfBadge.label} tone={cpfBadge.tone} description={cpfBadge.description} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            {activeStep === 0 ? (
              <div className="space-y-4">
                {/* Empresa */}
                <div className="rounded-[20px] border border-blue-200 bg-blue-50/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <Building2 className="h-4 w-4" />
                    Empresa de destino
                  </div>
                  <div className="mt-2">
                    {vm.isLoadingCompanies ? (
                      <div className="h-12 animate-pulse rounded-xl bg-blue-100" />
                    ) : (
                      <Select
                        value={vm.selectedCompanyId ?? ""}
                        onValueChange={(value) => {
                          vm.setSelectedCompanyId(value);
                          vm.resetCpfStatus();
                        }}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-white">
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {vm.companies.map((company) => (
                            <SelectItem key={company.companyId} value={company.companyId}>
                              {company.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Auto-fill banner */}
                {vm.isAutoFilled && (
                  <div className="flex items-start gap-2 rounded-[18px] border border-emerald-200 bg-emerald-50/80 px-4 py-3">
                    <WandSparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-xs text-slate-700">
                      Dados preenchidos automaticamente de <strong>{vm.autoFilledFrom}</strong>. Revise antes de salvar.
                    </p>
                  </div>
                )}

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
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            className="h-12 min-w-0 rounded-xl"
                            maxLength={14}
                            {...field}
                            onChange={(event) => field.onChange(handleCpfMask(event.target.value))}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={vm.handleCheckCPF}
                          disabled={vm.isCheckingCPF || !vm.selectedCompanyId || field.value.replace(/\D/g, "").length < 11}
                          className="h-12 w-full rounded-xl px-4 sm:w-auto"
                        >
                          {vm.isCheckingCPF ? "Verificando" : "Verificar"}
                        </Button>
                      </div>
                      <FormDescription className="text-xs text-slate-500">
                        Se o CPF existir no sistema, os dados serão preenchidos automaticamente.
                      </FormDescription>
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
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nome@empresa.com" className="h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={vm.form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            className="h-12 min-w-0 rounded-xl"
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
                            className="h-12 min-w-0 rounded-xl"
                            {...field}
                            onChange={(event) => field.onChange(handleCurrencyMask(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                  <FormField
                    control={vm.form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            className="h-12 min-w-0 rounded-xl bg-white"
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
                          <Input placeholder="151" className="h-12 min-w-0 rounded-xl bg-white" {...field} />
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
                      <FormItem className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
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
                title={vm.form.watch("nomeCompleto") || "Dados pessoais"}
                subtitle={selectedCompanyName ? `Empresa: ${selectedCompanyName}` : "Dados preenchidos."}
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

        {/* ── Passo 2: Escala e jornada ── */}
        <Card
          className={cn(
            "overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)]",
            activeStep === 1 ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"
          )}
        >
          <CardHeader className="gap-2 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-slate-900">2. Escala e jornada</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">5x2, 6x1, 12x36 ou 24x72.</CardDescription>
              </div>
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-[11px] font-semibold border-slate-200 bg-slate-50 text-slate-700"
              >
                {scheduleSummary}
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

                {isRotating && (
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
                      <FormItem className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
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

                {isCustomDays && (
                  <FormField
                    control={vm.form.control}
                    name="fixedWorkDays"
                    render={({ field }) => (
                      <FormItem className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                        <FormLabel>Dias de trabalho</FormLabel>
                        <FormControl>
                          <CustomDaysSelector
                            value={field.value ?? []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
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
                title="Escala configurada"
                subtitle={journeySummary || "Avance para configurar a jornada."}
                badge={<StatusBadge label={scheduleSummary} tone="info" description="Resumo operacional." className="w-full justify-between rounded-[18px]" />}
              />
            )}
          </CardContent>
        </Card>
        {/* ── Passo 3: Acesso ao sistema ── */}
        <Card
          className={cn(
            "overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)]",
            activeStep === 2 ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"
          )}
        >
          <CardHeader className="gap-2 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-slate-900">3. Acesso ao sistema</CardTitle>
                <CardDescription className="mt-1 text-sm text-slate-500">
                  Opcional — crie o login agora ou depois pela lista de colaboradores.
                </CardDescription>
              </div>
              <KeyRound className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            {activeStep === 2 ? (
              vm.employeeCreated ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <div className="text-sm font-semibold text-emerald-800">Colaborador cadastrado</div>
                      <div className="text-xs text-emerald-700">Agora você pode criar o acesso ao sistema.</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nome de usuário</label>
                    <div className="flex gap-2">
                      <Input
                        value={vm.username}
                        onChange={(e) => vm.setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                        placeholder="ex: joao.silva"
                        className="h-12 flex-1 rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void vm.handleCheckUsername()}
                        disabled={vm.isCheckingUsername || vm.username.length < 4}
                        className="h-12 shrink-0 rounded-xl"
                      >
                        {vm.isCheckingUsername ? "..." : "Verificar"}
                      </Button>
                    </div>
                    {vm.usernameAvailability === "available" && (
                      <p className="text-xs text-emerald-600">Nome de usuário disponível.</p>
                    )}
                    {vm.usernameAvailability === "unavailable" && (
                      <p className="text-xs text-rose-600">Nome de usuário já em uso.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Perfil de acesso</label>
                    <div className="grid grid-cols-2 gap-3">
                      {vm.roleOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => vm.setUserRole(opt.value)}
                          className={cn(
                            "rounded-[18px] border p-3 text-left transition-all",
                            vm.userRole === opt.value
                              ? "border-blue-400 bg-blue-50 text-blue-800"
                              : "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          <div className="text-sm font-semibold">{opt.label}</div>
                          <div className="mt-1 text-xs leading-4">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <ShieldCheck className="h-4 w-4" />
                      A senha inicial será gerada automaticamente e enviada por e-mail ao colaborador.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Conclua o cadastro do colaborador antes de criar o acesso.
                </div>
              )
            ) : (
              <MobileCollapsedSummary
                title="Acesso ao sistema"
                subtitle="Disponível após cadastrar o colaborador."
                badge={<StatusBadge label="Opcional" tone="neutral" description="Pode ser feito depois." className="w-full justify-between rounded-[18px]" />}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[640px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="break-words text-sm font-semibold text-slate-900">{actionLabel}</div>
            <div className="break-words text-xs leading-4 text-slate-500">{actionDescription}</div>
          </div>
          {activeStep === 2 ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={vm.skipUserCreation}
                className="h-12 w-full rounded-2xl px-5 sm:w-auto"
              >
                Pular esta etapa
              </Button>
              <Button
                type="button"
                onClick={() => void vm.createUserForEmployee()}
                disabled={vm.isSubmitting || vm.usernameAvailability !== "available" || !vm.employeeCreated}
                className="h-12 w-full rounded-2xl px-5 sm:w-auto"
              >
                {vm.isSubmitting ? "Criando..." : "Criar acesso"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => void onPrimaryAction()}
              disabled={
                vm.isSubmitting ||
                (activeStep === 0 && (!vm.selectedCompanyId || vm.cpfAvailability !== "available")) ||
                (activeStep === 1 && vm.isSubmitting)
              }
              className="h-12 w-full rounded-2xl px-5 sm:w-auto"
            >
              {vm.isSubmitting ? "Salvando..." : actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCollaboratorMobile;
