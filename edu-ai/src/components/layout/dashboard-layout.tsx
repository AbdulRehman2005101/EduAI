import { Outlet } from 'react-router-dom'
import AppSidebar from "@/components/shared/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout() {
  return (
    <div className="min-h-screen w-full bg-[#1B2023]">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar />
          <div className="flex-1 min-h-screen overflow-auto">
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}