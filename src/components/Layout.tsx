import { SidebarProvider } from "@/components/ui/sidebar"
import Header from "@/components/partials/header.tsx"
import { Outlet } from "react-router-dom"
import {DashboardSidebar, MobileBottomNavigation} from "@/components/partials/sidebar.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";

const Layout = () => {
    return (
        <SidebarProvider>
            <div className="flex min-h-svh w-full flex-col">
                <Header />
                <div className="flex min-h-0 flex-1">
                    <DashboardSidebar />
                    <main className="min-w-0 flex-1 overflow-x-hidden bg-background p-4 pb-24 sm:p-6 md:pb-6">
                        <Outlet />
                    </main>
                </div>
                <MobileBottomNavigation />
            </div>
            <Toaster />
        </SidebarProvider>
    )
}

export default Layout
