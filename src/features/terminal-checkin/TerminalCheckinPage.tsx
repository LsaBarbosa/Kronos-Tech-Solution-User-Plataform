import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { CheckinError, TerminalCheckinFlowStatus } from "@/types/checkin.types";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock3,
  Loader2,
  LogOut,
  MapPin,
  RotateCcw,
  ScanFace,
  ShieldCheck,
} from "lucide-react";
import { useTerminalCheckinFlow, type TerminalCheckinViewModel } from "./useTerminalCheckinFlow";

const DESKTOP_QUERY = "(min-width: 1024px)";

const STATUS_META: Record<
  TerminalCheckinFlowStatus,
  {
    eyebrow: string;
    title: string;
    description: string;
    tone: string;
    Icon: typeof ScanFace;
  }
> = {
  start: {
    eyebrow: "Terminal pronto",
    title: "Nova marcação de ponto",
    description: "Inicie o fluxo para capturar localização e foto em uma única jornada.",
    tone: "bg-[#DBEAFE] text-[#1D4ED8]",
    Icon: ScanFace,
  },
  collecting: {
    eyebrow: "Coletando dados",
    title: "Preparando identificação",
    description: "Ative localização e câmera. Quando tudo estiver pronto, envie a marcação.",
    tone: "bg-[#E0F2FE] text-[#0369A1]",
    Icon: Camera,
  },
  submitting: {
    eyebrow: "Enviando",
    title: "Validando colaborador",
    description: "O terminal está aguardando a autenticação facial e o registro de ponto.",
    tone: "bg-[#E2E8F0] text-[#334155]",
    Icon: Loader2,
  },
  success: {
    eyebrow: "Concluído",
    title: "Terminal liberando a sessão",
    description: "A tela permanece por 10 segundos para conferência antes de resetar.",
    tone: "bg-[#DCFCE7] text-[#166534]",
    Icon: CheckCircle2,
  },
  error: {
    eyebrow: "Falha no fluxo",
    title: "Não foi possível concluir",
    description: "Revise permissões, posicionamento e reinicie o terminal quando estiver pronto.",
    tone: "bg-[#FEE2E2] text-[#B91C1C]",
    Icon: AlertTriangle,
  },
  exiting: {
    eyebrow: "Saindo",
    title: "Limpando sessão",
    description: "O terminal está removendo a sessão atual para receber o próximo colaborador.",
    tone: "bg-[#E2E8F0] text-[#0F172A]",
    Icon: LogOut,
  },
};

const getErrorRedirectUrl = (error: CheckinError | null): string | null => {
  if (!error?.details || typeof error.details !== "object") {
    return null;
  }

  const redirectUrl = (error.details as { redirectUrl?: unknown }).redirectUrl;
  return typeof redirectUrl === "string" && redirectUrl.trim() ? redirectUrl : null;
};

const formatRecordedAt = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const getLocationSummary = (viewModel: TerminalCheckinViewModel): string => {
  if (!viewModel.state.coordinates) {
    return "Aguardando localização";
  }

  const accuracy = viewModel.state.coordinates.accuracy;
  if (typeof accuracy === "number" && Number.isFinite(accuracy)) {
    return `Localização confirmada com precisão de ${Math.round(accuracy)} m`;
  }

  return "Localização confirmada";
};

const TerminalPreview = ({
  compact,
  viewModel,
}: {
  compact: boolean;
  viewModel: TerminalCheckinViewModel;
}) => {
  const { state, videoRef } = viewModel;
  const showImage = Boolean(state.previewImage);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-[#06111F] shadow-[0_24px_60px_rgba(2,6,23,0.45)]",
        compact ? "aspect-[5/4]" : "aspect-[4/3]"
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          showImage ? "opacity-0" : "opacity-100"
        )}
      />

      {showImage ? (
        <img
          src={state.previewImage ?? undefined}
          alt="Colaborador capturado para validação do terminal"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur",
            state.isLocationReady
              ? "bg-[#DCFCE7]/95 text-[#166534]"
              : "bg-white/10 text-white"
          )}
        >
          <MapPin className="h-3.5 w-3.5" />
          {state.isLocationReady ? "Localização pronta" : "Localização pendente"}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur",
            state.isCameraReady
              ? "bg-[#DBEAFE]/95 text-[#1D4ED8]"
              : "bg-white/10 text-white"
          )}
        >
          <Camera className="h-3.5 w-3.5" />
          {state.isCameraReady ? "Câmera pronta" : "Câmera pendente"}
        </span>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/90 via-[#020817]/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-white">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#BFDBFE]">
            Captura guiada
          </p>
          <h2 className={cn("font-semibold leading-tight", compact ? "text-xl" : "text-2xl")}>
            {state.status === "success"
              ? "Registro concluído"
              : state.status === "submitting"
                ? "Enviando para a API"
                : state.status === "error"
                  ? "Fluxo interrompido"
                  : "Aproxime o rosto da câmera"}
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-200">
          {state.status === "start"
            ? "O terminal fica isolado do dashboard e usa o contrato dedicado do back-end."
            : state.status === "collecting"
              ? "Garanta um enquadramento frontal e iluminação uniforme antes de enviar."
              : state.status === "submitting"
                ? "A autenticação facial e o registro de entrada ou saída são processados juntos."
                : state.status === "success"
                  ? "A sessão será limpa automaticamente para o próximo colaborador."
                  : state.status === "error"
                    ? "Reinicie o fluxo para refazer a coleta da imagem e da localização."
                    : "Aguarde a limpeza automática desta sessão."}
        </p>
      </div>
    </div>
  );
};

