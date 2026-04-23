import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import TokenRedirect from "./pages/TokenRedirect";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Empresa from "./pages/Empresa";
import CriarEmpresa from "./pages/CriarEmpresa";
import BuscarEmpresa from "./pages/BuscarEmpresa";
import AtualizarEmpresa from "./pages/AtualizarEmpresa";
import RelatorioDetalhado from "./pages/RelatorioDetalhado";
import EspelhoPonto from "./pages/EspelhoPonto";
import AuditoriaFiscal from "./pages/AuditoriaFiscal";
import Documentos from "./pages/Documentos";
import EnviarDocumentos from "./pages/EnviarDocumentos";
import DocumentoColaborador from "./pages/DocumentoColaborador";
import Usuario from "./pages/Usuario";
import CriarColaborador from "./pages/CriarColaborador";
import CriarManager from "./pages/CriarManager";
import ListaColaboradores from "./pages/ListaColaboradores";
import PendingApprovals from "./pages/PendingApprovals";
import StatusRegistro from "./pages/StatusRegistro";
import Avisos from "./pages/Avisos";
import CriarAviso from "./pages/CriarAviso";
import VacationApprovals from "./pages/VacationApprovals";
import RequestVacation from "./pages/RequestVacation";
import ManualRegisterApprovals from "./pages/ManualRegisterApprovals";
import { RequestManualRegistration } from "./pages/RequestManualRegistration";
import NotFound from "./pages/NotFound";
import { APP_PATHS, APP_ROUTE_META } from "@/config/app-routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
