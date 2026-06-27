export type AppRole = "CTO" | "MANAGER" | "PARTNER";

export type AppBreadcrumb = {
  label: string;
  path?: string;
};

export type AppRouteMeta = {
  path: string;
  label: string;
  allowedRoles?: readonly AppRole[];
  showInMenu: boolean;
  breadcrumbs: AppBreadcrumb[];
};

const defineRoute = (
  path: string,
  label: string,
  options: {
    allowedRoles?: readonly AppRole[];
    showInMenu?: boolean;
    breadcrumbs?: AppBreadcrumb[];
  } = {}
): AppRouteMeta => ({
  path,
  label,
  allowedRoles: options.allowedRoles,
  showInMenu: options.showInMenu ?? true,
  breadcrumbs: options.breadcrumbs ?? [{ label, path }],
});

export const APP_PATHS = {
  root: "/",
  login: "/login",
  selecionarEmpresa: "/selecionar-empresa",
  senhaPrimeiroAcesso: "/senha-primeiro-acesso",
  resetarSenha: "/resetar-senha",
  dashboard: "/dashboard",
  relatorioDetalhado: "/relatorio-detalhado",
  espelhoPonto: "/espelho-ponto",
  assinaturaPonto: "/assinatura-ponto",
  assinaturaContrato: "/assinatura-contrato",
  contratosAdmin: "/contratos/admin",
  contratosEnviar: "/contratos/enviar",
  usuario: "/usuario",
  empresa: "/empresa",
  empresaCriar: "/empresa/criar",
  empresaBuscar: "/empresa/buscar",
  empresaAtualizar: "/empresa/atualizar",
  empresaMultiAcesso: "/empresa/multi-acesso",
  documentos: "/documentos",
  enviarDocumentos: "/enviar-documentos",
  enviarDocumentoColaborador: "/enviar-documento-colaborador",
  avisos: "/avisos",
  criarAviso: "/criar-aviso",
  solicitarFerias: "/solicitar-ferias",
  solicitarAbono: "/solicitar-abono",
  auditoria: "/auditoria",
  criarColaborador: "/criar-colaborador",
  criarAdministrador: "/criar-administrador",
  listaColaboradores: "/lista-colaboradores",
  apuracaoHoras: "/apuracao-horas",
  statusDoRegistro: "/status-do-registro",
  ferias: "/ferias",
  aprovacoesAbono: "/aprovacoes-abono",
  meusDocumentos: "/meus-documentos",
  administracao: "/administracao",
  privacidade: "/privacidade",
  privacyProcessingCatalog: "/privacy/processing-catalog",
  privacyPolicy: "/privacy/policy",
  privacyBiometricTerm: "/privacy/biometric-term",
  lgpdAdminRequests: "/lgpd/admin/requests",
  lgpdAdminRequestDetails: "/lgpd/admin/requests/:requestId",
  lgpdAdminInventory: "/lgpd/admin/inventory",
  lgpdAdminInventoryForm: "/lgpd/admin/inventory/novo",
  lgpdAdminInventoryEdit: "/lgpd/admin/inventory/:processCode/editar",
  ctoDemoSandbox: "/empresa/cto/demo",
} as const;

