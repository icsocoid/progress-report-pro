import * as React from "react";
import {useEffect, useMemo, useRef} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {ArrowLeft, Printer, Share2} from "lucide-react";
import {useReactToPrint} from "react-to-print";

import {InitTemuan, type Temuan} from "@/models/temuan.ts";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {convertIndonesiaFormat, formatFileSize, getFileIcon} from "@/utils/helpers.ts";
import {useToast} from "@/hooks/use-toast.ts";

interface NotulenDetailViewProps {
    isPublic?: boolean
}

const NotulenDetailView = ({isPublic = false}: NotulenDetailViewProps) => {
    const navigate = useNavigate()
    const {nomor} = useParams()
    const [dataTemuan, setDataTemuan] = React.useState<Temuan>(InitTemuan)
    const [loading, setLoading] = React.useState(true)
    const componentRef = useRef<HTMLDivElement>(null)
    const {toast} = useToast()

    const handleBack = () => {
        navigate("/notulen")
    }

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Notulen - ${dataTemuan.client?.company_name || "Meeting"} - ${dataTemuan.tanggal}`,
    })

    const shareUrl = useMemo(() => {
        if (!dataTemuan.nomor) return ""
        return `${window.location.origin}/public/notulen/${encodeURIComponent(dataTemuan.nomor)}`
    }, [dataTemuan.nomor])

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
                    title: "Share link gagal",
                    description: "Link publik tidak bisa disalin saat ini.",
                    duration: 3000,
                })
            }
        }
    }

    const fetchTemuan = async () => {
        setLoading(true)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/temuan/detail/${nomor}`)
            .then(response => {
                if (response.data.status) {
                    setDataTemuan(response.data.data)
                }
            })
            .catch(error => {
                console.error(error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchTemuan()
    }, [nomor])

    const groupedNotes = useMemo(() => {
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

    if (loading) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        {!isPublic ? (
                            <Button variant="ghost" onClick={handleBack} className="mr-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        ) : null}
                        <h1 className="text-2xl font-bold">Detail Notulen</h1>
                    </div>
                    <Skeleton className="h-9 w-28" />
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
        <div className={isPublic ? "min-h-screen bg-slate-50 py-8" : ""}>
            <div className={`container mx-auto max-w-4xl px-4 py-8 ${isPublic ? "" : "max-h-[930px] overflow-y-auto"}`}>
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        {!isPublic ? (
                            <Button variant="ghost" onClick={handleBack} className="mr-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        ) : null}
                        <h1 className="text-2xl font-bold">Detail Notulen Meeting</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={handleShareLink} variant="outline" disabled={!shareUrl}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Link
                        </Button>
                        <Button onClick={() => handlePrint()} variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                <div ref={componentRef} className="print:bg-white print:p-8">
                    <Card className="mb-8 print:border-none print:shadow-none">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
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
                                    {dataTemuan.team?.map((tim, index) => (
                                        <div key={index} className="min-h-[60px] rounded border p-2 shadow-sm">
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

                            <h3 className="mb-3 text-lg font-semibold">Informasi Lain</h3>
                            {dataTemuan.informasi_lain && dataTemuan.informasi_lain.map((info, index) => {
                                return <div key={index} className="whitespace-pre-wrap rounded bg-muted p-3 text-sm print:border print:bg-transparent">{info.note}</div>
                            })}

                            {dataTemuan.files && dataTemuan.files.length > 0 && (
                                <div className="print:hidden">
                                    <Separator className="my-4" />
                                    <div>
                                        <h3 className="mb-3 font-semibold">Attachments ({dataTemuan.files.length})</h3>
                                        <div className="space-y-2">
                                            {dataTemuan.files.map((attachedFile) => {
                                                const FileIcon = getFileIcon(attachedFile.file)
                                                const filePreview = attachedFile?.preview?.startsWith("http")
                                                    ? attachedFile.preview
                                                    : `${import.meta.env.VITE_API_URL}${attachedFile.preview}`
                                                const isImage = attachedFile.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)

                                                return (
                                                    <div key={attachedFile.id}>
                                                        {isImage ? (
                                                            <div className="flex flex-col space-y-1">
                                                                <a
                                                                    href={filePreview}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block w-fit"
                                                                >
                                                                    <img
                                                                        src={filePreview}
                                                                        alt={attachedFile.name}
                                                                        className="h-32 w-auto rounded-md border border-gray-200 object-cover transition-opacity hover:opacity-90"
                                                                    />
                                                                </a>
                                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                                    <span>{attachedFile.name}</span>
                                                                    <Badge variant="secondary" className="text-[10px]">
                                                                        {formatFileSize(attachedFile.size || 0)}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2 text-sm">
                                                                <FileIcon className="h-4 w-4" />
                                                                <a
                                                                    href={filePreview}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline"
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

                    <div className="mt-4 hidden text-center text-xs text-gray-400 print:block">
                        Dicetak pada: {new Date().toLocaleString("id-ID")}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotulenDetailView
