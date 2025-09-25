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
import AtestadoMedico from "./pages/AtestadoMedico";
import EnviarDocumentos from "./pages/EnviarDocumentos";
import EnviarAtestado from "./pages/EnviarAtestado";
import Usuario from "./pages/Usuario";
import CriarColaborador from "./pages/CriarColaborador";
import ListaColaboradores from "./pages/ListaColaboradores";
import ListaUsuarios from "./pages/ListaUsuarios";
import CriarUsuario from "./pages/CriarUsuario";
import RelatorioHoras from "./pages/RelatorioHoras";
import ApuracaoHoras from "./pages/ApuracaoHoras";
import Avisos from "./pages/Avisos";
import CriarAviso from "./pages/CriarAviso";
import StatusRegistro from "./pages/StatusRegistro";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
          
          <Route path="/empresa" element={<Empresa />} />
          <Route path="/empresa/criar" element={<CriarEmpresa />} />
          <Route path="/empresa/buscar" element={<BuscarEmpresa />} />
          
          <Route path="/relatorio-simples" element={<RelatorioSimples />} />
          <Route path="/relatorio-detalhado" element={<RelatorioDetalhado />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/enviar-documentos" element={<EnviarDocumentos />} />
          <Route path="/enviar-atestado" element={<EnviarAtestado />} />
          <Route path="/atestado-medico" element={<AtestadoMedico />} />
          <Route path="/usuario" element={<Usuario />} />
          <Route path="/criar-colaborador" element={<CriarColaborador />} />
          <Route path="/lista-colaboradores" element={<ListaColaboradores />} />
          <Route path="/lista-usuarios" element={<ListaUsuarios />} />
          <Route path="/criar-usuario" element={<CriarUsuario />} />
          <Route path="/relatorio-horas" element={<RelatorioHoras />} />
          <Route path="/apuracao-horas" element={<ApuracaoHoras />} />
          <Route path="/status-do-registro" element={<StatusRegistro />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/criar-aviso" element={<CriarAviso />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
