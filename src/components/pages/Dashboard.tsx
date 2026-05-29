import DashboardClientPage from "@/components/pages/dashboard/Client.tsx";
import MasalahPage from "@/components/pages/dashboard/Masalah.tsx";

const DashboardPage = () => {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DashboardClientPage />
            <MasalahPage />
        </div>
    )
}

export default DashboardPage