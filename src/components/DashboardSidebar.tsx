import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, Briefcase, CheckSquare, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
  { to: "/dashboard/crm", icon: Briefcase, label: "CRM" },
  { to: "/dashboard/clients", icon: Users, label: "Clientes" },
  { to: "/dashboard/tasks", icon: CheckSquare, label: "Tarefas" },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  // Estado para controlar se a sidebar está minimizada
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "min-h-screen bg-sidebar border-r border-border/50 flex flex-col relative z-20 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Botão de Toggle (Recolher/Expandir) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-12 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm hover:bg-sidebar-accent hover:text-neon transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Container da Logo - Dinâmico */}
      <div className="pt-10 pb-8 px-4 flex justify-center items-center h-32">
        <img
          src={pevetechLogo}
          alt="Pevetech"
          className={cn(
            "object-contain transition-all duration-300 hover:scale-105",
            isCollapsed ? "h-8 w-8" : "h-24 w-auto",
          )}
        />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 space-y-2 mt-2 overflow-hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            title={isCollapsed ? link.label : undefined} // Tooltip nativo para quando estiver colapsado
            className={({ isActive }) =>
              cn(
                "flex items-center py-3 rounded-xl text-sm transition-all duration-200 group whitespace-nowrap",
                isCollapsed ? "justify-center px-0 w-12 mx-auto" : "px-4 gap-3",
                isActive
                  ? "bg-neon/10 text-neon font-semibold shadow-sm border border-neon/20"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )
            }
          >
            <link.icon size={20} className="shrink-0 transition-colors group-hover:text-current" />

            {/* Texto do Link - Oculto quando minimizado */}
            <span
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto block",
              )}
            >
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Rodapé (Logout) */}
      <div className="p-3 mt-auto border-t border-border/50 overflow-hidden">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Sair" : undefined}
          className={cn(
            "flex items-center py-3 rounded-xl text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors group whitespace-nowrap",
            isCollapsed ? "justify-center px-0 w-12 mx-auto" : "px-4 gap-3 w-full",
          )}
        >
          <LogOut size={20} className="shrink-0 group-hover:text-red-500 transition-colors" />
          <span
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto block",
            )}
          >
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
