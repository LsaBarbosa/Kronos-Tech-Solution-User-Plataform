import { Badge } from "@/components/ui/badge";
import LoginForm from "@/components/LoginForm";
import LoginPrivacyLinks from "./LoginPrivacyLinks";
import LoginSessionAlert from "./LoginSessionAlert";

const LoginMobile = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <header className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-5 py-6 text-white">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-base font-black text-[#0B1220]"
          >
            K
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-[0.18em]">Kronos</p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">Acesso seguro</p>
          </div>
        </div>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          <Badge className="border-white/15 bg-white/10 text-white">Bem-vindo de volta</Badge>
          <h1 className="text-xl font-semibold leading-tight">
            Entre na sua conta corporativa
          </h1>
          <p className="text-sm leading-6 text-white/75">
            Acesse jornada, documentos e privacidade em um único lugar seguro.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-3 px-4 py-5">
        <LoginSessionAlert />
        <LoginForm />
        <p className="text-center text-[11px] text-[#94A3B8]">
          Sessão protegida · LGPD · Biometria opcional com consentimento
        </p>
      </main>

      <LoginPrivacyLinks variant="mobile" />
    </div>
  );
};

export default LoginMobile;
