import AddProgressForm from "@/components/pages/progress/AddProgressForm.tsx";

export default function AddProgressReportPage() {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Progress Report Form</h2>
            </div>
            <div className="flex-1 p-4">
                <AddProgressForm />
            </div>
        </div>
    )
}