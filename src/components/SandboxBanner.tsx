import { FlaskConical } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SandboxBanner = () => {
  const { user } = useAuth();
  const isSandbox = user?.profile?.sandbox === true;

  if (!isSandbox) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-center text-sm font-semibold text-white shadow-md"
    >
      <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
      Ambiente de demonstração — dados sintéticos, sem impacto em produção
    </div>
  );
};

export default SandboxBanner;
