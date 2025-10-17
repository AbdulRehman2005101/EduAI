import { Menu } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate()
  const handleLogout = () => {
    logout();
    // Optional: Redirect to login page
    navigate('/signin');
  };
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden text-white">
          <Menu className="w-6 h-6" />
        </SidebarTrigger>
        <div>
          <h1 className="text-2xl font-bold text-[#42ACB0] mb-1">{title}</h1>
          <p className="text-white text-lg">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-white text-sm">{user?.name || "Welcome!"}</p>
          <p className="text-gray-400 text-xs">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
