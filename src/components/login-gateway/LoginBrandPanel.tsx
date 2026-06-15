import { Badge } from "@/components/ui/badge";
import Clock from "@/components/Clock";
import LoginSecurityPillars from "./LoginSecurityPillars";
import LoginPrivacyLinks from "./LoginPrivacyLinks";

const LoginBrandPanel = () => {
  return (
    <aside className="relative flex h-full min-h-[600px] flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-8 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.20),transparent_35%)]" />

      <div className="relative space-y-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-base font-black text-[#0B1220]"
          >
            K
          </span>
          <div>
            <p className="text-base font-semibold tracking-[0.18em]">Kronos</p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
              Plataforma de jornada e conformidade
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Badge className="border-white/15 bg-white/10 text-white">Secure Access Gateway</Badge>
          <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
            Acesso seguro para gestão de jornada
          </h1>
          <p className="max-w-md text-sm leading-6 text-white/75">
            Controle de ponto, documentos, aprovações, relatórios legais e privacidade —
            tudo em uma única entrada corporativa.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Hora oficial Kronos
          </p>
          <div className="mt-1 text-white">
            <Clock />
          </div>
        </div>

        <LoginSecurityPillars />
      </div>

      <div className="relative mt-6">
        <LoginPrivacyLinks variant="desktop" />
      </div>
    </aside>
  );
};

export default LoginBrandPanel;
