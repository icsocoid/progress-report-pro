import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

const SuccessStep = () => {


    const handleGoBack = () => {
        window.location.reload()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Sukses!</h1>
                    <p className="text-gray-600">Progress report yang Anda submit telah sukses disimpan.</p>
                </div>

                <div className="pt-4">
                    <Button onClick={() => handleGoBack()} className="w-full sm:w-auto px-8">
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    )

}

export default SuccessStep