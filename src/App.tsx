import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/context/AuthContext";
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
const RelatorioDetalhado = lazy(() => import("./pages/RelatorioDetalhado"));
const EspelhoPonto = lazy(() => import("./pages/EspelhoPonto"));
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
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
    Carregando...
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path={APP_PATHS.root} element={<TokenRedirect />} />
                <Route path={APP_PATHS.login} element={<Login />} />
                <Route path={APP_PATHS.senhaPrimeiroAcesso} element={<EsqueciSenha />} />
                <Route path={APP_PATHS.resetarSenha} element={<ResetPassword />} />

                <Route element={<ProtectedRoute />}>
                  <Route path={APP_PATHS.dashboard} element={<Dashboard />} />
                  <Route path={APP_PATHS.relatorioDetalhado} element={<RelatorioDetalhado />} />
                  <Route path={APP_PATHS.espelhoPonto} element={<EspelhoPonto />} />
                  <Route path={APP_PATHS.documentos} element={<Documentos />} />
                  <Route path={APP_PATHS.enviarDocumentos} element={<EnviarDocumentos />} />
                  <Route path={APP_PATHS.enviarDocumentoColaborador} element={<DocumentoColaborador />} />
                  <Route path={APP_PATHS.usuario} element={<Usuario />} />
                  <Route path={APP_PATHS.avisos} element={<Avisos />} />
                  <Route path={APP_PATHS.criarAviso} element={<CriarAviso />} />
                  <Route path={APP_PATHS.solicitarFerias} element={<RequestVacation />} />
                  <Route path={APP_PATHS.solicitarAbono} element={<RequestManualRegistration />} />

                  <Route element={<RoleRoute allowedRoles={APP_ROUTE_META.empresa.allowedRoles ?? []} />}>
                    <Route path={APP_PATHS.empresa} element={<Empresa />} />
                    <Route path={APP_PATHS.empresaCriar} element={<CriarEmpresa />} />
                    <Route path={APP_PATHS.empresaBuscar} element={<BuscarEmpresa />} />
                    <Route path={APP_PATHS.empresaAtualizar} element={<AtualizarEmpresa />} />
                  </Route>

                  <Route element={<RoleRoute allowedRoles={APP_ROUTE_META.auditoria.allowedRoles ?? []} />}>
                    <Route path={APP_PATHS.auditoria} element={<AuditoriaFiscal />} />
                    <Route path={APP_PATHS.criarColaborador} element={<CriarColaborador />} />
                    <Route path={APP_PATHS.criarAdministrador} element={<CriarManager />} />
                    <Route path={APP_PATHS.listaColaboradores} element={<ListaColaboradores />} />
                    <Route path={APP_PATHS.apuracaoHoras} element={<PendingApprovals />} />
                    <Route path={APP_PATHS.statusDoRegistro} element={<StatusRegistro />} />
                    <Route path={APP_PATHS.ferias} element={<VacationApprovals />} />
                    <Route path={APP_PATHS.aprovacoesAbono} element={<ManualRegisterApprovals />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
