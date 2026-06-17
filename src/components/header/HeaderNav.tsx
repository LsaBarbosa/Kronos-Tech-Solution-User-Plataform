import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BellMinus,
  Building2,
  CalendarRange,
  ChevronDown,
  ClipboardCheck,
  Calculator,
  FilePlus,
  FileSignature,
  FileText,
  Folder,
  FolderOpen,
  Home,
  LayoutGrid,
  PlusCircle,
  Scale,
  Shield,
  TimerReset,
  TreePalm,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ADMIN_MENU_GROUPS,
  APP_PATHS,
  APP_ROUTE_META,
  type AppRole,
  type AppRouteMeta,
} from "@/config/app-routes";
import { cn } from "@/lib/utils";

interface HeaderNavProps {
  role: string | null | undefined;
  variant: "desktop" | "mobile";
}

type NavLeaf = {
  kind: "leaf";
  label: string;
  path: string;
  icon: LucideIcon;
  visible: boolean;
};

type NavGroup = {
  kind: "group";
  label: string;
  icon: LucideIcon;
  visible: boolean;
  sections: { title?: string; items: NavLeaf[] }[];
};

type NavEntry = NavLeaf | NavGroup;

const canAccessRoute = (role: string | null | undefined, route: AppRouteMeta): boolean => {
  if (!route.allowedRoles) return true;
  if (!role) return false;
  return route.allowedRoles.includes(role as AppRole);
};

const leaf = (
  label: string,
  path: string,
  icon: LucideIcon,
  visible = true
): NavLeaf => ({ kind: "leaf", label, path, icon, visible });

const buildEntries = (role: string | null | undefined): NavEntry[] => {
  const isCto = role === "CTO";

  const collaboratorItems = ADMIN_MENU_GROUPS.collaborators.filter((route) =>
    canAccessRoute(role, route)
  );
  const timesheetItems = ADMIN_MENU_GROUPS.timesheet.filter((route) =>
    canAccessRoute(role, route)
  );
  const vacationItems = ADMIN_MENU_GROUPS.vacation.filter((route) =>
    canAccessRoute(role, route)
  );
  const timeOffItems = ADMIN_MENU_GROUPS.timeOff.filter((route) =>
    canAccessRoute(role, route)
  );
  const auditItems = ADMIN_MENU_GROUPS.audit.filter((route) =>
    canAccessRoute(role, route)
  );
  const contractItems = ADMIN_MENU_GROUPS.contracts.filter((route) => canAccessRoute(role, route));
  const lgpdItems = ADMIN_MENU_GROUPS.lgpd.filter((route) => canAccessRoute(role, route));

  const adminSections: NavGroup["sections"] = [];

  if (collaboratorItems.length) {
    adminSections.push({
      title: "Colaboradores",
      items: [
        leaf(APP_ROUTE_META.listaColaboradores.label, APP_PATHS.listaColaboradores, UserCheck),
        leaf(APP_ROUTE_META.criarColaborador.label, APP_PATHS.criarColaborador, UserPlus),
      ].filter((entry) => collaboratorItems.some((meta) => meta.path === entry.path)),
    });
  }

  if (timesheetItems.length) {
    adminSections.push({
      title: "Folha de Ponto",
      items: [
        leaf(APP_ROUTE_META.apuracaoHoras.label, APP_PATHS.apuracaoHoras, Calculator),
        leaf(APP_ROUTE_META.statusDoRegistro.label, APP_PATHS.statusDoRegistro, ClipboardCheck),
      ].filter((entry) => timesheetItems.some((meta) => meta.path === entry.path)),
    });
  }

  if (vacationItems.length) {
    adminSections.push({
      title: "Férias",
      items: [leaf(APP_ROUTE_META.ferias.label, APP_PATHS.ferias, TreePalm)],
    });
  }

  if (timeOffItems.length) {
    adminSections.push({
      title: "Registro Manual",
      items: [leaf(APP_ROUTE_META.aprovacoesAbono.label, APP_PATHS.aprovacoesAbono, Activity)],
    });
  }

  if (contractItems.length) {
    adminSections.push({
      title: "Contratos",
      items: [leaf(APP_ROUTE_META.contratosAdmin.label, APP_PATHS.contratosAdmin, FileSignature)],
    });
  }

  if (auditItems.length) {
    adminSections.push({
      title: "Auditoria",
      items: [leaf(APP_ROUTE_META.auditoria.label, APP_PATHS.auditoria, Scale)],
    });
  }

  if (lgpdItems.length) {
    adminSections.push({
      title: "LGPD",
      items: [leaf(APP_ROUTE_META.lgpdAdminRequests.label, APP_PATHS.lgpdAdminRequests, FileText)],
    });
  }

  return [
    leaf("Início", APP_PATHS.dashboard, Home),
    leaf(APP_ROUTE_META.relatorioDetalhado.label, APP_PATHS.relatorioDetalhado, BarChart3),
    leaf(APP_ROUTE_META.espelhoPonto.label, APP_PATHS.espelhoPonto, CalendarRange),
    leaf(APP_ROUTE_META.assinaturaPonto.label, APP_PATHS.assinaturaPonto, FileSignature),
    leaf(APP_ROUTE_META.assinaturaContrato.label, APP_PATHS.assinaturaContrato, FileSignature),
    leaf(APP_ROUTE_META.avisos.label, APP_PATHS.avisos, BellMinus),
    {
      kind: "group" as const,
      label: "Solicitar",
      icon: PlusCircle,
      visible: true,
      sections: [
        {
          items: [
            leaf(APP_ROUTE_META.solicitarFerias.label, APP_PATHS.solicitarFerias, TreePalm),
            leaf(APP_ROUTE_META.solicitarAbono.label, APP_PATHS.solicitarAbono, TimerReset),
          ],
        },
      ],
    },
    {
      kind: "group" as const,
      label: "Documentos",
      icon: Folder,
      visible: true,
      sections: [
        {
          items: [
            leaf(APP_ROUTE_META.documentos.label, APP_PATHS.documentos, FolderOpen),
            leaf(
              APP_ROUTE_META.enviarDocumentoColaborador.label,
              APP_PATHS.enviarDocumentoColaborador,
              FilePlus
            ),
          ],
        },
      ],
    },
    leaf(APP_ROUTE_META.empresa.label, APP_PATHS.empresa, Building2, isCto),
    {
      kind: "group" as const,
      label: "Administrador",
      icon: Shield,
      visible: adminSections.length > 0,
      sections: adminSections,
    },
  ].filter((entry) => entry.visible);
};

