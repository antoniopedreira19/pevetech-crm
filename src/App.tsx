import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import CRMKanban from "./pages/CRMKanban";
import ClientsPage from "./pages/ClientsPage";
import TasksPage from "./pages/TasksPage";
import DiagnosticPage from "./pages/DiagnosticPage";
import NotFound from "./pages/NotFound";

// Importações do ecossistema Labs
import LabsPage from "./pages/LabsPage";
import LabsAdminPage from "./pages/LabsAdminPage";
import LabProjectViewer from "./pages/LabProjectViewer"; // Componente do Passo 3

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnostico" element={<DiagnosticPage />} />
          {/* Ecossistema Pevetech Labs (Público para Leads) */}
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/labs/:slug" element={<LabProjectViewer />} /> {/* Rota Dinâmica (Ex: /labs/ai-pitch) */}
          {/* Rotas Administrativas (Privadas) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="crm" element={<CRMKanban />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="labs" element={<LabsAdminPage />} /> {/* Painel de Controle do Labs */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
