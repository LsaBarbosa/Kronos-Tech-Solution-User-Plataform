import { useLocation } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

const LoginSessionAlert = () => {
  const location = useLocation();
  const reason = (location.state as Record<string, unknown> | null)?.reason;
  if (reason !== "session_expired") return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-2xl border border-[#FCD34D] bg-[#FEF3C7] px-4 py-3 text-xs leading-5 text-[#92400E]"
    >
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold text-[#92400E]">Sessão expirada</p>
        <p>Por segurança, faça login novamente para continuar.</p>
      </div>
    </div>
  );
};

export default LoginSessionAlert;
