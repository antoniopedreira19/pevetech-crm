import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, Briefcase, CheckSquare, LogOut } from "lucide-react";
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-border/50 flex flex-col relative z-20">
      {/* Container da Logo - Centralizado e Maior */}
      <div className="pt-10 pb-8 px-4 flex justify-center items-center">
        <img
          src={pevetechLogo}
          alt="Pevetech"
          className="h-24 w-auto object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group",
                isActive
                  ? "bg-neon/10 text-neon font-semibold shadow-sm border border-neon/20"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )
            }
          >
            <link.icon size={20} className="transition-colors group-hover:text-current" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-border/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors w-full group"
        >
          <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
