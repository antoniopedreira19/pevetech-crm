import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-8 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
