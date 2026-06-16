import { useCallback, useState } from "react";
import { Eye, EyeOff, FileSignature, Loader2, RefreshCcw } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimesheetSignatureViewModel } from "@/features/timesheet-signature/useTimesheetSignatureViewModel";
import SignaturePendingBlockers from "@/components/timesheet-signature/SignaturePendingBlockers";
import SignatureDeclarationBox from "@/components/timesheet-signature/SignatureDeclarationBox";
import SignatureStatusCard from "@/components/timesheet-signature/SignatureStatusCard";

const AssinaturaPonto = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const vm = useTimesheetSignatureViewModel();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Assinatura do Ponto
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Confirme eletronicamente o espelho de ponto referente ao mês anterior.
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
                        1. Visualize o espelho do mês anterior
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
                          <>Abrir espelho do mês anterior</>
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
                        A senha nunca é armazenada nem registrada em logs.
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