export const APP_ROUTE_META = {
  root: defineRoute(APP_PATHS.root, "Início", {
    showInMenu: false,
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }],
  }),
  login: defineRoute(APP_PATHS.login, "Login", { showInMenu: false }),
  senhaPrimeiroAcesso: defineRoute(APP_PATHS.senhaPrimeiroAcesso, "Primeiro Acesso", { showInMenu: false }),
  resetarSenha: defineRoute(APP_PATHS.resetarSenha, "Redefinir Senha", { showInMenu: false }),
  dashboard: defineRoute(APP_PATHS.dashboard, "Início", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }],
  }),
  relatorioDetalhado: defineRoute(APP_PATHS.relatorioDetalhado, "Relatório de Horas", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Relatório de Horas", path: APP_PATHS.relatorioDetalhado }],
  }),
  espelhoPonto: defineRoute(APP_PATHS.espelhoPonto, "Espelho de Ponto", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Espelho de Ponto", path: APP_PATHS.espelhoPonto }],
  }),
  assinaturaPonto: defineRoute(APP_PATHS.assinaturaPonto, "Assinatura do Ponto", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Assinatura do Ponto", path: APP_PATHS.assinaturaPonto }],
  }),
  assinaturaContrato: defineRoute(APP_PATHS.assinaturaContrato, "Assinatura de Contratos", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Assinatura de Contratos", path: APP_PATHS.assinaturaContrato }],
  }),
  contratosAdmin: defineRoute(APP_PATHS.contratosAdmin, "Contratos", {
    allowedRoles: ["MANAGER", "CTO"],
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Contratos", path: APP_PATHS.contratosAdmin }],
  }),
  contratosEnviar: defineRoute(APP_PATHS.contratosEnviar, "Enviar Contrato", {
    allowedRoles: ["MANAGER", "CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Contratos", path: APP_PATHS.contratosAdmin },
      { label: "Enviar Contrato", path: APP_PATHS.contratosEnviar },
    ],
  }),
  usuario: defineRoute(APP_PATHS.usuario, "Usuário", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Usuário", path: APP_PATHS.usuario }],
  }),
  empresa: defineRoute(APP_PATHS.empresa, "Empresa", {
    allowedRoles: ["CTO"],
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Empresa", path: APP_PATHS.empresa }],
  }),
  empresaCriar: defineRoute(APP_PATHS.empresaCriar, "Criar Empresa", {
    allowedRoles: ["CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Empresa", path: APP_PATHS.empresa },
      { label: "Criar Empresa", path: APP_PATHS.empresaCriar },
    ],
  }),
  empresaBuscar: defineRoute(APP_PATHS.empresaBuscar, "Buscar Empresa", {
    allowedRoles: ["CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Empresa", path: APP_PATHS.empresa },
      { label: "Buscar Empresa", path: APP_PATHS.empresaBuscar },
    ],
  }),
  empresaAtualizar: defineRoute(APP_PATHS.empresaAtualizar, "Atualizar Empresa", {
    allowedRoles: ["CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Empresa", path: APP_PATHS.empresa },
      { label: "Atualizar Empresa", path: APP_PATHS.empresaAtualizar },
    ],
  }),
  empresaMultiAcesso: defineRoute(APP_PATHS.empresaMultiAcesso, "Acesso Multiempresa", {
    allowedRoles: ["CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Empresa", path: APP_PATHS.empresa },
      { label: "Acesso Multiempresa", path: APP_PATHS.empresaMultiAcesso },
    ],
  }),
  documentos: defineRoute(APP_PATHS.documentos, "Buscar Documentos", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Documentos", path: APP_PATHS.documentos }],
  }),
  enviarDocumentos: defineRoute(APP_PATHS.enviarDocumentos, "Enviar Documentos", {
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Documentos", path: APP_PATHS.documentos },
      { label: "Enviar Documentos", path: APP_PATHS.enviarDocumentos },
    ],
  }),
  enviarDocumentoColaborador: defineRoute(APP_PATHS.enviarDocumentoColaborador, "Enviar Documento do Colaborador", {
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Documentos", path: APP_PATHS.documentos },
      { label: "Enviar Documento do Colaborador", path: APP_PATHS.enviarDocumentoColaborador },
    ],
  }),
  avisos: defineRoute(APP_PATHS.avisos, "Mural de Avisos", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Avisos", path: APP_PATHS.avisos }],
  }),
  criarAviso: defineRoute(APP_PATHS.criarAviso, "Criar Aviso", {
    allowedRoles: ["MANAGER", "CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Avisos", path: APP_PATHS.avisos },
      { label: "Criar Aviso", path: APP_PATHS.criarAviso },
    ],
  }),
  solicitarFerias: defineRoute(APP_PATHS.solicitarFerias, "Solicitar Férias", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Solicitar Férias", path: APP_PATHS.solicitarFerias }],
  }),
  solicitarAbono: defineRoute(APP_PATHS.solicitarAbono, "Solicitar Abono", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Solicitar Abono", path: APP_PATHS.solicitarAbono }],
  }),
  auditoria: defineRoute(APP_PATHS.auditoria, "Auditoria Fiscal", {
    allowedRoles: ["MANAGER", "CTO"],
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Auditoria Fiscal", path: APP_PATHS.auditoria }],
  }),
  criarColaborador: defineRoute(APP_PATHS.criarColaborador, "Criar Colaborador", {
    allowedRoles: ["MANAGER", "CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Colaboradores", path: APP_PATHS.listaColaboradores },
      { label: "Criar Colaborador", path: APP_PATHS.criarColaborador },
    ],
  }),
  criarAdministrador: defineRoute(APP_PATHS.criarAdministrador, "Criar Administrador", {
    allowedRoles: ["CTO", "MANAGER"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Empresa", path: APP_PATHS.empresa },
      { label: "Criar Administrador", path: APP_PATHS.criarAdministrador },
    ],
  }),
  listaColaboradores: defineRoute(APP_PATHS.listaColaboradores, "Lista de Colaboradores", {
    allowedRoles: ["MANAGER"],
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Colaboradores", path: APP_PATHS.listaColaboradores },
    ],
  }),
  apuracaoHoras: defineRoute(APP_PATHS.apuracaoHoras, "Apuração de Horas", {
    allowedRoles: ["MANAGER"],
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Apuração de Horas", path: APP_PATHS.apuracaoHoras },
    ],
  }),
  statusDoRegistro: defineRoute(APP_PATHS.statusDoRegistro, "Status do Registro", {
    allowedRoles: ["MANAGER"],
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Status do Registro", path: APP_PATHS.statusDoRegistro },
    ],
  }),
  ferias: defineRoute(APP_PATHS.ferias, "Aprovação de Férias", {
    allowedRoles: ["MANAGER"],
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Aprovação de Férias", path: APP_PATHS.ferias }],
  }),
  aprovacoesAbono: defineRoute(APP_PATHS.aprovacoesAbono, "Gestão de Horas Manuais", {
    allowedRoles: ["MANAGER"],
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Gestão de Horas Manuais", path: APP_PATHS.aprovacoesAbono },
    ],
  }),
  meusDocumentos: defineRoute(APP_PATHS.meusDocumentos, "Meus Documentos", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Meus Documentos", path: APP_PATHS.meusDocumentos }],
  }),
  administracao: defineRoute(APP_PATHS.administracao, "Administração", {
    allowedRoles: ["CTO", "MANAGER"],
    showInMenu: false,
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Administração", path: APP_PATHS.administracao }],
  }),
  privacidade: defineRoute(APP_PATHS.privacidade, "Privacidade e Dados", {
    breadcrumbs: [{ label: "Início", path: APP_PATHS.dashboard }, { label: "Privacidade e Dados", path: APP_PATHS.privacidade }],
  }),
  lgpdAdminRequests: defineRoute(APP_PATHS.lgpdAdminRequests, "Solicitações LGPD", {
    allowedRoles: ["CTO", "MANAGER"],
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Solicitações LGPD", path: APP_PATHS.lgpdAdminRequests },
    ],
  }),
  lgpdAdminRequestDetails: defineRoute(APP_PATHS.lgpdAdminRequestDetails, "Detalhes da Solicitação", {
    allowedRoles: ["CTO", "MANAGER"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Solicitações LGPD", path: APP_PATHS.lgpdAdminRequests },
      { label: "Detalhes da Solicitação", path: APP_PATHS.lgpdAdminRequestDetails },
    ],
  }),
  lgpdAdminInventory: defineRoute(APP_PATHS.lgpdAdminInventory, "Inventário de Tratamento", {
    allowedRoles: ["CTO"],
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Inventário de Tratamento", path: APP_PATHS.lgpdAdminInventory },
    ],
  }),
  lgpdAdminInventoryForm: defineRoute(APP_PATHS.lgpdAdminInventoryForm, "Novo Processo", {
    allowedRoles: ["CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Inventário de Tratamento", path: APP_PATHS.lgpdAdminInventory },
      { label: "Novo Processo", path: APP_PATHS.lgpdAdminInventoryForm },
    ],
  }),
  lgpdAdminInventoryEdit: defineRoute(APP_PATHS.lgpdAdminInventoryEdit, "Editar Processo", {
    allowedRoles: ["CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Inventário de Tratamento", path: APP_PATHS.lgpdAdminInventory },
      { label: "Editar Processo", path: APP_PATHS.lgpdAdminInventoryEdit },
    ],
  }),
  ctoDemoSandbox: defineRoute(APP_PATHS.ctoDemoSandbox, "Demo Sandbox", {
    allowedRoles: ["CTO"],
    showInMenu: false,
    breadcrumbs: [
      { label: "Início", path: APP_PATHS.dashboard },
      { label: "Empresa", path: APP_PATHS.empresa },
      { label: "Demo Sandbox", path: APP_PATHS.ctoDemoSandbox },
    ],
  }),
  privacyProcessingCatalog: defineRoute(APP_PATHS.privacyProcessingCatalog, "Catálogo de Tratamento de Dados", {
    showInMenu: false,
    breadcrumbs: [{ label: "Catálogo de Tratamento de Dados", path: APP_PATHS.privacyProcessingCatalog }],
  }),
  privacyPolicy: defineRoute(APP_PATHS.privacyPolicy, "Política de Privacidade", {
    showInMenu: false,
    breadcrumbs: [{ label: "Política de Privacidade", path: APP_PATHS.privacyPolicy }],
  }),
  privacyBiometricTerm: defineRoute(APP_PATHS.privacyBiometricTerm, "Termo de Biometria Facial", {
    showInMenu: false,
    breadcrumbs: [{ label: "Termo de Biometria Facial", path: APP_PATHS.privacyBiometricTerm }],
  }),
} as const;

export const ADMIN_MENU_GROUPS = {
  collaborators: [APP_ROUTE_META.listaColaboradores, APP_ROUTE_META.criarColaborador],
  timesheet: [APP_ROUTE_META.apuracaoHoras, APP_ROUTE_META.statusDoRegistro],
  vacation: [APP_ROUTE_META.ferias],
  timeOff: [APP_ROUTE_META.aprovacoesAbono],
  contracts: [APP_ROUTE_META.contratosAdmin],
  audit: [APP_ROUTE_META.auditoria],
  lgpd: [APP_ROUTE_META.lgpdAdminRequests, APP_ROUTE_META.lgpdAdminInventory],
} as const;
