import { Img } from "react-image";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BookOpen, HelpCircle, Settings, Users } from "lucide-react";

export default function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-700">
      <SidebarContent className="bg-[#1B2023]">
        <div className="p-6">
          <Img
            src="/images/eduai.png"
            alt="Logo"
            height={100}
            width={100}
            className="h-auto w-auto"
          />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-400 hover:text-white hover:bg-gray-700">
                  <BookOpen className="w-4 h-4" />
                  <span>Teacher</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-white bg-gradient-to-r from-[#05636F] to-[#42ACB0]">
                  <BookOpen className="w-4 h-4" />
                  <span>My Courses</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-gray-400 hover:text-white hover:bg-gray-700">
                  <Users className="w-4 h-4" />
                  <span>Students</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton className="text-gray-400 hover:text-white hover:bg-gray-700">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-gray-400 hover:text-white hover:bg-gray-700">
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
