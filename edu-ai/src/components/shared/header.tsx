import { UserButton, useUser } from "@clerk/clerk-react";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const { user } = useUser();

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

      {/* Clerk User Button */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
          },
        }}
      />
    </div>
  );
};

export default DashboardHeader;
