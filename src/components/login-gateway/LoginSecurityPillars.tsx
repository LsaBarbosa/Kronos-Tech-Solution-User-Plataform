import { Fingerprint, ShieldCheck, Lock, type LucideIcon } from "lucide-react";

interface Pillar {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const PILLARS: Pillar[] = [
  {
    icon: ShieldCheck,
    title: "Conformidade trabalhista",
    description: "Portaria 671, AEJ e AFD prontos para fiscalização.",
    iconBg: "bg-white/10",
    iconColor: "text-cyan-300",
  },
  {
    icon: Fingerprint,
    title: "Biometria com consentimento",
    description: "Reconhecimento facial protegido por termo LGPD.",
    iconBg: "bg-[#7C3AED]/20",
    iconColor: "text-[#C4B5FD]",
  },
  {
    icon: Lock,
    title: "Sessão protegida",
    description: "Sessão criptografada e expiração automática.",
    iconBg: "bg-[#0D9488]/20",
    iconColor: "text-[#5EEAD4]",
  },
];

const LoginSecurityPillars = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {PILLARS.map(({ icon: Icon, title, description, iconBg, iconColor }) => (
        <div
          key={title}
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 backdrop-blur"
        >
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-white/70">{description}</p>
        </div>
      ))}
    </div>
  );
};

export default LoginSecurityPillars;
