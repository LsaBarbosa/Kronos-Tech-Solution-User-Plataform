import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, FileSignature, Loader2, RefreshCcw, RotateCw, ScanFace } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useServiceContractSignatureViewModel } from "@/features/service-contract-signature/useServiceContractSignatureViewModel";
import { captureFrameFromVideo, startCameraStream, stopCameraStream } from "@/utils/camera.util";
import { safeLogger } from "@/utils/security/safeLogger";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

const AssinaturaContrato = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const vm = useServiceContractSignatureViewModel();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const handleSelect = useCallback(
    (contractId: string) => {
      const contract = vm.pendingContracts.find((c) => c.contractId === contractId) ?? null;
      vm.selectContract(contract);
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

  const selected = vm.selectedContract;
  const showEmpty = !vm.isLoading && vm.pendingContracts.length === 0;
  const canSubmit = confirmChecked && Boolean(capturedDataUrl) && !vm.isSubmitting;

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
              Assinatura de Contratos
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Assine eletronicamente os contratos que foram atribuídos a você.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => vm.refresh()}
            disabled={vm.isLoading}
            aria-label="Recarregar contratos pendentes"
          >
            <RefreshCcw className={"mr-2 h-4 w-4 " + (vm.isLoading ? "animate-spin" : "")} />
            Atualizar
          </Button>
        </header>

        {vm.isLoading && vm.pendingContracts.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white dark:border-[#404854] dark:bg-slate-800/50">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : null}

        {showEmpty ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center text-sm text-slate-600 dark:border-[#404854] dark:bg-slate-800/50 dark:text-slate-300">
            Nenhum contrato pendente de assinatura.
          </div>
        ) : null}

        {vm.pendingContracts.length > 0 ? (
          <section className="space-y-3" aria-label="Lista de contratos pendentes">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Contratos pendentes ({vm.pendingContracts.length})
            </h2>
            <ul className="space-y-2">
              {vm.pendingContracts.map((contract) => {
                const isSelected = selected?.contractId === contract.contractId;
                return (
                  <li key={contract.contractId}>
                    <button
                      type="button"
                      onClick={() => handleSelect(contract.contractId)}
                      className={
                        "w-full rounded-2xl border p-4 text-left transition-all " +
                        (isSelected
                          ? "border-[#7C3AED] bg-violet-50 dark:border-[#A78BFA] dark:bg-violet-900/30"
                          : "border-[#E5E7EB] bg-white hover:border-slate-300 dark:border-[#404854] dark:bg-slate-800/50 dark:hover:border-slate-600")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                            {contract.title}
                          </p>
                          {contract.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                              {contract.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[11px] text-slate-400">
                            Arquivo: {contract.originalFileName}
                          </p>
                        </div>
                        {isSelected ? (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800 dark:bg-violet-900/50 dark:text-violet-100">
                            Selecionado
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {selected ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-[#404854] dark:bg-slate-800/50"
            aria-label="Formulário de assinatura do contrato"
          >
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                1. Abra e confira o contrato
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                É obrigatório abrir e ler o contrato antes de assinar.
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
                  <>Abrir contrato</>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                2. Confirme a declaração
              </h3>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#404854] dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Declaração de ciência
                  </h4>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    v{selected.declarationVersion}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {selected.declarationText}
                </p>
                <label className="mt-4 flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    disabled={vm.isSubmitting}
                  />
                  <span>
                    Li e confirmo a declaração acima. Esta confirmação será registrada com
                    data, hora, endereço IP e identificação do dispositivo.
                  </span>
                </label>
              </div>
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
                  Assinar contrato
                </>
              )}
            </Button>
          </form>
        ) : null}
      </div>
      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.CONTRACTS} className="mt-6" />
    </PageShell>
  );
};

export default AssinaturaContrato;
