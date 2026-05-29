
import {useNavigate, useParams} from "react-router-dom";
import * as React from "react";
import {InitTemuan, type Temuan} from "@/models/temuan.ts";
import axios from "axios";
import {useEffect, useRef} from "react"; // Tambahkan useRef
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft, Printer, Share2} from "lucide-react"; // Tambahkan Icon Printer
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {convertIndonesiaFormat, formatFileSize, getFileIcon} from "@/utils/helpers.ts";
import {Badge} from "@/components/ui/badge.tsx";
import { useReactToPrint } from "react-to-print"; // Import hook
import {useToast} from "@/hooks/use-toast.ts";

const DetailNotulenPage = () => {
    const navigate = useNavigate()
    const [dataTemuan, setDataTemuan] = React.useState<Temuan>(InitTemuan)
    const [loading, setLoading] = React.useState(true)
    const { toast } = useToast()

    // 1. Buat Reference untuk komponen yang akan di-print
    const componentRef = useRef<HTMLDivElement>(null);

    const goToSolusiList = () => {
        navigate("/notulen")
    }

    const {id, nomor} = useParams()
    const routeParam = nomor || id || ""

    // 2. Setup fungsi Print
    const handlePrint = useReactToPrint({
        contentRef: componentRef, // Mengarahkan ke ref yang kita buat
        documentTitle: `Notulen - ${dataTemuan.client?.company_name || 'Meeting'} - ${dataTemuan.tanggal}`,
        onAfterPrint: () => console.log("Dokumen berhasil diprint/disimpan"),
    });

    const shareUrl = React.useMemo(() => {
        const nomorNotulen = dataTemuan.nomor || routeParam
        if (!nomorNotulen) return ""
        return `${window.location.origin}/public/notulen/${encodeURIComponent(nomorNotulen)}`
    }, [dataTemuan.nomor, routeParam])

    const handleShareLink = async () => {
        if (!shareUrl) return

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Detail Notulen ${dataTemuan.client?.company_name || ""}`.trim(),
                    text: `Notulen meeting ${dataTemuan.client?.company_name || ""}`.trim(),
                    url: shareUrl,
                })
                return
            }

            await navigator.clipboard.writeText(shareUrl)
            toast({
                title: "Link publik disalin",
                description: shareUrl,
                duration: 3000,
            })
        } catch (error) {
            if ((error as Error).name === "AbortError") return

            try {
                await navigator.clipboard.writeText(shareUrl)
                toast({
                    title: "Link publik disalin",
                    description: shareUrl,
                    duration: 3000,
                })
            } catch {
                toast({
                    title: "Share link gagal",
                    description: "Link publik tidak bisa disalin saat ini.",
                    duration: 3000,
                })
            }
        }
    }

    const fetchTemuan = async () => {
        setLoading(true)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/temuan/${routeParam}`)
            .then(response => {
                setLoading(false)
                if(response.data.status){
                    setDataTemuan(response.data.data)
                }

            })
            .catch(error => {
                setLoading(false)
                console.error(error);
            });
    }
    useEffect(() => {
        fetchTemuan()
    }, [routeParam])

    const groupedNotes = React.useMemo(() => {
        const groups = new Map<string, {
            parentId: string
            parentName: string
            notes: NonNullable<Temuan["note"]>
        }>()
        const ungrouped: NonNullable<Temuan["note"]> = []

        dataTemuan.note?.forEach((item) => {
            const currentTask = item.job_task

            if (!currentTask) {
                ungrouped.push(item)
                return
            }

            const parentTask = currentTask.parent
            const parentId = String(parentTask?.id || currentTask.id || item.id)
            const parentName = parentTask?.task_name || currentTask.task_name || "Lainnya"

            if (!groups.has(parentId)) {
                groups.set(parentId, {
                    parentId,
                    parentName,
                    notes: [],
                })
            }

            const targetGroup = groups.get(parentId)
            if (!targetGroup) return

            targetGroup.notes.push(item)
        })

        return {
            groups: Array.from(groups.values()),
            ungrouped,
        }
    }, [dataTemuan.note])

    if(loading){
        // ... (Kode Skeleton tetap sama)
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                {/* Skeleton loading code anda... */}
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={goToSolusiList} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                    <h1 className="text-2xl font-bold">Detail Temuan</h1>
                </div>
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-[200px]" />
                            <Skeleton className="h-4 w-[300px]" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button variant="ghost" onClick={goToSolusiList} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                    <h1 className="text-2xl font-bold">Detail Notulen Meeting</h1>
                </div>

                {/* 3. Tombol Trigger Print */}
                <div className="flex items-center gap-2">
                    <Button onClick={handleShareLink} variant="outline" disabled={!shareUrl}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Link
                    </Button>
                    <Button onClick={() => handlePrint()} variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* 4. Bungkus Card dengan div yang memiliki ref */}
            {/* Class 'print:...' digunakan untuk styling khusus saat mode cetak jika perlu */}
            <div ref={componentRef} className="print:p-8 print:bg-white">
                <Card className="mb-8 print:border-none print:shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle>Detail</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <label className="text-sm font-medium">Tanggal: {convertIndonesiaFormat(dataTemuan.tanggal)}</label>
                            <label className="text-sm font-medium">Client: {dataTemuan.client.company_name}</label>
                            <label className="text-sm font-medium">Pembuat: {dataTemuan.pembuat?.employee_name || ""}</label>

                            <CardTitle className="mt-2 text-lg">Peserta</CardTitle>
                            <div className="grid grid-cols-4 gap-2 print:grid-cols-2">
                                {/* ^^^ print:grid-cols-2 agar di kertas A4 tidak terlalu sempit */}
                                {dataTemuan.team?.map((tim, index) => (
                                    <div key={index} className="p-1 border p-2 rounded shadow-sm min-h-[60px]">
                                        {index + 1}. {tim.nama}
                                    </div>
                                ))}
                            </div>

                            <CardTitle className="mt-2 text-lg">Temuan</CardTitle>
                            <div className="space-y-4">
                                {groupedNotes.groups.map((group) => (
                                    <div key={group.parentId} className="rounded-lg border p-4">
                                        <div className="font-semibold">
                                            {group.parentName}
                                        </div>

                                        <div className="mt-3 ml-4 space-y-2">
                                            {group.notes.map((note, noteIndex) => (
                                                <div key={note.id} className="text-sm">
                                                    {noteIndex + 1}. {note.note}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {groupedNotes.ungrouped.length > 0 ? (
                                    <div className="rounded-lg border border-dashed p-4">
                                        <div className="font-semibold">Lainnya</div>
                                        <div className="mt-3 ml-4 space-y-2">
                                            {groupedNotes.ungrouped.map((note, index) => (
                                                <div key={note.id} className="text-sm">
                                                    {index + 1}. {note.note}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {groupedNotes.groups.length === 0 && groupedNotes.ungrouped.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Belum ada temuan.</div>
                                ) : null}
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <h3 className="font-semibold mb-3 text-lg">Informasi Lain</h3>
                        {dataTemuan.informasi_lain && dataTemuan.informasi_lain.map((info, index) => {
                            return <div key={index} className="bg-muted p-3 rounded text-sm whitespace-pre-wrap print:border print:bg-transparent">{info.note}</div>
                        })}

                        {/* Bagian Attachments biasanya disembunyikan saat print atau ditampilkan listnya saja */}
                        {dataTemuan.files && dataTemuan.files.length > 0 && (
                            <div className="print:hidden">
                                {/* ^^^ print:hidden jika Anda TIDAK ingin file attachments masuk PDF */}
                                <Separator className="my-4" />
                                <div>
                                    <h3 className="font-semibold mb-3">Attachments ({dataTemuan.files.length})</h3>
                                    <div className="space-y-2">
                                        {dataTemuan.files.map((attachedFile) => {
                                            const FileIcon = getFileIcon(attachedFile.file);

                                            // Buat URL preview
                                            const filePreview = attachedFile && attachedFile?.preview?.startsWith('http')
                                                ? attachedFile.preview
                                                : `${import.meta.env.VITE_API_URL}${attachedFile.preview}`;

                                            // 1. Cek apakah file adalah gambar berdasarkan ekstensi nama file
                                            const isImage = attachedFile.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);

                                            return (
                                                <div key={attachedFile.id}>
                                                    {isImage ? (
                                                        /* --- TAMPILAN JIKA GAMBAR --- */
                                                        <div className="flex flex-col space-y-1">
                                                            <a
                                                                href={filePreview}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block w-fit"
                                                            >
                                                                {/* Tampilkan Thumbnail Gambar */}
                                                                <img
                                                                    src={filePreview}
                                                                    alt={attachedFile.name}
                                                                    className="h-32 w-auto object-cover rounded-md border border-gray-200 hover:opacity-90 transition-opacity"
                                                                />
                                                            </a>
                                                            {/* Tetap tampilkan nama file & size di bawah gambar (opsional) */}
                                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                                <span>{attachedFile.name}</span>
                                                                <Badge variant="secondary" className="text-[10px]">
                                                                    {formatFileSize(attachedFile.size || 0)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* --- TAMPILAN JIKA BUKAN GAMBAR (EXCEL, PDF, DLL) --- */
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <FileIcon className="w-4 h-4"/>
                                                            <a
                                                                href={filePreview}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline text-blue-600"
                                                            >
                                                                {attachedFile.name}
                                                            </a>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {formatFileSize(attachedFile.size || 0)}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer khusus Print agar terlihat profesional */}
                <div className="hidden print:block text-xs text-gray-400 mt-4 text-center">
                    Dicetak pada: {new Date().toLocaleString('id-ID')}
                </div>
            </div>
        </div>
    )
}

export default DetailNotulenPage;
