import {
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { ROLE_BY_TYPE, SCHEDULE_OPTIONS, DAY_OPTIONS, DAY_OPTIONS_LONG } from "../types/create-user.types";
import type { useCreateUserUnified } from "../hooks/useCreateUserUnified";
import { UserTypeSelector } from "./UserTypeSelector";

type CreateUserVM = ReturnType<typeof useCreateUserUnified>;

interface CreateUserDesktopProps {
  vm: CreateUserVM;
}

export const CreateUserDesktop = ({ vm }: CreateUserDesktopProps) => {
  const selectedScheduleType = vm.selectedScheduleType;
  const isTraditional = selectedScheduleType === "TRADITIONAL_5X2";
  const isSixByOne = selectedScheduleType?.includes("SIX_BY_ONE");
  const isRotating = selectedScheduleType?.startsWith("ROTATING");
  const isColaborador = vm.selectedType === "COLABORADOR";

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 px-4 py-6 sm:px-6 xl:px-10 xl:py-8">
          <Form {...vm.form}>
            <form onSubmit={vm.form.handleSubmit(vm.onSubmit)} className="flex flex-col gap-6">

              {/* ── Seletor de tipo (apenas CTO) ── */}
              {vm.isCto && (
                <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                  <CardHeader className="px-6 py-5">
                    <CardTitle className="text-lg text-slate-900">Tipo de usuário</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Selecione o tipo de acesso que o novo usuário terá no sistema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <UserTypeSelector
                      selectedType={vm.selectedType}
                      onTypeChange={vm.handleTypeChange}
                      disabled={vm.stepCompleted}
                    />
                    {vm.stepCompleted && (
                      <p className="mt-2 text-xs text-slate-400">
                        Tipo bloqueado após criação do colaborador. Reinicie o formulário para alterar.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── PASSO 1: Dados do colaborador ── */}
              <Card className="overflow-hidden rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="gap-1 border-b border-slate-100 px-6 py-5 border-l-4 border-l-primary">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">1</div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">
                        {isColaborador ? "Dados do colaborador" : "Dados do administrador"}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-500">
                        {vm.stepCompleted
                          ? "Dados salvos com sucesso."
                          : "Preencha as informações e verifique o CPF antes de prosseguir."}
                      </CardDescription>
                    </div>
                    {vm.stepCompleted && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />}
                  </div>
                </CardHeader>

                {!vm.stepCompleted && (
                  <CardContent className="space-y-5 px-6 py-6">
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

                    <div className="grid gap-4 lg:grid-cols-2">
                      <FormField
                        control={vm.form.control}
                        name="nomeCompleto"
                        render={({ field }) => (
                          <FormItem className="lg:col-span-2">
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite o nome completo" className="h-12 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* CPF + verificar */}
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
                                onClick={() => void vm.handleCheckCPF()}
                                disabled={vm.isCheckingCPF || field.value.replace(/\D/g, "").length < 11}
                                className="h-12 rounded-xl px-4"
                                variant={vm.cpfAvailability === "available" ? "outline" : "default"}
                              >
                                {vm.isCheckingCPF ? "Verificando..." : vm.cpfAvailability === "available" ? "✓ OK" : "Verificar"}
                              </Button>
                            </div>
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
                          <FormItem>
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
                          <FormItem className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <div>
                              <FormLabel>Home office</FormLabel>
                              <p className="text-xs text-slate-500">
                                {field.value === "true" ? "Geolocalização dispensada no checkin." : "Geolocalização obrigatória no checkin."}
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
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                        Escala de trabalho
                      </h3>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <FormField
                          control={vm.form.control}
                          name="scheduleType"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
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
                              <FormItem className="lg:col-span-2">
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
                                          "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                                          checked
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
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

                        {/* Horários de jornada — apenas COLABORADOR */}
                        {isColaborador && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={vm.isSubmitting || vm.cpfAvailability !== "available"}
                        className="h-12 rounded-xl px-8"
                      >
                        {vm.isSubmitting ? "Salvando..." : "Salvar e continuar"}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* ── PASSO 2: Credenciais ── */}
              <Card className={cn(
                "overflow-hidden rounded-[32px] border-slate-200 bg-white shadow-sm transition-opacity",
                !vm.stepCompleted && "opacity-50 pointer-events-none"
              )}>
                <CardHeader className="gap-1 border-b border-slate-100 px-6 py-5 border-l-4 border-l-primary">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white",
                      vm.stepCompleted ? "bg-blue-600" : "bg-slate-300"
                    )}>2</div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">Credenciais de acesso</CardTitle>
                      <CardDescription className="text-sm text-slate-500">
                        Defina o nome de usuário para login. O papel será{" "}
                        <strong>{vm.selectedType === "COLABORADOR" ? "Colaborador (PARTNER)" : "Administrador (MANAGER)"}</strong>.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 px-6 py-6">
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
                            onClick={() => void vm.handleCheckUsername()}
                            disabled={vm.isCheckingUsername || (field.value?.length ?? 0) < 4}
                            className="h-12 rounded-xl px-4"
                            variant={vm.usernameAvailability === "available" ? "outline" : "default"}
                          >
                            {vm.isCheckingUsername ? "Verificando..." : vm.usernameAvailability === "available" ? "✓ OK" : "Verificar"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-xs text-slate-500">Papel atribuído</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {ROLE_BY_TYPE[vm.selectedType]} — {vm.selectedType === "COLABORADOR" ? "Colaborador" : "Administrador"}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={vm.isSubmitting || vm.usernameAvailability !== "available"}
                      className="h-12 rounded-xl px-8"
                    >
                      {vm.isSubmitting ? "Concluindo..." : "Concluir cadastro"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
    </div>
  );
};
