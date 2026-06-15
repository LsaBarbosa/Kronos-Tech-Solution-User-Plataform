import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_PATHS } from "@/config/app-routes";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_40%)]" />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
          <CardContent className="space-y-5 px-6 py-8 text-center">
            <span
              aria-hidden="true"
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1220] text-base font-black text-white"
            >
              K
            </span>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
                Erro 404
              </p>
              <h1 className="text-3xl font-semibold text-[#0F172A]">Página não encontrada</h1>
              <p className="text-sm leading-6 text-[#64748B]">
                A página que você tentou acessar não existe ou foi movida.
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={() => navigate(APP_PATHS.dashboard)}
              className="h-12 w-full gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              <Home className="h-4 w-4" />
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NotFound;
