import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Building2,
  Calculator,
  ChevronLeft,
  ClipboardCheck,
  FileSignature,
  FileText,
  FlaskConical,
  Scale,
  Shield,
  TimerReset,
  TreePalm,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageShell from "@/components/PageShell";
import {
  APP_PATHS,
  APP_ROUTE_META,
  type AppRole,
  type AppRouteMeta,
} from "@/config/app-routes";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

interface AdminRouteCard {
  route: AppRouteMeta;
  icon: LucideIcon;
  description: string;
}

type AdminGroupKey =
  | "collaborators"
  | "timesheet"
  | "vacation"
  | "timeOff"
  | "contracts"
  | "audit"
  | "lgpd"
  | "ctoDemo";

interface AdminGroupConfig {
  key: AdminGroupKey;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: string;
  accent: string;
  routes: AdminRouteCard[];
}

const buildGroups = (): AdminGroupConfig[] => [
  {
    key: "collaborators",
    title: "Colaboradores",
    subtitle: "Gestão da equipe e cadastro",
    icon: Users,
    tone: "from-[#1E3A8A] to-[#2563EB]",
    accent: "bg-[#EFF6FF] text-[#1D4ED8]",
    routes: [
      {
        route: APP_ROUTE_META.listaColaboradores,
        icon: UserCheck,
        description: "Veja, edite e mantenha o cadastro de colaboradores ativos e inativos.",
      },
      {
        route: APP_ROUTE_META.criarColaborador,
        icon: UserPlus,
        description: "Crie um novo colaborador e atribua o seu cargo na empresa.",
      },
    ],
  },
  {
    key: "timesheet",
    title: "Folha de Ponto",
    subtitle: "Apuração e correção de registros",
    icon: ClipboardCheck,
    tone: "from-[#0D9488] to-[#22D3EE]",
    accent: "bg-[#CCFBF1] text-[#0F766E]",
    routes: [
      {
        route: APP_ROUTE_META.apuracaoHoras,
        icon: Calculator,
        description: "Apure horas trabalhadas, saldos e excedentes do período.",
      },
      {
        route: APP_ROUTE_META.statusDoRegistro,
        icon: ClipboardCheck,
        description: "Corrija status (falta, folga, abono) de registros de ponto.",
      },
    ],
  },
  {
    key: "vacation",
    title: "Férias",
    subtitle: "Aprovação e acompanhamento",
    icon: TreePalm,
    tone: "from-[#16A34A] to-[#22D3EE]",
    accent: "bg-[#DCFCE7] text-[#15803D]",
    routes: [
      {
        route: APP_ROUTE_META.ferias,
        icon: TreePalm,
        description: "Aprove ou rejeite solicitações de férias com contexto do colaborador.",
      },
    ],
  },
  {
    key: "timeOff",
    title: "Registro Manual",
    subtitle: "Abonos e ajustes manuais",
    icon: TimerReset,
    tone: "from-[#F59E0B] to-[#FB923C]",
    accent: "bg-[#FEF3C7] text-[#92400E]",
    routes: [
      {
        route: APP_ROUTE_META.aprovacoesAbono,
        icon: Activity,
        description: "Aprove ou rejeite abonos e ajustes de ponto enviados pela equipe.",
      },
    ],
  },
  {
    key: "contracts",
    title: "Contratos",
    subtitle: "Envio e acompanhamento de assinaturas",
    icon: FileSignature,
    tone: "from-[#7C3AED] to-[#A78BFA]",
    accent: "bg-[#EDE9FE] text-[#5B21B6]",
    routes: [
      {
        route: APP_ROUTE_META.contratosAdmin,
        icon: FileSignature,
        description: "Acompanhe contratos enviados, status de assinatura e envie novos termos.",
      },
    ],
  },
  {
    key: "audit",
    title: "Auditoria Fiscal",
    subtitle: "Arquivos legais e conformidade",
    icon: Scale,
    tone: "from-[#1E3A8A] to-[#0D9488]",
    accent: "bg-[#EFF6FF] text-[#1D4ED8]",
    routes: [
      {
        route: APP_ROUTE_META.auditoria,
        icon: Scale,
        description: "Gere AEJ, AFD e Atestado Técnico para fiscalização.",
      },
    ],
  },
  {
    key: "lgpd",
    title: "LGPD",
    subtitle: "Solicitações e inventário de dados",
    icon: FileText,
    tone: "from-[#7C3AED] to-[#A855F7]",
    accent: "bg-[#EDE9FE] text-[#5B21B6]",
    routes: [
      {
        route: APP_ROUTE_META.lgpdAdminRequests,
        icon: FileText,
        description: "Atenda solicitações de titulares (acesso, anonimização, portabilidade).",
      },
      {
        route: APP_ROUTE_META.lgpdAdminInventory,
        icon: FileText,
        description: "Gerencie o inventário de tratamento de dados pessoais.",
      },
    ],
  },
  {
    key: "ctoDemo",
    title: "Demo Sandbox",
    subtitle: "Ambiente controlado de demonstração",
    icon: FlaskConical,
    tone: "from-[#78350F] to-[#D97706]",
    accent: "bg-[#FEF3C7] text-[#92400E]",
    routes: [
      {
        route: APP_ROUTE_META.ctoDemoSandbox,
        icon: FlaskConical,
        description: "Crie ou remova o ambiente de demo com empresa, usuário e dados sintéticos.",
      },
    ],
  },
];

