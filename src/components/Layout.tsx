import { SidebarProvider } from "@/components/ui/sidebar"
import Header from "@/components/partials/header.tsx"
import { Outlet } from "react-router-dom"
import {DashboardSidebar} from "@/components/partials/sidebar.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";

const Layout = () => {
    return (
        <SidebarProvider>
            <div className="flex flex-col w-full">
                <Header />
                <div className="flex flex-1">
                    <DashboardSidebar />
                    <main className="w-full p-6">

                        <Outlet />

                    </main>
                </div>
            </div>
            <Toaster />
        </SidebarProvider>
    )
}

export default Layout
