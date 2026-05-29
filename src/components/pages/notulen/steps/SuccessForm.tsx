import {Button} from "@/components/ui/button"
import {CheckCircle, Share2} from "lucide-react"
import {useEffect, useMemo, useState} from "react"
import {InitTemuan, type Temuan} from "@/models/temuan.ts";
import {useToast} from "@/hooks/use-toast.ts";
import axios from "axios";

interface SuccessFormProps {
    temuanId?: string
    fallbackTemuan?: Temuan
}

const SuccessForm = ({temuanId = "", fallbackTemuan = InitTemuan}: SuccessFormProps) => {
    const {toast} = useToast()
    const [isSharing, setIsSharing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [dataTemuan, setDataTemuan] = useState<Temuan>(fallbackTemuan)

    useEffect(() => {
        const fetchTemuan = async () => {
            if (!temuanId) {
                setDataTemuan(fallbackTemuan)
                return
            }

            setIsLoading(true)
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/temuan/${temuanId}`)
                if (response.data.status) {
                    setDataTemuan(response.data.data)
                } else {
                    setDataTemuan(fallbackTemuan)
                }
            } catch {
                setDataTemuan(fallbackTemuan)
                toast({
                    title: "Peringatan!",
                    description: "Detail notulen terbaru gagal dimuat. Menampilkan data sementara.",
                    duration: 3000,
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchTemuan()
    }, [fallbackTemuan, temuanId, toast])


    const handleGoBack = () => {
        window.location.reload()
    }

    const shareUrl = useMemo(() => {
        if (!dataTemuan.nomor) return ""
        return `${window.location.origin}/public/notulen/${encodeURIComponent(dataTemuan.nomor)}`
    }, [dataTemuan.nomor])

    const shareText = useMemo(() => {
        return [
            "Detail Notulen Meeting",
            `Nomor: ${dataTemuan.nomor || "-"}`,
            `Client: ${dataTemuan.client?.company_name || "-"}`,
            shareUrl ? `Link Publik: ${shareUrl}` : "",
        ]
            .filter(Boolean)
            .join("\n\n")
    }, [dataTemuan.client?.company_name, dataTemuan.nomor, shareUrl])

    const handleShareLink = async () => {
        if (!shareUrl) return

        try {
            setIsSharing(true)
            if (navigator.share) {
                await navigator.share({
                    title: `Notulen ${dataTemuan.client?.company_name || ""}`.trim(),
                    text: shareText,
                    url: shareUrl,
                })
            } else {
                await navigator.clipboard.writeText(shareUrl)
                toast({
                    title: "Link publik disalin",
                    description: shareUrl,
                    duration: 3000,
                })
            }
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                return
            }

            try {
                await navigator.clipboard.writeText(shareUrl)
                toast({
                    title: "Link publik disalin",
                    description: shareUrl,
                    duration: 3000,
                })
            } catch {
                toast({
                    title: "Share gagal",
                    description: "Tidak bisa membagikan link notulen saat ini.",
                    duration: 3000,
                })
            }
        } finally {
            setIsSharing(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-2xl w-full text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Sukses!</h1>
                    <p className="text-gray-600">Notulen yang Anda submit telah sukses disimpan.</p>
                </div>

                {isLoading ? (
                    <div className="rounded-xl border bg-white p-4 text-sm text-gray-500 shadow-sm">
                        Memuat detail notulen terbaru...
                    </div>
                ) : null}

                <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
                    <Button onClick={handleShareLink} variant="outline" className="w-full sm:w-auto px-8" disabled={isSharing || !shareUrl}>
                        <Share2 className="mr-2 h-4 w-4" />
                        {isSharing ? "Menyiapkan Link..." : "Share Link"}
                    </Button>
                    <Button onClick={() => handleGoBack()} className="w-full sm:w-auto px-8">
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    )

}

export default SuccessForm
