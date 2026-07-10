import DashboardClientPage from "@/components/pages/dashboard/Client.tsx";
import MasalahPage from "@/components/pages/dashboard/Masalah.tsx";
import DashboardOverview from "@/components/pages/dashboard/Overview.tsx";

const DashboardPage = () => {

    return (
        <div className="grid min-w-0 grid-cols-1 gap-6">
            <DashboardOverview />
            <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
                <DashboardClientPage />
                <MasalahPage />
            </div>
        </div>
    )
}

export default DashboardPage
