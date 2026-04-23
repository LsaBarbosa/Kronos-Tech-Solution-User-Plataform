import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<TokenRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/senha-primeiro-acesso" element={<EsqueciSenha />} />
              <Route path="/resetar-senha" element={<ResetPassword />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/empresa" element={<Empresa />} />
                <Route path="/empresa/criar" element={<CriarEmpresa />} />
                <Route path="/empresa/buscar" element={<BuscarEmpresa />} />
                <Route path="/empresa/atualizar" element={<AtualizarEmpresa />} />
                <Route path="/relatorio-detalhado" element={<RelatorioDetalhado />} />
                <Route path="/espelho-ponto" element={<EspelhoPonto />} />
                <Route path="/auditoria" element={<AuditoriaFiscal />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/enviar-documentos" element={<EnviarDocumentos />} />
                <Route path="/enviar-documento-colaborador" element={<DocumentoColaborador />} />
                <Route path="/usuario" element={<Usuario />} />
                <Route path="/criar-colaborador" element={<CriarColaborador />} />
                <Route path="/criar-administrador" element={<CriarManager />} />
                <Route path="/lista-colaboradores" element={<ListaColaboradores />} />
                <Route path="/apuracao-horas" element={<PendingApprovals />} />
                <Route path="/status-do-registro" element={<StatusRegistro />} />
                <Route path="/avisos" element={<Avisos />} />
                <Route path="/criar-aviso" element={<CriarAviso />} />
                <Route path="/ferias" element={<VacationApprovals />} />
                <Route path="/solicitar-ferias" element={<RequestVacation />} />
                <Route path="/aprovacoes-abono" element={<ManualRegisterApprovals />} />
                <Route path="/solicitar-abono" element={<RequestManualRegistration />} />
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
