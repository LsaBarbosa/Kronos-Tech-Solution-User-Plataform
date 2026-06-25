import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, FileSignature, Loader2, RefreshCcw, RotateCw, ScanFace } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimesheetSignatureViewModel } from "@/features/timesheet-signature/useTimesheetSignatureViewModel";
import SignaturePendingBlockers from "@/components/timesheet-signature/SignaturePendingBlockers";
import SignatureDeclarationBox from "@/components/timesheet-signature/SignatureDeclarationBox";
import SignatureStatusCard from "@/components/timesheet-signature/SignatureStatusCard";
import { captureFrameFromVideo, startCameraStream, stopCameraStream } from "@/utils/camera.util";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";
import { safeLogger } from "@/utils/security/safeLogger";

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
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [monthInputValue, setMonthInputValue] = useState<string>(() => defaultPreviousMonthInput());

  const maxMonthValue = useMemo(() => {
    const now = new Date();
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return formatMonthInputValue(previous.getFullYear(), previous.getMonth() + 1);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const stopCamera = useCallback(() => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream(streamRef.current);
    };
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
        return;
      }
      vm.setSelectedPeriod(parsed);
      setConfirmChecked(false);
      setCapturedDataUrl(null);
      stopCamera();
      setCameraError(null);
    },
    [vm, stopCamera]
  );

  const handleStartCamera = useCallback(async () => {
    setCapturedDataUrl(null);
    setCameraError(null);
    setIsCameraLoading(true);
    try {
      const stream = await startCameraStream();
      streamRef.current = stream;
      setIsCameraActive(true); // renders <video> first; srcObject is attached in useEffect below
    } catch {
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
      setIsCameraLoading(false);
    }
  }, []);

  // Attach stream after <video> element mounts (isCameraActive=true triggers the render)
  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video
      .play()
      .then(() => setIsCameraLoading(false))
      .catch(() => {
        setCameraError("Não foi possível iniciar a câmera.");
        setIsCameraLoading(false);
        stopCamera();
      });
  }, [isCameraActive, stopCamera]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    try {
      const dataUrl = captureFrameFromVideo(videoRef.current);
      setCapturedDataUrl(dataUrl);
      stopCamera();
    } catch (err) {
      safeLogger.error("Erro ao capturar imagem:", err);
      setCameraError("Falha ao capturar imagem. Tente novamente.");
    }
  }, [stopCamera]);

  const handleRetake = useCallback(() => {
    setCapturedDataUrl(null);
    setCameraError(null);
    void handleStartCamera();
  }, [handleStartCamera]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!confirmChecked || !capturedDataUrl) return;
      const base64 = capturedDataUrl.split(",")[1];
      if (!base64) return;
      const ok = await vm.sign(base64);
      setCapturedDataUrl(null);
      setCameraError(null);
      if (ok) {
        setConfirmChecked(false);
      }
    },
    [confirmChecked, capturedDataUrl, vm]
  );

  const isLoading = vm.isLoading && !vm.status;
  const status = vm.status;
  const canSubmit = confirmChecked && Boolean(capturedDataUrl) && !vm.isSubmitting;

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

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        3. Autenticação por reconhecimento facial
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Capture uma foto do seu rosto para confirmar sua identidade.
                      </p>

                      {capturedDataUrl ? (
                        <div className="space-y-3">
                          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-[#404854]">
                            <img
                              src={capturedDataUrl}
                              alt="Foto capturada"
                              className="w-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRetake}
                            disabled={vm.isSubmitting}
                          >
                            <RotateCw className="mr-2 h-4 w-4" />
                            Repetir captura
                          </Button>
                        </div>
                      ) : isCameraActive ? (
                        <div className="space-y-3">
                          <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-black dark:border-[#404854]">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full"
                              aria-label="Visualização da câmera"
                            />
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <div className="h-40 w-32 rounded-full border-2 border-white/60 opacity-60" />
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Centralize seu rosto no guia oval, com boa iluminação.
                          </p>
                          <Button
                            type="button"
                            onClick={handleCapture}
                            disabled={vm.isSubmitting}
                            className="bg-[#7C3AED] hover:bg-[#6D28D9]"
                          >
                            <ScanFace className="mr-2 h-4 w-4" />
                            Capturar
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cameraError ? (
                            <p className="text-xs text-red-500 dark:text-red-400">{cameraError}</p>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleStartCamera}
                            disabled={isCameraLoading || vm.isSubmitting}
                          >
                            {isCameraLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Acessando câmera…
                              </>
                            ) : (
                              <>
                                <Camera className="mr-2 h-4 w-4" />
                                Ativar câmera
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]"
                      disabled={!canSubmit}
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
      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.TIME_RECORDS} className="mt-6" />
    </PageShell>
  );
};

export default AssinaturaPonto;