const TerminalStatusCard = ({
  compact,
  viewModel,
}: {
  compact: boolean;
  viewModel: TerminalCheckinViewModel;
}) => {
  const { state } = viewModel;
  const meta = STATUS_META[state.status];
  const Icon = meta.Icon;
  const recordedAtLabel = formatRecordedAt(state.response?.recordedAt ?? null);

  return (
    <Card className="rounded-[28px] border-[#D6E3F5] bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              meta.tone
            )}
          >
            <Icon className={cn("h-5 w-5", state.status === "submitting" && "animate-spin")} />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
              {meta.eyebrow}
            </p>
            <h2 className={cn("font-semibold text-[#0F172A]", compact ? "text-2xl" : "text-[2rem]")}>
              {meta.title}
            </h2>
            <p className="text-sm leading-6 text-[#475569]">{meta.description}</p>
          </div>
        </div>

        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-2")}>
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Localização
            </p>
            <p className="mt-2 text-sm font-medium text-[#0F172A]">{getLocationSummary(viewModel)}</p>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Segurança
            </p>
            <p className="mt-2 text-sm font-medium text-[#0F172A]">
              Foto e coordenadas seguem juntas na mesma requisição.
            </p>
          </div>
        </div>

        {state.response ? (
          <div className="space-y-3 rounded-[24px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#166534]">
                {state.response.actionType}
              </span>
              {recordedAtLabel ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#166534]">
                  <Clock3 className="h-3.5 w-3.5" />
                  {recordedAtLabel}
                </span>
              ) : null}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#166534]">{state.response.loginMessage}</p>
              <p className="text-sm leading-6 text-[#166534]">{state.response.recordMessage}</p>
            </div>
            {state.status === "success" && typeof state.countdownSeconds === "number" ? (
              <p aria-live="polite" className="text-xs font-medium text-[#166534]">
                Reinício automático em {state.countdownSeconds} segundos.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

const TerminalErrorCard = ({ error }: { error: CheckinError | null }) => {
  if (!error) {
    return null;
  }

  const redirectUrl = getErrorRedirectUrl(error);

  return (
    <Card className="rounded-[24px] border-[#FECACA] bg-[#FEF2F2] p-4 shadow-none">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#B91C1C]">Falha na identificação</p>
        <p className="text-sm leading-6 text-[#7F1D1D]">{error.message}</p>
        {redirectUrl ? (
          <a
            href={redirectUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm font-semibold text-[#B91C1C] underline underline-offset-4"
          >
            Abrir termo biométrico
          </a>
        ) : null}
      </div>
    </Card>
  );
};

const TerminalActionPanel = ({
  compact,
  viewModel,
}: {
  compact: boolean;
  viewModel: TerminalCheckinViewModel;
}) => {
  const { state, startFlow, captureAndSubmit, restartFlow, exitFlow } = viewModel;

  const renderActions = () => {
    if (state.status === "start") {
      return (
        <Button
          type="button"
          onClick={() => void startFlow()}
          className="h-14 rounded-2xl bg-[#0F3B66] text-sm font-semibold text-white hover:bg-[#0B2E51]"
        >
          Iniciar terminal
        </Button>
      );
    }

    if (state.status === "collecting") {
      const canSubmit = state.isLocationReady && state.isCameraReady;

      return (
        <>
          <Button
            type="button"
            onClick={() => void captureAndSubmit()}
            disabled={!canSubmit}
            className="h-14 rounded-2xl bg-[#0F3B66] text-sm font-semibold text-white hover:bg-[#0B2E51]"
          >
            Registrar ponto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={restartFlow}
            className="h-14 rounded-2xl border-[#BFD3EA] text-sm font-semibold text-[#0F3B66]"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar fluxo
          </Button>
        </>
      );
    }

    if (state.status === "submitting") {
      return (
        <Button
          type="button"
          disabled
          className="h-14 rounded-2xl bg-[#0F3B66] text-sm font-semibold text-white"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Enviando registro
        </Button>
      );
    }

    if (state.status === "success") {
      return (
        <Button
          type="button"
          onClick={() => void exitFlow()}
          className="h-14 rounded-2xl bg-[#166534] text-sm font-semibold text-white hover:bg-[#14532D]"
        >
          <LogOut className="h-4 w-4" />
          Liberar para o próximo colaborador
        </Button>
      );
    }

    if (state.status === "error") {
      return (
        <>
          <Button
            type="button"
            onClick={restartFlow}
            className="h-14 rounded-2xl bg-[#B91C1C] text-sm font-semibold text-white hover:bg-[#991B1B]"
          >
            Reiniciar fluxo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void startFlow()}
            className="h-14 rounded-2xl border-[#FECACA] text-sm font-semibold text-[#B91C1C]"
          >
            Tentar coleta imediata
          </Button>
        </>
      );
    }

    return (
      <Button
        type="button"
        disabled
        className="h-14 rounded-2xl bg-[#0F172A] text-sm font-semibold text-white"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Limpando sessão
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-1" : "grid-cols-1"
      )}
    >
      {renderActions()}
    </div>
  );
};

const DesktopTerminalCheckin = ({ viewModel }: { viewModel: TerminalCheckinViewModel }) => (
  <div
    data-testid="terminal-checkin-desktop"
    className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,_#EAF3FF_0%,_#F8FAFC_48%,_#DCEBFF_100%)] px-8 py-8"
  >
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-[1.05fr_0.95fr] gap-8">
      <section className="flex flex-col justify-between rounded-[36px] bg-[#071224] p-8 text-white shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#BFDBFE]">
              <ShieldCheck className="h-4 w-4" />
              Operação assistida em tela ampla
            </span>
            <div className="space-y-3">
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.05]">
                Terminal isolado para entrada e saída sem passar pelo dashboard.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300">
                O colaborador libera localização, posiciona o rosto e o terminal envia foto e
                coordenadas no contrato dedicado do back-end. Ao final, a sessão é limpa para o
                próximo uso.
              </p>
            </div>
          </div>

          <TerminalPreview compact={false} viewModel={viewModel} />
        </div>

        <div className="grid gap-4 pt-8 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#93C5FD]">
              Etapa 1
            </p>
            <p className="mt-2 font-medium text-white">Coleta coordenadas e ativa a câmera.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#93C5FD]">
              Etapa 2
            </p>
            <p className="mt-2 font-medium text-white">Identifica o colaborador e registra a ação.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#93C5FD]">
              Etapa 3
            </p>
            <p className="mt-2 font-medium text-white">Mostra o resultado por 10 segundos e reseta.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-center gap-5">
        <TerminalStatusCard compact={false} viewModel={viewModel} />
        <TerminalErrorCard error={viewModel.state.error} />
        <TerminalActionPanel compact={false} viewModel={viewModel} />
      </section>
    </div>
  </div>
);

const MobileTerminalCheckin = ({ viewModel }: { viewModel: TerminalCheckinViewModel }) => (
  <div
    data-testid="terminal-checkin-mobile"
    className="min-h-screen bg-[linear-gradient(180deg,_#0F3B66_0%,_#123E70_22%,_#EAF3FF_22%,_#F8FAFC_100%)] px-4 py-5"
  >
    <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col gap-4">
      <header data-testid="terminal-checkin-mobile-copy" className="space-y-3 text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#DBEAFE]">
          <ShieldCheck className="h-4 w-4" />
          Modo toque rápido
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold leading-tight">
            Check-in e checkout em uma tela móvel dedicada.
          </h1>
          <p className="text-sm leading-6 text-[#DBEAFE]">
            Fluxo simplificado para terminal leve, fora da área protegida da plataforma.
          </p>
        </div>
      </header>

      <TerminalPreview compact viewModel={viewModel} />

      <div
        data-testid="terminal-checkin-mobile-actions"
        className="rounded-[28px] border border-[#D6E3F5] bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur"
      >
        <TerminalActionPanel compact viewModel={viewModel} />
      </div>

      <div data-testid="terminal-checkin-mobile-status" className="space-y-4">
        <TerminalStatusCard compact viewModel={viewModel} />
        <TerminalErrorCard error={viewModel.state.error} />
      </div>
    </div>
  </div>
);

const TerminalCheckinPage = () => {
  const viewModel = useTerminalCheckinFlow();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return isDesktop ? (
    <DesktopTerminalCheckin viewModel={viewModel} />
  ) : (
    <MobileTerminalCheckin viewModel={viewModel} />
  );
};

export default TerminalCheckinPage;
