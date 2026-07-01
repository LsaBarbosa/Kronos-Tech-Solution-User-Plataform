import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { APP_PATHS } from "@/config/app-routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { ROLE_BY_TYPE, SCHEDULE_OPTIONS, DAY_OPTIONS, DAY_OPTIONS_LONG } from "../types/create-user.types";
import type { useCreateUserUnified } from "../hooks/useCreateUserUnified";
import { UserTypeSelector } from "./UserTypeSelector";

type CreateUserVM = ReturnType<typeof useCreateUserUnified>;

interface CreateUserMobileProps {
  vm: CreateUserVM;
}

export const CreateUserMobile = ({ vm }: CreateUserMobileProps) => {
  const isColaborador = vm.selectedType === "COLABORADOR";
  const selectedScheduleType = vm.selectedScheduleType;
  const isTraditional = selectedScheduleType === "TRADITIONAL_5X2";
  const isSixByOne = selectedScheduleType?.includes("SIX_BY_ONE");
  const isRotating = selectedScheduleType?.startsWith("ROTATING");

  const step = vm.stepCompleted ? 2 : 1;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header mobile */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to={APP_PATHS.dashboard} className="text-xl font-bold text-blue-600">K</Link>
          <span className="text-sm font-semibold text-slate-700">Criar usuário</span>
          <div className="flex items-center gap-1.5">
            <div className={cn("h-2 w-2 rounded-full", step >= 1 ? "bg-blue-600" : "bg-slate-300")} />
            <div className={cn("h-2 w-2 rounded-full", step >= 2 ? "bg-blue-600" : "bg-slate-300")} />
          </div>
        </div>
      </header>

      <Form {...vm.form}>
        <form onSubmit={vm.form.handleSubmit(vm.onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 px-4 py-4 pb-28">

            {/* ── Seletor de tipo (apenas CTO) ── */}
            {vm.isCto && (
              <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="px-4 pb-2 pt-4">
                  <CardTitle className="text-base text-slate-900">Tipo de usuário</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <UserTypeSelector
                    selectedType={vm.selectedType}
                    onTypeChange={vm.handleTypeChange}
                    disabled={vm.stepCompleted}
                  />
                </CardContent>
              </Card>
            )}

            {/* ── PASSO 1: Dados ── */}
            {step === 1 && (
              <Card className="overflow-hidden rounded-[24px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-l-4 border-l-primary px-4 pb-2 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">1</div>
                    <CardTitle className="text-base text-slate-900">
                      {isColaborador ? "Dados do colaborador" : "Dados do administrador"}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-4 pb-5 pt-4">
                  {/* Empresa */}
                  <FormField
                    control={vm.form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select
                          onValueChange={(val) => { field.onChange(val); vm.resetCpfAvailability(); }}
                          value={field.value}
                          disabled={vm.isFetchingCompanies}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder={vm.isFetchingCompanies ? "Carregando..." : "Selecione a empresa"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vm.companies.map((c) => (
                              <SelectItem key={c.companyId} value={c.companyId}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vm.form.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CPF */}
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
                              className={cn(
                                "h-12 rounded-xl",
                                vm.cpfAvailability === "available" && "border-emerald-400 bg-emerald-50/60",
                                vm.cpfAvailability === "unavailable" && "border-red-400 bg-red-50/60"
                              )}
                              maxLength={14}
                              {...field}
                              onChange={(e) => {
                                field.onChange(vm.maskCPF(e.target.value));
                                vm.resetCpfAvailability();
                              }}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void vm.handleCheckCPF()}
                            disabled={vm.isCheckingCPF || field.value.replace(/\D/g, "").length < 11}
                            className="h-12 rounded-xl px-3 text-xs"
                            variant={vm.cpfAvailability === "available" ? "outline" : "default"}
                          >
                            {vm.isCheckingCPF ? "..." : vm.cpfAvailability === "available" ? "✓" : "Verificar"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={vm.form.control}
                      name="cargo"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
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
                        <FormItem className="col-span-2">
                          <FormLabel>E-mail</FormLabel>
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
                        <FormItem>
                          <FormLabel>Salário</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="R$ 0,00"
                              className="h-12 rounded-xl"
                              {...field}
                              onChange={(e) => field.onChange(vm.maskCurrency(e.target.value))}
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
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              className="h-12 rounded-xl"
                              maxLength={15}
                              {...field}
                              onChange={(e) => field.onChange(vm.maskPhone(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={vm.form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              className="h-12 rounded-xl"
                              maxLength={9}
                              {...field}
                              onChange={(e) => field.onChange(vm.maskCEP(e.target.value))}
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
                            <Input placeholder="Ex: 151" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Home Office — apenas COLABORADOR */}
                  {isColaborador && (
                    <FormField
                      control={vm.form.control}
                      name="homeOffice"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                          <div>
                            <FormLabel>Home office</FormLabel>
                            <p className="text-xs text-slate-500">
                              {field.value === "true" ? "Geolocalização dispensada." : "Geolocalização obrigatória."}
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "true"}
                              onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Escala */}
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
                            {SCHEDULE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
                          <FormControl><Input type="date" className="h-12 rounded-xl" {...field} /></FormControl>
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
                              {DAY_OPTIONS_LONG.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
                              {["1", "2", "3", "4"].map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}º fim de semana</SelectItem>
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
                        <FormItem>
                          <FormLabel>Dias de trabalho</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {DAY_OPTIONS.map((day) => {
                              const checked = field.value?.includes(day.value);
                              return (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => {
                                    const next = checked
                                      ? (field.value ?? []).filter((v) => v !== day.value)
                                      : [...(field.value ?? []), day.value];
                                    field.onChange(next);
                                  }}
                                  className={cn(
                                    "rounded-full border px-3 py-1.5 text-sm font-semibold transition-all",
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

                  {/* Horários — apenas COLABORADOR */}
                  {isColaborador && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: "workStartTime", label: "Entrada" },
                        { name: "breakStartTime", label: "Saída p/ intervalo" },
                        { name: "breakEndTime", label: "Retorno do intervalo" },
                        { name: "workEndTime", label: "Saída" },
                      ].map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={vm.form.control}
                          name={name as keyof typeof vm.form.control._fields}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <FormControl><Input type="time" className="h-12 rounded-xl" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── PASSO 2: Credenciais ── */}
            {step === 2 && (
              <Card className="overflow-hidden rounded-[24px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="border-l-4 border-l-primary px-4 pb-2 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">2</div>
                    <CardTitle className="text-base text-slate-900">Credenciais de acesso</CardTitle>
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-4 pb-5 pt-4">
                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Passo 1 concluído. Defina o nome de usuário para login.
                  </div>

                  <FormField
                    control={vm.form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de usuário</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="nome.usuario"
                              className={cn(
                                "h-12 rounded-xl",
                                vm.usernameAvailability === "available" && "border-emerald-400 bg-emerald-50/60",
                                vm.usernameAvailability === "unavailable" && "border-red-400 bg-red-50/60"
                              )}
                              {...field}
                              onChange={(e) => { field.onChange(e); vm.resetUsernameAvailability(); }}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void vm.handleCheckUsername()}
                            disabled={vm.isCheckingUsername || (field.value?.length ?? 0) < 4}
                            className="h-12 rounded-xl px-3 text-xs"
                            variant={vm.usernameAvailability === "available" ? "outline" : "default"}
                          >
                            {vm.isCheckingUsername ? "..." : vm.usernameAvailability === "available" ? "✓" : "Verificar"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-xs text-slate-500">Papel atribuído</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {ROLE_BY_TYPE[vm.selectedType]} — {vm.selectedType === "COLABORADOR" ? "Colaborador" : "Administrador"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── CTA fixo no bottom ── */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-3">
            <Button
              type="submit"
              className="h-14 w-full rounded-2xl text-base font-semibold"
              disabled={
                vm.isSubmitting ||
                (step === 1 && vm.cpfAvailability !== "available") ||
                (step === 2 && vm.usernameAvailability !== "available")
              }
            >
              {vm.isSubmitting
                ? "Aguarde..."
                : step === 1
                  ? "Salvar e continuar →"
                  : "Concluir cadastro"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
