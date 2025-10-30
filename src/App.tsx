import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Empresa from "./pages/Empresa";
import CriarEmpresa from "./pages/CriarEmpresa";
import BuscarEmpresa from "./pages/BuscarEmpresa";
import RelatorioSimples from "./pages/RelatorioSimples";
import RelatorioDetalhado from "./pages/RelatorioDetalhado";
import Documentos from "./pages/Documentos";
import EnviarDocumentos from "./pages/EnviarDocumentos";
import EnviarAtestado from "./pages/DocumentoColaborador";
import Usuario from "./pages/Usuario";
import CriarColaborador from "./pages/CriarColaborador";
import ListaColaboradores from "./pages/ListaColaboradores";
import ListaUsuarios from "./pages/ListaUsuarios";
import RelatorioHoras from "./pages/RelatorioHoras";
 import Avisos from "./pages/Avisos";
import CriarAviso from "./pages/CriarAviso";
import StatusRegistro from "./pages/StatusRegistro";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetPassword from "./pages/ResetPassword";
import DocumentoColaborador from "./pages/DocumentoColaborador";
import ProtectedRoute from "./components/ProtectedRoute";
import CriarManager from "./pages/CriarManager";
import TokenRedirect from "./pages/TokenRedirect";
 import AtualizarEmpresa from "./pages/AtualizarEmpresa";
import PendingApprovals from "./pages/PendingApprovals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            <Route path="/" element={<TokenRedirect />} />
            <Route path="/esqueci-a-senha" element={<EsqueciSenha />} />
            <Route path="/resetar-senha" element={<ResetPassword />} />

            {/* ======================================= */}
            {/* GRUPO DE ROTAS PROTEGIDAS (REQUEREM LOGIN) */}
            {/* ======================================= */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/empresa" element={<Empresa />} />
              <Route path="/empresa/criar" element={<CriarEmpresa />} />
              <Route path="/empresa/buscar" element={<BuscarEmpresa />} />
              <Route path="/empresa/atualizar" element={<AtualizarEmpresa />} />

              <Route path="/relatorio-simples" element={<RelatorioSimples />} />
              <Route path="/relatorio-detalhado" element={<RelatorioDetalhado />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/enviar-documentos" element={<EnviarDocumentos />} />
              <Route path="/enviar-documento-colaborador" element={<DocumentoColaborador />} />
             
              <Route path="/usuario" element={<Usuario />} />
              <Route path="/criar-colaborador" element={<CriarColaborador />} />
              <Route path="/criar-administrador" element={<CriarManager />} />
              <Route path="/lista-colaboradores" element={<ListaColaboradores />} />
              <Route path="/lista-usuarios" element={<ListaUsuarios />} />
              <Route path="/relatorio-horas" element={<RelatorioHoras />} />
              <Route path="/apuracao-horas" element={<PendingApprovals />} />
              <Route path="/status-do-registro" element={<StatusRegistro />} />
              <Route path="/avisos" element={<Avisos />} />
              <Route path="/criar-aviso" element={<CriarAviso />} />
            </Route>
            {/* Rota de Not Found (pública) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
export default App;