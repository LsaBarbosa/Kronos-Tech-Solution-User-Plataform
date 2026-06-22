import type { LandingModule, LandingSection } from "@/types/landing";

export const LANDING_NAV: LandingSection[] = [
  { id: "funcionalidades", label: "Funcionalidades" },
  { id: "jornada", label: "Jornada e Ponto" },
  { id: "pessoas", label: "Pessoas" },
  { id: "lgpd", label: "LGPD e Privacidade" },
  { id: "seguranca", label: "Segurança" },
  { id: "contato", label: "Demonstração" },
];

export const LANDING_MODULES: LandingModule[] = [
  {
    id: "ponto",
    title: "Ponto Eletrônico",
    description:
      "Registre, controle e audite jornadas de trabalho com rastreabilidade completa. Suporte a ponto facial, manual e ajustes com evidência documentada.",
    icon: "Clock",
    color: "blue",
    features: [
      "Registro facial e manual",
      "Espelho de ponto",
      "Ajustes com aprovação",
      "Relatório AFD e AEJ",
    ],
  },
  {
    id: "colaboradores",
    title: "Colaboradores e Usuários",
    description:
      "Gerencie cadastros, perfis de acesso, empresas e hierarquias operacionais em um único painel. Controle por papel e rastreabilidade de ações.",
    icon: "Users",
    color: "blue",
    features: [
      "Cadastro e edição",
      "Perfis PARTNER, MANAGER e CTO",
      "Gestão por empresa",
      "Biometria facial",
    ],
  },
  {
    id: "documentos",
    title: "Documentos",
    description:
      "Centralize upload, download e organização de documentos por colaborador. Reduz retrabalho operacional e organiza evidências de forma rastreável.",
    icon: "FileText",
    color: "cyan",
    features: [
      "Upload e download seguro",
      "Organização por colaborador",
      "Controle de acesso por perfil",
      "Histórico de operações",
    ],
  },
  {
    id: "aprovacoes",
    title: "Aprovações e Solicitações",
    description:
      "Fluxo estruturado para férias, abonos e ajustes manuais de ponto. Gestores aprovam ou rejeitam com rastreabilidade e notificação.",
    icon: "CheckSquare",
    color: "green",
    features: [
      "Solicitação de férias",
      "Abonos e ajustes",
      "Aprovação por gestor",
      "Mural de avisos internos",
    ],
  },
  {
    id: "legal",
    title: "Legal e Fiscal",
    description:
      "Gere arquivos legais exigidos pela legislação trabalhista. AFD, AEJ, espelho de ponto e atestado técnico organizados e prontos para auditoria.",
    icon: "Scale",
    color: "amber",
    features: [
      "AFD (Arquivo Fonte de Dados)",
      "AEJ (Arquivo Eletrônico de Jornada)",
      "Espelho de ponto",
      "Atestado técnico",
    ],
  },
  {
    id: "lgpd",
    title: "LGPD e Privacidade",
    description:
      "Centro de privacidade com solicitações do titular, exportação, anonimização, consentimento, inventário de tratamento e retenção de dados.",
    icon: "Shield",
    color: "green",
    features: [
      "Solicitações do titular",
      "Exportação e anonimização",
      "Inventário de tratamento",
      "Consentimento e retenção",
    ],
  },
];

export const HERO_STATS = [
  { label: "Módulos integrados", value: "6+" },
  { label: "Perfis de acesso", value: "3" },
  { label: "Conformidade LGPD", value: "Sim" },
  { label: "Suporte a biometria", value: "Sim" },
];
