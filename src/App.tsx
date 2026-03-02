import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "./components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Empresa = lazy(() => import("./pages/Empresa"));
const CriarEmpresa = lazy(() => import("./pages/CriarEmpresa"));
const BuscarEmpresa = lazy(() => import("./pages/BuscarEmpresa"));
const RelatorioDetalhado = lazy(() => import("./pages/RelatorioDetalhado"));
const Documentos = lazy(() => import("./pages/Documentos"));
const EnviarDocumentos = lazy(() => import("./pages/EnviarDocumentos"));
const Usuario = lazy(() => import("./pages/Usuario"));
const CriarColaborador = lazy(() => import("./pages/CriarColaborador"));
const ListaColaboradores = lazy(() => import("./pages/ListaColaboradores"));
const Avisos = lazy(() => import("./pages/Avisos"));
const CriarAviso = lazy(() => import("./pages/CriarAviso"));
const StatusRegistro = lazy(() => import("./pages/StatusRegistro"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const DocumentoColaborador = lazy(() => import("./pages/DocumentoColaborador"));
const CriarManager = lazy(() => import("./pages/CriarManager"));
const TokenRedirect = lazy(() => import("./pages/TokenRedirect"));
const AtualizarEmpresa = lazy(() => import("./pages/AtualizarEmpresa"));
const PendingApprovals = lazy(() => import("./pages/PendingApprovals"));
const VacationApprovals = lazy(() => import("./pages/VacationApprovals"));
const RequestVacation = lazy(() => import("./pages/RequestVacation"));
const ManualRegisterApprovals = lazy(() => import("./pages/ManualRegisterApprovals"));
const RequestManualRegistration = lazy(() => import("./pages/RequestManualRegistration").then((m) => ({ default: m.RequestManualRegistration })));
const EspelhoPonto = lazy(() => import("./pages/EspelhoPonto"));
const AuditoriaFiscal = lazy(() => import("./pages/AuditoriaFiscal"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="p-4">Carregando...</div>}>
            <Routes>
              <Route path="/" element={<TokenRedirect />} />
              <Route path="/index" element={<Index />} />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
