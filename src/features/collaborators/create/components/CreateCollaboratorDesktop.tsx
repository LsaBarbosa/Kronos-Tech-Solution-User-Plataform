import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Home,
  MapPin,
  Settings2,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Users,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { APP_PATHS } from "@/config/app-routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
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

interface CreateCollaboratorDesktopProps {
  vm: CreateCollaboratorViewModel;
}

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "K";

const DesktopMetricCard = ({
  number,
  title,
  description,
  active,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) => (
  <div
    className={cn(
      "min-w-0 rounded-[22px] border px-4 py-4 shadow-sm",
      active ? "border-white/30 bg-white/15 text-white" : "border-white/20 bg-white/10 text-white/90"
    )}
  >
    <div className="text-2xl font-semibold leading-none">{number}</div>
    <div className="mt-2 text-sm font-medium">{title}</div>
    <div className="mt-1 text-[11px] leading-4 text-white/75">{description}</div>
  </div>
);

const FieldSummary = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={cn("min-w-0 rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3", className)}>
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

const DesktopRail = () => {
  const navigate = useNavigate();

  const railItems = [
    { icon: Home, label: "Início", path: APP_PATHS.dashboard, active: false },
    { icon: Users, label: "Colaboradores", path: APP_PATHS.listaColaboradores, active: true },
    { icon: CalendarDays, label: "Férias", path: APP_PATHS.solicitarFerias, active: false },
    { icon: TimerReset, label: "Abono", path: APP_PATHS.solicitarAbono, active: false },
    { icon: Settings2, label: "Usuário", path: APP_PATHS.usuario, active: false },
  ] as const;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-20 flex-col items-center bg-[#0B1220] py-5 text-white xl:flex">
      <button
        type="button"
        onClick={() => navigate(APP_PATHS.dashboard)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold shadow-lg shadow-blue-950/40"
        aria-label="Ir para o dashboard"
      >
        K
      </button>

      <div className="mt-8 flex w-full flex-1 flex-col items-center gap-3 px-3">
        {railItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className={cn(
                "group flex h-12 w-12 items-center justify-center rounded-2xl border transition-all",
                item.active
                  ? "border-cyan-300 bg-cyan-400/15 text-cyan-300 shadow-lg shadow-cyan-900/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </aside>
  );
};

const CreateCollaboratorDesktop = ({ vm }: CreateCollaboratorDesktopProps) => {
  const { user } = useAuth();
  const fullName = user?.profile?.fullName ?? user?.account.username ?? "Equipe Kronos";
  const roleLabel = user?.role ?? "MANAGER";
  const initials = getInitials(fullName);

  const cpfBadge = getCpfVerificationLabel(vm.cpfAvailability);
  const usernameBadge = getUsernameVerificationLabel(vm.usernameAvailability);
  const homeOfficeLabel = getHomeOfficeLabel(vm.form.watch("homeOffice"));
  const scheduleSummary = formatScheduleSummary(vm.form.watch("scheduleType"), vm.form.watch("fixedWorkDays") ?? []);
  const journeySummary = formatJourney({
    workStartTime: vm.form.watch("workStartTime"),
    breakStartTime: vm.form.watch("breakStartTime"),
    breakEndTime: vm.form.watch("breakEndTime"),
    workEndTime: vm.form.watch("workEndTime"),
  });
  const selectedScheduleType = vm.form.watch("scheduleType");
  const isTraditional = selectedScheduleType === "TRADITIONAL_5X2";
  const isSixByOne = selectedScheduleType?.includes("SIX_BY_ONE");
  const isRotating = selectedScheduleType?.startsWith("ROTATING");

  const topTiles = useMemo(
    () => [
      {
        number: "1",
        title: "Dados",
        description: vm.stepCompleted ? "Colaborador salvo e validado." : "Cadastro pessoal em edição.",
        active: true,
      },
      {
        number: "2",
        title: "Escala",
        description: scheduleSummary,
      },
      {
        number: "3",
        title: "Jornada",
        description: journeySummary || "Entrada, intervalo e saída.",
      },
      {
        number: "4",
        title: "Acesso",
        description: vm.savedEmployeeId ? "Vínculo liberado para criação." : "Bloqueado até salvar o colaborador.",
        active: Boolean(vm.savedEmployeeId),
      },
    ],
    [journeySummary, scheduleSummary, vm.savedEmployeeId, vm.stepCompleted]
  );

  const handleCpfMask = (value: string) => vm.maskCPF(value);
  const handlePhoneMask = (value: string) => vm.maskPhone(value);
  const handleCepMask = (value: string) => vm.maskCEP(value);
  const handleCurrencyMask = (value: string) => vm.maskCurrency(value);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF4FB_100%)] text-slate-900">
      <DesktopRail />

      <div className="min-h-screen xl:pl-20">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex min-h-[80px] items-center justify-between gap-4 px-4 py-3 sm:px-6 xl:px-10">
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={APP_PATHS.dashboard}>Kronos</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={APP_PATHS.listaColaboradores}>Pessoas</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Criar colaborador</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Link to={APP_PATHS.dashboard}>Dashboard</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Link to={APP_PATHS.listaColaboradores}>Lista</Link>
              </Button>
              <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-700">
                Onboarding cadastral
              </Badge>

              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 sm:block">
                  <div className="truncate text-sm font-semibold text-slate-900">{fullName}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{roleLabel}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-10 xl:py-8">
          <section className="rounded-[32px] bg-[linear-gradient(90deg,#0B1220_0%,#12367A_45%,#2563EB_100%)] px-5 py-6 text-white shadow-[0_40px_90px_-50px_rgba(37,99,235,0.75)] sm:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  Novo colaborador
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Cadastro completo com vínculo de acesso
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                  Crie o colaborador, valide CPF, configure jornada e depois vincule o usuário de acesso com rastreabilidade.
                </p>
              </div>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {topTiles.map((tile) => (
                  <DesktopMetricCard key={tile.title} {...tile} />
                ))}
              </div>
            </div>
          </section>

          <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.9fr)]">
            <Card className="min-w-0 overflow-hidden rounded-[32px] border-slate-200 bg-white/95 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.55)]">
              <CardHeader className="gap-2 border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-slate-900">Ficha do colaborador</CardTitle>
                    <CardDescription className="mt-2 text-sm text-slate-500">
                      Dados pessoais, profissionais e endereço.
                    </CardDescription>
                  </div>
                  <StatusBadge label={cpfBadge.label} tone={cpfBadge.tone} description={cpfBadge.description} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-6 py-6 sm:px-8">
                <fieldset disabled={vm.stepCompleted} className="min-w-0 space-y-6">
                <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                  <FormField
                    control={vm.form.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem className="min-w-0 lg:col-span-2">
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
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
                        <FormDescription className="text-xs text-slate-500">
                          O CPF é verificado antes de salvar o colaborador.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="cargo"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Analista de RH" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="nome@empresa.com" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="salario"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
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

                  <FormField
                    control={vm.form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
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
                </div>

                <div className="grid min-w-0 gap-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-3">
                  <FormField
                    control={vm.form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-cyan-600" />
                          CEP
                        </FormLabel>
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
                      <FormItem className="min-w-0">
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 151" className="h-12 rounded-xl bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="homeOffice"
                    render={({ field }) => {
                      const homeOffice = getHomeOfficeLabel(field.value);

                      return (
                        <FormItem className="min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <FormLabel>Home office</FormLabel>
                              <FormDescription className="text-xs text-slate-500">
                                {homeOffice.description}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value === "true"}
                                onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                              />
                            </FormControl>
                          </div>
                          <div className="pt-1">
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
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        Escala e jornada
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">Escolha a escala e formalize entrada, intervalo e saída.</p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">
                      {scheduleSummary}
                    </Badge>
                  </div>

                  <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
                    <FormField
                      control={vm.form.control}
                      name="scheduleType"
                      render={({ field }) => (
                        <FormItem className="min-w-0 lg:col-span-2">
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
                          <FormItem className="min-w-0">
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
                          <FormItem className="min-w-0">
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
                          <FormItem className="min-w-0">
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
                          <FormItem className="min-w-0 lg:col-span-2">
                            <FormLabel>Dias de trabalho</FormLabel>
                            <div className="flex flex-wrap gap-2">
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
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60"
                                    )}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                            <FormDescription className="text-xs text-slate-500">
                              {vm.selectedScheduleType === "TRADITIONAL_5X2"
                                ? "Selecione os dias que fazem parte da jornada fixa."
                                : "Campo oculto para escalas fixas."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={vm.form.control}
                      name="workStartTime"
                      render={({ field }) => (
                        <FormItem className="min-w-0">
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
                        <FormItem className="min-w-0">
                          <FormLabel>Intervalo - saída</FormLabel>
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
                        <FormItem className="min-w-0">
                          <FormLabel>Intervalo - retorno</FormLabel>
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
                        <FormItem className="min-w-0">
                          <FormLabel>Saída</FormLabel>
                          <FormControl>
                            <Input type="time" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-4">
                  <FieldSummary label="Entrada" value={vm.form.watch("workStartTime") || "--:--"} />
                  <FieldSummary
                    label="Intervalo"
                    value={
                      vm.form.watch("breakStartTime") && vm.form.watch("breakEndTime")
                        ? `${vm.form.watch("breakStartTime")} - ${vm.form.watch("breakEndTime")}`
                        : "--:--"
                    }
                  />
                  <FieldSummary label="Saída" value={vm.form.watch("workEndTime") || "--:--"} />
                  <FieldSummary
                    label="CPF"
                    value={
                      vm.cpfAvailability === "available"
                        ? "Verificado"
                        : vm.cpfAvailability === "unavailable"
                          ? "Indisponível"
                          : "Pendente"
                    }
                    className={cn(
                      vm.cpfAvailability === "available" && "border-emerald-200 bg-emerald-50/80",
                      vm.cpfAvailability === "unavailable" && "border-red-200 bg-red-50/80",
                      vm.cpfAvailability === "checking" && "border-sky-200 bg-sky-50/80"
                    )}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={homeOfficeLabel.title} tone={homeOfficeLabel.tone} description={homeOfficeLabel.description} />
                    <StatusBadge
                      label={cpfBadge.label}
                      tone={cpfBadge.tone}
                      description={cpfBadge.description}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => void vm.submitEmployee()}
                    disabled={vm.isSubmitting || vm.cpfAvailability !== "available" || vm.stepCompleted}
                    className="h-12 rounded-xl px-6"
                  >
                    {vm.stepCompleted ? "Dados salvos" : vm.isSubmitting ? "Salvando..." : "Salvar dados"}
                  </Button>
                </div>
                </fieldset>
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden rounded-[32px] border-slate-200 bg-white/95 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.55)]">
              <CardHeader className="gap-2 border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-slate-900">Vínculo de acesso</CardTitle>
                    <CardDescription className="mt-2 text-sm text-slate-500">
                      Liberado após salvar o colaborador.
                    </CardDescription>
                  </div>
                  <StatusBadge
                    label={vm.savedEmployeeId ? "Liberado" : "Bloqueado"}
                    tone={vm.savedEmployeeId ? "success" : "warning"}
                    description={vm.savedEmployeeId ? "EmployeeId disponível." : "Aguarde o passo 1."}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-5 px-6 py-6 sm:px-8">
                <fieldset disabled={!vm.stepCompleted} className="min-w-0 space-y-5">
                <div className={cn("rounded-[26px] border px-4 py-4", vm.stepCompleted ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70")}>
                  <div className="flex items-start gap-3">
                    {vm.stepCompleted ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    ) : (
                      <BadgeCheck className="mt-0.5 h-5 w-5 text-amber-600" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {vm.stepCompleted ? "Colaborador criado" : "Passo 1 aguardando conclusão"}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {vm.stepCompleted
                          ? `Vínculo liberado para ${vm.form.watch("nomeCompleto") || "o colaborador"}`
                          : "Salve os dados do colaborador para habilitar o usuário."}
                      </div>
                      {vm.savedEmployeeId ? (
                        <div className="mt-2 inline-flex rounded-full border border-white/60 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                          ID: {vm.savedEmployeeId}
                        </div>
                      ) : null}
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
                        <StatusBadge
                          label={usernameBadge.label}
                          tone={usernameBadge.tone}
                          description={usernameBadge.description}
                        />
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
                      <FormDescription className="text-xs text-slate-500">
                        O vínculo de acesso só pode ser MANAGER ou PARTNER.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-[26px] border border-violet-200 bg-violet-50/60 px-4 py-4">
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

                <Button
                  type="button"
                  variant="login"
                  onClick={() => void vm.submitUser()}
                  disabled={vm.isSubmitting || !vm.stepCompleted || vm.usernameAvailability !== "available"}
                  className="h-12 w-full rounded-xl"
                >
                  {vm.isSubmitting ? "Concluindo..." : "Criar acesso"}
                </Button>
                </fieldset>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CreateCollaboratorDesktop;
