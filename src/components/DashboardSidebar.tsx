import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Beaker,
} from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import pevetechIcon from "@/assets/pevetech-icon.png";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
  { to: "/dashboard/crm", icon: Briefcase, label: "CRM" },
  { to: "/dashboard/clients", icon: Users, label: "Clientes" },
  { to: "/dashboard/tasks", icon: CheckSquare, label: "Tarefas" },
  { to: "/dashboard/labs", icon: Beaker, label: "Labs Admin" },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
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
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-12 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm hover:bg-sidebar-accent hover:text-neon transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Container da Logo - Ajustado para maior destaque */}
      <div
        className={cn(
          "flex justify-center items-center transition-all duration-300",
          // Aumentei a altura do container e removi padding vertical quando colapsado
          isCollapsed ? "h-28 pt-8 pb-4 px-0" : "h-32 pt-10 pb-8 px-4",
        )}
      >
        <img
          src={isCollapsed ? pevetechIcon : pevetechLogo}
          alt="Pevetech"
          className={cn(
            "object-contain transition-all duration-300 hover:scale-105",
            // Ícone aumentado para h-16 w-16 (64px) para ficar bem maior que os ícones do menu
            isCollapsed ? "h-16 w-16 drop-shadow-[0_0_12px_rgba(0,255,128,0.3)]" : "h-24 w-auto",
          )}
        />
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-2 overflow-hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            title={isCollapsed ? link.label : undefined}
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