const isActiveLeaf = (currentPath: string, leafPath: string) =>
  currentPath === leafPath || currentPath.startsWith(`${leafPath}/`);

const isActiveGroup = (currentPath: string, group: NavGroup) =>
  group.sections.some((section) =>
    section.items.some((item) => isActiveLeaf(currentPath, item.path))
  );

const HeaderNav = ({ role, variant }: HeaderNavProps) => {
  const entries = buildEntries(role);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (variant === "mobile") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-10 gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9]"
            aria-label="Abrir navegação principal"
          >
            <LayoutGrid className="h-4 w-4" />
            Menu
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[80vh] w-72 overflow-y-auto rounded-2xl border-border/70 p-1.5 shadow-xl"
        >
          {entries.map((entry, index) => {
            if (entry.kind === "leaf") {
              const Icon = entry.icon;
              const active = isActiveLeaf(pathname, entry.path);
              return (
                <DropdownMenuItem
                  key={entry.path}
                  onSelect={() => navigate(entry.path)}
                  className={cn(
                    "gap-2 px-3 py-2 text-sm",
                    active && "bg-[#EFF6FF] text-[#1D4ED8] focus:bg-[#EFF6FF] focus:text-[#1D4ED8]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {entry.label}
                </DropdownMenuItem>
              );
            }

            const GroupIcon = entry.icon;
            return (
              <div key={`group-${entry.label}`}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuLabel className="flex items-center gap-2 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  <GroupIcon className="h-3.5 w-3.5" />
                  {entry.label}
                </DropdownMenuLabel>
                {entry.sections.map((section) => (
                  <div key={`${entry.label}-${section.title ?? "items"}`}>
                    {section.title ? (
                      <p className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
                        {section.title}
                      </p>
                    ) : null}
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActiveLeaf(pathname, item.path);
                      return (
                        <DropdownMenuItem
                          key={item.path}
                          onSelect={() => navigate(item.path)}
                          className={cn(
                            "gap-2 px-3 py-2 text-sm",
                            active &&
                              "bg-[#EFF6FF] text-[#1D4ED8] focus:bg-[#EFF6FF] focus:text-[#1D4ED8]"
                          )}
                        >
                          <ItemIcon className="h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Navegação principal">
      {entries.map((entry) => {
        if (entry.kind === "leaf") {
          const Icon = entry.icon;
          const active = isActiveLeaf(pathname, entry.path);
          return (
            <Button
              key={entry.path}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 gap-1.5 rounded-full px-3 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
                active && "bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] hover:text-[#1D4ED8]"
              )}
            >
              <Link to={entry.path}>
                <Icon className="h-3.5 w-3.5" />
                {entry.label}
              </Link>
            </Button>
          );
        }

        const GroupIcon = entry.icon;
        const active = isActiveGroup(pathname, entry);
        return (
          <DropdownMenu key={`group-${entry.label}`}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 gap-1.5 rounded-full px-3 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
                  active && "bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] hover:text-[#1D4ED8]"
                )}
              >
                <GroupIcon className="h-3.5 w-3.5" />
                {entry.label}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 rounded-2xl border-border/70 p-1.5 shadow-xl"
            >
              {entry.sections.map((section, sectionIndex) => (
                <div key={`${entry.label}-${section.title ?? sectionIndex}`}>
                  {sectionIndex > 0 ? <DropdownMenuSeparator /> : null}
                  {section.title ? (
                    <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                      {section.title}
                    </DropdownMenuLabel>
                  ) : null}
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActiveLeaf(pathname, item.path);
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onSelect={() => navigate(item.path)}
                        className={cn(
                          "gap-2 px-3 py-2 text-sm",
                          active &&
                            "bg-[#EFF6FF] text-[#1D4ED8] focus:bg-[#EFF6FF] focus:text-[#1D4ED8]"
                        )}
                      >
                        <ItemIcon className="h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );
};

export default HeaderNav;