const Administracao = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleBack = useCallback(() => navigate(APP_PATHS.dashboard), [navigate]);

  const canAccessRoute = useCallback(
    (route: AppRouteMeta) => {
      if (!route.allowedRoles) return true;
      const current = role as AppRole | "";
      return Boolean(current) && route.allowedRoles.includes(current as AppRole);
    },
    [role]
  );

  const groups = useMemo(() => {
    return buildGroups()
      .map((group) => ({
        ...group,
        routes: group.routes.filter(({ route }) => canAccessRoute(route)),
      }))
      .filter((group) => group.routes.length > 0);
  }, [canAccessRoute]);

  const totalShortcuts = groups.reduce((sum, group) => sum + group.routes.length, 0);

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
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  Painel administrativo
                </Badge>
                <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                  Administração
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                  Atalhos para colaboradores, folha de ponto, férias, registros manuais, auditoria
                  fiscal e LGPD — agrupados pelo padrão usado no menu lateral.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                  {totalShortcuts} atalho(s) disponível(eis)
                </Badge>
                <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">
                  Acesso restrito · {role || "MANAGER"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {groups.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 px-5 py-12 text-center text-[#64748B]">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
              >
                <Shield className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-[#0F172A]">
                Nenhum recurso administrativo disponível
              </p>
              <p className="max-w-md text-xs leading-5">
                Sua role atual não tem permissão para acessar os atalhos administrativos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <Card key={group.key} className="overflow-hidden border-border/70 shadow-sm">
                  <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                          group.tone
                        )}
                      >
                        <GroupIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {group.subtitle}
                        </p>
                        <h2 className="truncate text-base font-semibold text-[#0F172A] sm:text-lg">
                          {group.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <CardContent className="space-y-2 px-4 py-4">
                    {group.routes.map(({ route, icon: RouteIcon, description }) => (
                      <button
                        key={route.path}
                        type="button"
                        onClick={() => navigate(route.path)}
                        className="group flex w-full items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-3 text-left shadow-sm transition hover:border-[#2563EB] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            group.accent
                          )}
                        >
                          <RouteIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#0F172A]">
                            {route.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-[#64748B]">
                            {description}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] group-hover:bg-[#EFF6FF] group-hover:text-[#1D4ED8]"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.USERS} className="mt-6" />
    </PageShell>
  );
};

export default Administracao;
