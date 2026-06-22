import type { LandingModule, LandingSection } from "@/types/landing";

export const LANDING_NAV: LandingSection[] = [
  { id: "funcionalidades", label: "Funcionalidades" },
  { id: "jornada", label: "Jornada e Ponto" },
  { id: "pessoas", label: "Pessoas" },
  { id: "assinatura", label: "Assinatura" },
  { id: "lgpd", label: "LGPD e Privacidade" },
  { id: "seguranca", label: "Segurança" },
  { id: "contato", label: "Demonstração" },
];

export const LANDING_MODULES: LandingModule[] = [
  {
    id: "ponto",
    title: "Ponto Eletrônico",
    description:
      "Registre, controle e audite jornadas com rastreabilidade completa. Suporte a ponto facial, manual e ajustes com evidência documentada.",
    icon: "Clock",
    color: "blue",
    features: ["Registro facial e manual", "Espelho de ponto", "Ajustes com aprovação", "AFD e AEJ"],
    backTitle: "Como funciona o Ponto Eletrônico",
    backDescription:
      "Do registro até o arquivo legal, cada marcação é rastreável e auditável. A plataforma organiza toda a jornada de trabalho em um único ambiente.",
    backDetails: [
      { label: "Tipos de marcação", value: "Facial, manual e geolocalização" },
      { label: "Rastreabilidade", value: "IP, horário, dispositivo e usuário" },
      { label: "Correções", value: "Fluxo de aprovação com evidência registrada" },
      { label: "Arquivos legais", value: "AFD e AEJ gerados automaticamente" },
      { label: "Relatórios", value: "Espelho individual e apuração gerencial" },
    ],
    backStats: [
      { value: "3", label: "tipos de marcação" },
      { value: "100%", label: "auditável" },
      { value: "AFD/AEJ", label: "automáticos" },
    ],
  },
  {
    id: "colaboradores",
    title: "Colaboradores e Usuários",
    description:
      "Gerencie cadastros, perfis de acesso, empresas e hierarquias operacionais. Controle por papel e rastreabilidade de ações.",
    icon: "Users",
    color: "blue",
    features: ["Cadastro e edição", "Perfis PARTNER, MANAGER e CTO", "Gestão por empresa", "Biometria facial"],
    backTitle: "Gestão completa de pessoas",
    backDescription:
      "Três níveis de acesso com permissões distintas. Cada colaborador, gestor e administrador vê apenas o que é autorizado.",
    backDetails: [
      { label: "PARTNER", value: "Colaborador: ponto, docs e privacidade próprios" },
      { label: "MANAGER", value: "Gestor: equipe, aprovações e avisos do tenant" },
      { label: "CTO", value: "Admin global: empresas, inventário e LGPD" },
      { label: "Biometria", value: "Cadastro facial com consentimento LGPD" },
      { label: "Auditoria", value: "Ações rastreadas por usuário e data" },
    ],
    backStats: [
      { value: "3", label: "perfis de acesso" },
      { value: "Multi", label: "empresa/tenant" },
      { value: "100%", label: "rastreável" },
    ],
  },
  {
    id: "documentos",
    title: "Documentos",
    description:
      "Centralize upload, download e organização de documentos por colaborador. Evidências rastreáveis e acesso controlado por perfil.",
    icon: "FileText",
    color: "cyan",
    features: ["Upload e download seguro", "Organização por colaborador", "Controle de acesso por perfil", "Histórico de operações"],
    backTitle: "Centro de documentos operacional",
    backDescription:
      "Cada documento é associado ao colaborador correto, com controle de quem acessou, quando e qual operação realizou.",
    backDetails: [
      { label: "Upload", value: "Envio seguro com categoria e colaborador" },
      { label: "Acesso", value: "Controlado por perfil: cada um vê os seus" },
      { label: "Download", value: "Rastreado com registro de quem baixou" },
      { label: "Organização", value: "Por colaborador, tipo e data" },
      { label: "Histórico", value: "Todas as operações registradas e auditáveis" },
    ],
    backStats: [
      { value: "100%", label: "acesso controlado" },
      { value: "Multi", label: "tipos de doc" },
      { value: "Log", label: "por operação" },
    ],
  },
  {
    id: "aprovacoes",
    title: "Aprovações e Solicitações",
    description:
      "Fluxo estruturado para férias, abonos e ajustes manuais de ponto. Gestores aprovam ou rejeitam com rastreabilidade e notificação.",
    icon: "CheckSquare",
    color: "green",
    features: ["Solicitação de férias", "Abonos e ajustes de ponto", "Aprovação por gestor", "Mural de avisos"],
    backTitle: "Fluxo de aprovações rastreável",
    backDescription:
      "Cada solicitação percorre um fluxo documentado: envio → análise → decisão. Histórico completo para auditoria trabalhista.",
    backDetails: [
      { label: "Férias", value: "Solicitação com período e justificativa" },
      { label: "Abono", value: "Justificativa com evidência documental" },
      { label: "Ajuste de ponto", value: "Registro manual com aprovação obrigatória" },
      { label: "Esquecimento", value: "Solicitação de marcação esquecida com gestão" },
      { label: "Avisos internos", value: "Mural de comunicados por empresa" },
    ],
    backStats: [
      { value: "4", label: "tipos de solicitação" },
      { value: "100%", label: "com histórico" },
      { value: "Gestor", label: "aprova/rejeita" },
    ],
  },
  {
    id: "legal",
    title: "Legal e Fiscal",
    description:
      "Gere arquivos legais exigidos pela legislação trabalhista. AFD, AEJ, espelho de ponto e atestado técnico prontos para auditoria.",
    icon: "Scale",
    color: "amber",
    features: ["AFD — Arquivo Fonte de Dados", "AEJ — Arquivo Eletrônico de Jornada", "Espelho de ponto", "Atestado técnico"],
    backTitle: "Arquivos legais e quando usar",
    backDescription:
      "Documentos gerados automaticamente pela plataforma, organizados para entrega a órgãos fiscalizadores ou uso em auditorias trabalhistas.",
    backDetails: [
      { label: "AFD", value: "Para MTE — registros de ponto em formato padrão" },
      { label: "AEJ", value: "Para portaria SRTE — jornada eletrônica" },
      { label: "Espelho de ponto", value: "Relatório individual por período, com assinatura" },
      { label: "Atestado técnico", value: "Comprovação do sistema de controle de ponto" },
      { label: "Apuração de horas", value: "Relatório gerencial de horas por colaborador" },
    ],
    backStats: [
      { value: "4", label: "documentos legais" },
      { value: "MTE", label: "conforme portaria" },
      { value: "Export", label: "pronto para entrega" },
    ],
  },
  {
    id: "lgpd",
    title: "LGPD e Privacidade",
    description:
      "Centro de privacidade com solicitações do titular, exportação, anonimização, consentimento, inventário de tratamento e retenção.",
    icon: "Shield",
    color: "green",
    features: ["Solicitações do titular", "Exportação e anonimização", "Inventário de tratamento", "Consentimento e retenção"],
    backTitle: "Centro de privacidade integrado",
    backDescription:
      "O colaborador exerce seus direitos diretamente pela plataforma. Administradores mantêm o inventário e respondem às solicitações com rastreabilidade.",
    backDetails: [
      { label: "Direitos do titular", value: "Acesso, retificação, portabilidade e exclusão" },
      { label: "Exportação", value: "Dados pessoais exportáveis sob solicitação" },
      { label: "Anonimização", value: "Remoção de dados pessoais com histórico" },
      { label: "Inventário", value: "Processos de tratamento mapeados e auditáveis" },
      { label: "Consentimento", value: "Biométrico com aceite e revogação pelo colaborador" },
    ],
    backStats: [
      { value: "5", label: "direitos do titular" },
      { value: "LGPD", label: "Lei 13.709/2018" },
      { value: "100%", label: "auditável" },
    ],
  },
  {
    id: "assinatura",
    title: "Assinatura de Documentos",
    description:
      "Assine eletronicamente espelhos de ponto, contratos e documentos trabalhistas diretamente na plataforma. Evidência legal com rastreabilidade completa de quem, quando e o que foi assinado.",
    icon: "PenLine",
    color: "purple",
    features: ["Assinatura de espelho de ponto", "Assinatura de contratos", "Hash e timestamp registrados", "Rastreabilidade completa"],
    highlight: true,
    backTitle: "Como funciona a assinatura eletrônica",
    backDescription:
      "Documentos são enviados ao colaborador, que assina diretamente pela plataforma. Cada assinatura gera evidência com hash, data/hora e identificação do signatário.",
    backDetails: [
      { label: "Espelho de ponto", value: "Assinado eletronicamente pelo colaborador ao fechar o período" },
      { label: "Contratos de trabalho", value: "Envio e coleta de assinatura com fluxo documentado" },
      { label: "Evidência legal", value: "Hash do documento, timestamp e ID do signatário registrados" },
      { label: "Fluxo", value: "Envio → Notificação → Assinatura → Arquivamento" },
      { label: "Histórico", value: "Quem, quando, qual documento e qual versão foi assinada" },
    ],
    backStats: [
      { value: "Hash", label: "por documento" },
      { value: "100%", label: "rastreável" },
      { value: "Legal", label: "evidência válida" },
    ],
  },
];

export const HERO_STATS = [
  { label: "Módulos integrados", value: "7+" },
  { label: "Perfis de acesso", value: "3" },
  { label: "Conformidade LGPD", value: "Sim" },
  { label: "Assinatura eletrônica", value: "Sim" },
];
