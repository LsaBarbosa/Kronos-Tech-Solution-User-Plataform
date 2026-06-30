import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/context/AuthContext";
import { CheckinProvider } from "@/context/CheckinContext";
import { CheckinModal } from "@/components/checkin/CheckinModal";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import SandboxBanner from "@/components/SandboxBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { APP_PATHS, APP_ROUTE_META } from "@/config/app-routes";

const TokenRedirect = lazy(() => import("./pages/TokenRedirect"));
const Login = lazy(() => import("./pages/Login"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Empresa = lazy(() => import("./pages/Empresa"));
const CriarEmpresa = lazy(() => import("./pages/CriarEmpresa"));
const BuscarEmpresa = lazy(() => import("./pages/BuscarEmpresa"));
const AtualizarEmpresa = lazy(() => import("./pages/AtualizarEmpresa"));
const EmpresaMultiAcesso = lazy(() => import("./pages/EmpresaMultiAcesso"));
const RelatorioDetalhado = lazy(() => import("./pages/RelatorioDetalhado"));
const EspelhoPonto = lazy(() => import("./pages/EspelhoPonto"));
const AssinaturaPonto = lazy(() => import("./pages/AssinaturaPonto"));
const AssinaturaContrato = lazy(() => import("./pages/AssinaturaContrato"));
const ContratosAdmin = lazy(() => import("./pages/ContratosAdmin"));
const EnviarContrato = lazy(() => import("./pages/EnviarContrato"));
const AuditoriaFiscal = lazy(() => import("./pages/AuditoriaFiscal"));
const Documentos = lazy(() => import("./pages/Documentos"));
const EnviarDocumentos = lazy(() => import("./pages/EnviarDocumentos"));
const DocumentoColaborador = lazy(() => import("./pages/DocumentoColaborador"));
const Usuario = lazy(() => import("./pages/Usuario"));
const CriarColaborador = lazy(() => import("./pages/CriarColaborador"));
const CriarManager = lazy(() => import("./pages/CriarManager"));
const ListaColaboradores = lazy(() => import("./pages/ListaColaboradores"));
const PendingApprovals = lazy(() => import("./pages/PendingApprovals"));
const StatusRegistro = lazy(() => import("./pages/StatusRegistro"));
const Avisos = lazy(() => import("./pages/Avisos"));
const CriarAviso = lazy(() => import("./pages/CriarAviso"));
const VacationApprovals = lazy(() => import("./pages/VacationApprovals"));
const RequestVacation = lazy(() => import("./pages/RequestVacation"));
const ManualRegisterApprovals = lazy(() => import("./pages/ManualRegisterApprovals"));
const RequestManualRegistration = lazy(() =>
  import("./pages/RequestManualRegistration").then((module) => ({
    default: module.RequestManualRegistration,
  }))
);
const PrivacyCenter = lazy(() => import("./pages/PrivacyCenter"));
const Administracao = lazy(() => import("./pages/Administracao"));
const AdminLgpdRequests = lazy(() =>
  import("./components/privacy/AdminLgpdRequests").then((module) => ({
    default: module.AdminLgpdRequests,
  }))
);
const AdminLgpdRequestDetails = lazy(() =>
  import("./components/privacy/AdminLgpdRequestDetails").then((module) => ({
    default: module.AdminLgpdRequestDetails,
  }))
);
const AdminInventory = lazy(() =>
  import("./components/privacy/AdminInventory").then((module) => ({
    default: module.AdminInventory,
  }))
);
const InventoryForm = lazy(() =>
  import("./components/privacy/InventoryForm").then((module) => ({
    default: module.InventoryForm,
  }))
);
const PrivacyProcessingCatalog = lazy(() => import("./pages/PrivacyProcessingCatalog"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PrivacyBiometricTerm = lazy(() => import("./pages/PrivacyBiometricTerm"));
const SelecionarEmpresa = lazy(() => import("./pages/SelecionarEmpresa"));
const CTODemoSandbox = lazy(() => import("./pages/CTODemoSandbox"));
const TerminalFlagManager = lazy(() => import("./pages/TerminalFlagManager"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
    Carregando...
  </div>
);

const queryClient = new QueryClient();

const renderProtectedRoleRoute = ({
  routeKey,
  element,
}: {
  routeKey: keyof typeof APP_ROUTE_META;
  element: JSX.Element;
}) => (
  <Route element={<RoleRoute allowedRoles={APP_ROUTE_META[routeKey].allowedRoles ?? []} />}>
    <Route path={APP_ROUTE_META[routeKey].path} element={element} />
  </Route>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <CheckinProvider>
            <TooltipProvider>
              <Toaster />
              <SandboxBanner />
              <CheckinModal />
              <AppErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path={APP_PATHS.root} element={<TokenRedirect />} />
                  <Route path={APP_PATHS.login} element={<Login />} />
                  <Route path={APP_PATHS.senhaPrimeiroAcesso} element={<EsqueciSenha />} />
                  <Route path={APP_PATHS.resetarSenha} element={<ResetPassword />} />
                  <Route path={APP_PATHS.privacyProcessingCatalog} element={<PrivacyProcessingCatalog />} />
                  <Route path={APP_PATHS.privacyPolicy} element={<PrivacyPolicy />} />
                  <Route path={APP_PATHS.privacyBiometricTerm} element={<PrivacyBiometricTerm />} />
                  <Route path="/aviso" element={<Navigate to={APP_PATHS.avisos} replace />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path={APP_PATHS.selecionarEmpresa} element={<SelecionarEmpresa />} />
                    <Route path={APP_PATHS.dashboard} element={<Dashboard />} />
                    <Route path={APP_PATHS.relatorioDetalhado} element={<RelatorioDetalhado />} />
                    <Route path={APP_PATHS.espelhoPonto} element={<EspelhoPonto />} />
                    <Route path={APP_PATHS.assinaturaPonto} element={<AssinaturaPonto />} />
                    <Route path={APP_PATHS.assinaturaContrato} element={<AssinaturaContrato />} />
                    <Route path={APP_PATHS.documentos} element={<Documentos />} />
                    <Route path={APP_PATHS.meusDocumentos} element={<Documentos />} />
                    <Route path={APP_PATHS.enviarDocumentos} element={<EnviarDocumentos />} />
                    <Route path={APP_PATHS.enviarDocumentoColaborador} element={<DocumentoColaborador />} />
                    <Route path={APP_PATHS.usuario} element={<Usuario />} />
                    <Route path={APP_PATHS.avisos} element={<Avisos />} />
                    <Route path={APP_PATHS.solicitarFerias} element={<RequestVacation />} />
                    <Route path={APP_PATHS.solicitarAbono} element={<RequestManualRegistration />} />
                    <Route path={APP_PATHS.privacidade} element={<PrivacyCenter />} />

                    {renderProtectedRoleRoute({ routeKey: "criarAviso", element: <CriarAviso /> })}
                    {renderProtectedRoleRoute({ routeKey: "empresa", element: <Empresa /> })}
                    {renderProtectedRoleRoute({ routeKey: "empresaCriar", element: <CriarEmpresa /> })}
                    {renderProtectedRoleRoute({ routeKey: "empresaBuscar", element: <BuscarEmpresa /> })}
                    {renderProtectedRoleRoute({ routeKey: "empresaAtualizar", element: <AtualizarEmpresa /> })}
                    {renderProtectedRoleRoute({ routeKey: "empresaMultiAcesso", element: <EmpresaMultiAcesso /> })}
                    {renderProtectedRoleRoute({ routeKey: "auditoria", element: <AuditoriaFiscal /> })}
                    {renderProtectedRoleRoute({ routeKey: "criarColaborador", element: <CriarColaborador /> })}
                    {renderProtectedRoleRoute({ routeKey: "criarAdministrador", element: <CriarManager /> })}
                    {renderProtectedRoleRoute({ routeKey: "listaColaboradores", element: <ListaColaboradores /> })}
                    {renderProtectedRoleRoute({ routeKey: "apuracaoHoras", element: <PendingApprovals /> })}
                    {renderProtectedRoleRoute({ routeKey: "statusDoRegistro", element: <StatusRegistro /> })}
                    {renderProtectedRoleRoute({ routeKey: "ferias", element: <VacationApprovals /> })}
                    {renderProtectedRoleRoute({ routeKey: "aprovacoesAbono", element: <ManualRegisterApprovals /> })}
                    {renderProtectedRoleRoute({ routeKey: "contratosAdmin", element: <ContratosAdmin /> })}
                    {renderProtectedRoleRoute({ routeKey: "contratosEnviar", element: <EnviarContrato /> })}
                    {renderProtectedRoleRoute({ routeKey: "lgpdAdminRequests", element: <AdminLgpdRequests /> })}
                    {renderProtectedRoleRoute({ routeKey: "lgpdAdminRequestDetails", element: <AdminLgpdRequestDetails /> })}
                    {renderProtectedRoleRoute({ routeKey: "lgpdAdminInventory", element: <AdminInventory /> })}
                    {renderProtectedRoleRoute({ routeKey: "lgpdAdminInventoryForm", element: <InventoryForm /> })}
                    {renderProtectedRoleRoute({ routeKey: "lgpdAdminInventoryEdit", element: <InventoryForm /> })}
                    {renderProtectedRoleRoute({ routeKey: "administracao", element: <Administracao /> })}
                    {renderProtectedRoleRoute({ routeKey: "ctoDemoSandbox", element: <CTODemoSandbox /> })}
                    {renderProtectedRoleRoute({ routeKey: "empresaTerminalFlag", element: <TerminalFlagManager /> })}
                  </Route>

                  <Route path="/privacy-policy" element={<Navigate to={APP_PATHS.privacyPolicy} replace />} />
                  <Route path="/politica-de-privacidade" element={<Navigate to={APP_PATHS.privacyPolicy} replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AppErrorBoundary>
          </TooltipProvider>
          </CheckinProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
