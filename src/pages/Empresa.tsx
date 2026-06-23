import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  Edit3,
  Link2,
  PlusCircle,
  Search,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import { cn } from "@/lib/utils";

interface EmpresaAction {
  key: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  accentBg: string;
  accentText: string;
  ctaLabel: string;
  path: string;
}

const ACTIONS: EmpresaAction[] = [
  {
    key: "create",
    label: "Cadastro",
    title: "Criar empresa",
    description: "Cadastre uma nova empresa no tenant, com dados institucionais e responsáveis.",
    icon: PlusCircle,
    tone: "from-[#16A34A] to-[#22D3EE]",
    accentBg: "bg-[#DCFCE7]",
    accentText: "text-[#15803D]",
    ctaLabel: "Nova empresa",
    path: APP_PATHS.empresaCriar,
  },
  {
    key: "add-manager",
    label: "Administradores",
    title: "Adicionar administrador",
    description: "Crie um novo administrador (MANAGER) com acesso operacional ao tenant.",
    icon: UserPlus,
    tone: "from-[#1E3A8A] to-[#2563EB]",
    accentBg: "bg-[#EFF6FF]",
    accentText: "text-[#1D4ED8]",
    ctaLabel: "Novo administrador",
    path: APP_PATHS.criarAdministrador,
  },
  {
    key: "search",
    label: "Consulta",
    title: "Buscar empresa",
    description: "Pesquise e visualize empresas cadastradas com filtros e detalhe.",
    icon: Search,
    tone: "from-[#0D9488] to-[#22D3EE]",
    accentBg: "bg-[#CCFBF1]",
    accentText: "text-[#0F766E]",
    ctaLabel: "Buscar empresas",
    path: APP_PATHS.empresaBuscar,
  },
  {
    key: "update",
    label: "Manutenção",
    title: "Atualizar empresa",
    description: "Edite dados, status e contatos de empresas existentes.",
    icon: Edit3,
    tone: "from-[#7C3AED] to-[#A855F7]",
    accentBg: "bg-[#EDE9FE]",
    accentText: "text-[#5B21B6]",
    ctaLabel: "Atualizar dados",
    path: APP_PATHS.empresaAtualizar,
  },
  {
    key: "multi-acesso",
    label: "Multiempresa",
    title: "Acesso multiempresa",
    description: "Vincule um usuário existente a uma nova empresa sem criar novo cadastro.",
    icon: Link2,
    tone: "from-[#D97706] to-[#F59E0B]",
    accentBg: "bg-[#FEF3C7]",
    accentText: "text-[#B45309]",
    ctaLabel: "Gerenciar acessos",
    path: APP_PATHS.empresaMultiAcesso,
  },
];

const Empresa = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleBack = useCallback(() => navigate(APP_PATHS.dashboard), [navigate]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
        <div className="flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar ao início
          </Button>
        </div>

        <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.20),transparent_30%)]" />
          <div className="relative bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-6 py-7 text-white sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-3">
                <Badge className="border-white/15 bg-white/10 text-white">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Painel institucional
                </Badge>
                <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                  Gestão de empresas
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                  Cadastre novas empresas, gerencie administradores, pesquise registros existentes
                  e mantenha os dados institucionais atualizados.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                  <Building2 className="mr-2 h-3.5 w-3.5" />
                  {ACTIONS.length} ações disponíveis
                </Badge>
                <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">
                  Acesso restrito · CTO
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.key}
                className="group overflow-hidden border-border/70 shadow-sm transition hover:border-[#2563EB] hover:shadow-md"
                role="button"
                tabIndex={0}
                aria-label={action.title}
                onClick={() => navigate(action.path)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(action.path);
                  }
                }}
              >
                <div className={cn("h-1 w-full bg-gradient-to-r", action.tone)} />
                <CardContent className="space-y-4 px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl",
                        action.accentBg,
                        action.accentText
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <Badge className="border-border/70 bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#475569]">
                      {action.label}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-base font-semibold text-[#0F172A]">{action.title}</p>
                    <p className="text-xs leading-5 text-[#64748B]">{action.description}</p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between gap-2 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(action.path);
                    }}
                  >
                    {action.ctaLabel}
                    <ArrowRight className="h-4 w-4 text-[#1D4ED8] transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

export default Empresa;
