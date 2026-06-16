import { useCallback, useMemo, useState } from "react";
import { Eye, EyeOff, FileSignature, Loader2, RefreshCcw } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimesheetSignatureViewModel } from "@/features/timesheet-signature/useTimesheetSignatureViewModel";
import SignaturePendingBlockers from "@/components/timesheet-signature/SignaturePendingBlockers";
import SignatureDeclarationBox from "@/components/timesheet-signature/SignatureDeclarationBox";
import SignatureStatusCard from "@/components/timesheet-signature/SignatureStatusCard";

const formatMonthInputValue = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, "0")}`;

const parseMonthInput = (raw: string): { year: number; month: number } | null => {
  const match = /^(\d{4})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
};

const defaultPreviousMonthInput = (): string => {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return formatMonthInputValue(previous.getFullYear(), previous.getMonth() + 1);
};

const currentMonthInput = (): string => {
  const now = new Date();
  return formatMonthInputValue(now.getFullYear(), now.getMonth() + 1);
};

const AssinaturaPonto = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const vm = useTimesheetSignatureViewModel();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [monthInputValue, setMonthInputValue] = useState<string>(() => defaultPreviousMonthInput());

  const maxMonthValue = useMemo(() => {
    const now = new Date();
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return formatMonthInputValue(previous.getFullYear(), previous.getMonth() + 1);
  }, []);

  const handleMonthChange = useCallback(
    (value: string) => {
      setMonthInputValue(value);
      const parsed = parseMonthInput(value);
      if (!parsed) {
        vm.setSelectedPeriod(null);
        return;
      }
      if (value >= currentMonthInput()) {
        // bloqueio defensivo na UI (o backend revalida igual)
        return;
      }
      vm.setSelectedPeriod(parsed);
      setConfirmChecked(false);
      setPassword("");
    },
    [vm]
  );

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!confirmChecked) return;
      if (!password) return;
      const ok = await vm.sign(password);
      // Limpa senha em qualquer caso (sucesso ou falha) para evitar reuso/cache em DOM.
      setPassword("");
      if (ok) {
        setConfirmChecked(false);
      }
    },
    [confirmChecked, password, vm]
  );

  const isLoading = vm.isLoading && !vm.status;
  const status = vm.status;

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      mainClassName="pt-24 sm:pt-32 px-4 pb-5 sm:px-6 sm:pb-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Assinatura do Ponto
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Confirme eletronicamente o espelho de ponto de qualquer mês anterior ao vigente.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => vm.refresh()}
              disabled={vm.isLoading}
              aria-label="Recarregar status"
            >
              <RefreshCcw className={"mr-2 h-4 w-4 " + (vm.isLoading ? "animate-spin" : "")} />
              Atualizar
            </Button>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#404854] dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="signature-period" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Período a assinar
            </label>
            <Input
              id="signature-period"
              type="month"
              value={monthInputValue}
              max={maxMonthValue}
              onChange={(event) => handleMonthChange(event.target.value)}
              disabled={vm.isLoading || vm.isSubmitting}
              className="max-w-[180px]"
              aria-label="Mês de referência"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white dark:border-[#404854] dark:bg-slate-800/50">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : null}

        {status ? (
          <>
            <SignatureStatusCard status={status} onDownloadSigned={vm.downloadSigned} />

            {!status.alreadySigned ? (
              <>
                <SignaturePendingBlockers blockers={status.blockers} />

                {status.eligible ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-[#404854] dark:bg-slate-800/50"
                    aria-label="Formulário de assinatura do ponto"
                  >
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        1. Visualize o espelho do período selecionado
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        É obrigatório abrir e conferir o espelho antes de assinar.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => vm.preview()}
                        disabled={vm.isPreviewLoading}
                      >
                        {vm.isPreviewLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando…
                          </>
                        ) : (
                          <>Abrir espelho do período selecionado</>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        2. Confirme a declaração
                      </h3>
                      <SignatureDeclarationBox
                        text={status.declarationText}
                        version={status.declarationVersion}
                        checked={confirmChecked}
                        onCheckedChange={setConfirmChecked}
                        disabled={vm.isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        3. Informe sua senha atual
                      </h3>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Senha de acesso ao Kronos"
                          disabled={vm.isSubmitting}
                          required
                          aria-label="Senha"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          disabled={vm.isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        A senha nunca é armazenada nem registrada em históricos do sistema.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]"
                      disabled={!confirmChecked || !password || vm.isSubmitting}
                    >
                      {vm.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando assinatura…
                        </>
                      ) : (
                        <>
                          <FileSignature className="mr-2 h-4 w-4" />
                          Assinar ponto de {String(status.referenceMonth).padStart(2, "0")}/
                          {status.referenceYear}
                        </>
                      )}
                    </Button>
                  </form>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </PageShell>
  );
};

export default AssinaturaPonto;
