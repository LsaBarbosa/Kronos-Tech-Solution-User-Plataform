import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
  Loader2,
  Search,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import { listUsers } from "@/service/user.service";
import { fetchCompanyList } from "@/service/company.service";
import { listEmployeesByCompany } from "@/service/employee.service";
import { addCompanyAccess } from "@/service/user-company.service";
import type { UserSearchListItem } from "@/types/user";
import type { CompanyListItem } from "@/types/company";
import type { EmployeeListItem } from "@/service/employee.service";

type FormState = {
  companyId: string;
  employeeId: string;
  role: "MANAGER" | "PARTNER";
  defaultCompany: boolean;
};

const INITIAL_FORM: FormState = {
  companyId: "",
  employeeId: "",
  role: "MANAGER",
  defaultCompany: false,
};

const EmpresaMultiAcesso = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const [users, setUsers] = useState<UserSearchListItem[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserSearchListItem | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    listUsers(null)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));

    fetchCompanyList()
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoadingCompanies(false));
  }, []);

  // Load employees (all statuses) when company is selected
  useEffect(() => {
    if (!form.companyId) {
      setEmployees([]);
      setEmployeesLoaded(false);
      setForm((prev) => ({ ...prev, employeeId: "" }));
      return;
    }
    setLoadingEmployees(true);
    setEmployees([]);
    setEmployeesLoaded(false);
    setForm((prev) => ({ ...prev, employeeId: "" }));
    // Fetch all (active + inactive) so a recently created employee always appears
    listEmployeesByCompany(form.companyId)
      .then((list) => {
        setEmployees(list);
        setEmployeesLoaded(true);
      })
      .catch(() => {
        setEmployees([]);
        setEmployeesLoaded(true);
      })
      .finally(() => setLoadingEmployees(false));
  }, [form.companyId]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectUser = (user: UserSearchListItem) => {
    setSelectedUser(user);
    setForm(INITIAL_FORM);
    setEmployees([]);
    setEmployeesLoaded(false);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !form.companyId || !form.employeeId) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await addCompanyAccess(selectedUser.userId, {
        companyId: form.companyId,
        employeeId: form.employeeId,
        role: form.role,
        defaultCompany: form.defaultCompany,
      });
      setFeedback({ type: "success", message: "Acesso adicionado com sucesso." });
      setForm(INITIAL_FORM);
      setEmployees([]);
      setEmployeesLoaded(false);
    } catch {
      setFeedback({ type: "error", message: "Não foi possível adicionar o acesso. Verifique os dados e tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  const activeCompanies = companies.filter((c) => c.active);
  const selectedCompany = activeCompanies.find((c) => c.id === form.companyId) ?? null;
  const selectedEmployee = employees.find((e) => e.employeeId === form.employeeId) ?? null;
  const noEmployeesInCompany = employeesLoaded && employees.length === 0;

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-12 px-4 sm:px-6 lg:px-8 space-y-6 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(APP_PATHS.empresa)}
            className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Acesso Multiempresa</h1>
            <p className="text-sm text-[#64748B]">
              Vincule um usuário existente a uma empresa na qual ele já possui um registro de colaborador.
            </p>
          </div>
        </div>

        {/* Step explanation */}
        <div className="flex flex-col gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
          <div className="space-y-1 text-sm text-[#1E3A8A]">
            <p className="font-semibold">Como funciona o fluxo multiempresa</p>
            <ol className="list-decimal pl-4 space-y-0.5 text-[#1D4ED8]">
              <li>Selecione o usuário que deseja vincular.</li>
              <li>Selecione a empresa destino.</li>
              <li>
                Escolha o colaborador dessa empresa que representa o usuário. Se o colaborador
                ainda não existir, clique em <strong>Cadastrar colaborador</strong> e volte aqui após o cadastro.
              </li>
              <li>Confirme o perfil e clique em <strong>Adicionar acesso</strong>.</li>
            </ol>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: user search */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-[#1D4ED8]" />
                1. Selecionar usuário
              </CardTitle>
              <CardDescription>Clique no usuário que receberá acesso à nova empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  placeholder="Buscar por username…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-8 text-[#64748B]">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando usuários…
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F8FAFC]">
                        <TableHead className="text-xs">Usuário</TableHead>
                        <TableHead className="text-xs">Perfil</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="py-6 text-center text-sm text-[#94A3B8]">
                            Nenhum usuário encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((u) => (
                          <TableRow
                            key={u.userId}
                            className={`cursor-pointer transition-colors hover:bg-[#EFF6FF] ${
                              selectedUser?.userId === u.userId ? "bg-[#DBEAFE]" : ""
                            }`}
                            onClick={() => handleSelectUser(u)}
                          >
                            <TableCell className="py-2 text-sm font-medium">{u.username}</TableCell>
                            <TableCell className="py-2">
                              <Badge
                                variant="outline"
                                className={
                                  u.role === "MANAGER"
                                    ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                                    : "border-[#D1FAE5] bg-[#F0FDF4] text-[#15803D]"
                                }
                              >
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge
                                variant="outline"
                                className={
                                  u.active
                                    ? "border-[#D1FAE5] bg-[#F0FDF4] text-[#15803D]"
                                    : "border-[#FEE2E2] bg-[#FEF2F2] text-[#B91C1C]"
                                }
                              >
                                {u.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: form */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-[#7C3AED]" />
                2. Vincular empresa e colaborador
              </CardTitle>
              <CardDescription>
                {selectedUser
                  ? `Configurando acesso para: ${selectedUser.username}`
                  : "Selecione um usuário à esquerda para continuar."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedUser ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#94A3B8]">
                  <UserCheck className="h-10 w-10" />
                  <p className="text-sm">Nenhum usuário selecionado.</p>
                </div>
              ) : (
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                  {/* Company select */}
                  <div className="space-y-1.5">
                    <Label htmlFor="companyId">Empresa destino</Label>
                    {loadingCompanies ? (
                      <div className="flex items-center gap-2 text-sm text-[#64748B]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando empresas…
                      </div>
                    ) : (
                      <Select
                        value={form.companyId}
                        onValueChange={(val) =>
                          setForm((prev) => ({ ...prev, companyId: val, employeeId: "" }))
                        }
                      >
                        <SelectTrigger id="companyId">
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCompanies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Employee select */}
                  <div className="space-y-1.5">
                    <Label htmlFor="employeeId">Colaborador nessa empresa</Label>

                    {!form.companyId ? (
                      <p className="text-sm text-[#94A3B8]">Selecione uma empresa primeiro.</p>
                    ) : loadingEmployees ? (
                      <div className="flex items-center gap-2 text-sm text-[#64748B]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando colaboradores…
                      </div>
                    ) : noEmployeesInCompany ? (
                      /* ── No employee exists yet ── */
                      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4 space-y-3">
                        <p className="text-sm font-medium text-[#C2410C]">
                          Nenhum colaborador encontrado em {selectedCompany?.name ?? "esta empresa"}.
                        </p>
                        <p className="text-xs text-[#92400E]">
                          Para vincular o usuário <strong>{selectedUser.username}</strong> a essa empresa, primeiro
                          cadastre o colaborador com o mesmo CPF. Após o cadastro, volte aqui para concluir o vínculo.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white"
                          onClick={() => {
                            const params = new URLSearchParams({
                              companyId: form.companyId,
                              userId: selectedUser.userId,
                              username: selectedUser.username,
                            });
                            navigate(`${APP_PATHS.criarColaborador}?${params.toString()}`);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                          Cadastrar colaborador em {selectedCompany?.name ?? "esta empresa"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Select
                          value={form.employeeId}
                          onValueChange={(val) => setForm((prev) => ({ ...prev, employeeId: val }))}
                        >
                          <SelectTrigger id="employeeId">
                            <SelectValue placeholder="Selecione o colaborador" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.employeeId} value={emp.employeeId}>
                                <span className="font-medium">{emp.fullName}</span>
                                <span className="ml-2 text-[#94A3B8]">· {emp.maskedCpf}</span>
                                {!emp.active && (
                                  <span className="ml-2 text-[#EF4444] text-[10px]">(inativo)</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedEmployee && (
                          <p className="text-[11px] text-[#64748B]">
                            Cargo: {selectedEmployee.jobPosition}
                            {!selectedEmployee.active && (
                              <span className="ml-2 text-[#EF4444]">· Colaborador inativo</span>
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Role */}
                  {!noEmployeesInCompany && form.companyId && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="role">Perfil nessa empresa</Label>
                        <Select
                          value={form.role}
                          onValueChange={(val) =>
                            setForm((prev) => ({ ...prev, role: val as "MANAGER" | "PARTNER" }))
                          }
                        >
                          <SelectTrigger id="role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MANAGER">MANAGER — Administrador</SelectItem>
                            <SelectItem value="PARTNER">PARTNER — Colaborador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-[#F8FAFC] px-4 py-3">
                        <Switch
                          id="defaultCompany"
                          checked={form.defaultCompany}
                          onCheckedChange={(val) => setForm((prev) => ({ ...prev, defaultCompany: val }))}
                        />
                        <div>
                          <Label htmlFor="defaultCompany" className="cursor-pointer font-medium">
                            Empresa padrão
                          </Label>
                          <p className="text-[11px] text-[#64748B]">
                            Essa empresa será carregada automaticamente no próximo login.
                          </p>
                        </div>
                      </div>

                      {feedback && (
                        <div
                          className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
                            feedback.type === "success"
                              ? "bg-[#F0FDF4] text-[#15803D]"
                              : "bg-[#FEF2F2] text-[#B91C1C]"
                          }`}
                        >
                          {feedback.type === "success" ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          )}
                          {feedback.message}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submitting || !form.companyId || !form.employeeId}
                        className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando…
                          </>
                        ) : (
                          "Adicionar acesso"
                        )}
                      </Button>
                    </>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

export default EmpresaMultiAcesso;
