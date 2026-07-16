import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft, FileText, Send} from "lucide-react";
import * as React from "react";
import {useNavigate, useParams} from "react-router-dom";
import {InitProgressReport, type FileWithPreview, type ProgressReport} from "@/models/progress.ts";
import axios from "axios";
import {useEffect, useRef} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Label} from "@/components/ui/label.tsx";
import {bulanIndo, convertIndonesiaFormat, formatFileSize, getFileIcon} from "@/utils/helpers.ts";
import {Badge} from "@/components/ui/badge.tsx";
import html2pdf from 'html2pdf.js'
import type {JobTask} from "@/models/job.ts";
import {useToast} from "@/hooks/use-toast.ts";
import SingleFileUpload from "@/components/SingleFileUpload.tsx";
import {getNoteImageUrls} from "@/utils/noteImages.ts";

type DetailProgressReportPageProps = {
    reportId?: string;
    embedded?: boolean;
    hideRequestApprovalButton?: boolean;
    hidePageHeader?: boolean;
};

const NoteImages = ({note}: {note: unknown}) => {
    const imageUrls = getNoteImageUrls(note)
    if (imageUrls.length === 0) return null

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {imageUrls.map((imageUrl, index) => (
                <a key={`${imageUrl}-${index}`} href={imageUrl} target="_blank" rel="noopener noreferrer">
                    <img
                        src={imageUrl}
                        alt={`Gambar catatan ${index + 1}`}
                        className="h-24 w-32 rounded-md border object-cover"
                    />
                </a>
            ))}
        </div>
    )
}

const DetailProgressReportPage = ({
                                      reportId,
                                      embedded = false,
                                      hideRequestApprovalButton = false,
                                      hidePageHeader = false,
                                  }: DetailProgressReportPageProps) => {
    const navigate = useNavigate()
    const [dataProgress, setDataProgress] = React.useState<ProgressReport>(InitProgressReport)
    const [loading, setLoading] = React.useState(true)
    const [isExporting, setIsExporting] = React.useState(false)
    const [isSharingApproval, setIsSharingApproval] = React.useState(false)
    const [uploadedFiles, setUploadedFiles] = React.useState<FileWithPreview[]>([])
    const [isUploadingEvidence, setIsUploadingEvidence] = React.useState(false)
    const reportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast()

    const goToProgressList = () => {
        navigate("/progress")
    }

    const handleExportPDF = async () => {
        if (!reportRef.current) return
        setIsExporting(true)
        const element = reportRef.current;
        html2pdf()
            .from(element)
            .set({
                margin: 0.5,
                filename: 'progress-report.pdf',
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            })
            .save();
        setIsExporting(false)
    }

    const {id} = useParams()
    const activeReportId = reportId ?? id

    const handleRequestApproval = async () => {
        if (!activeReportId) {
            toast({
                title: "Peringatan!",
                description: "ID progress report tidak ditemukan.",
                duration: 3000,
            })
            return
        }

        try {
            setIsSharingApproval(true)
            const approvalUrl = new URL(`/approval/${activeReportId}`, window.location.origin)
            const canShare = typeof navigator.share === "function"

            if (canShare) {
                await navigator.share({
                    title: `Approval Progress Report ${dataProgress.nomor || activeReportId}`,
                    text: "Silakan review progress report berikut untuk proses approval.",
                    url: approvalUrl.toString(),
                })
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(approvalUrl.toString())
            } else {
                window.prompt("Salin link approval berikut", approvalUrl.toString())
            }

            toast({
                title: "Link approval siap digunakan.",
                description: canShare
                    ? "Link approval berhasil dibagikan."
                    : "Link approval berhasil disalin ke clipboard.",
                duration: 3000,
            })
        } catch (error) {
            if ((error as Error)?.name === "AbortError") {
                return
            }

            toast({
                title: "Peringatan!",
                description: "Gagal menyiapkan link approval.",
                duration: 3000,
            })
        } finally {
            setIsSharingApproval(false)
        }
    }

    const handleSelectUploadFiles = async (files: FileWithPreview[]) => {
        setUploadedFiles(files)

        if (!activeReportId || files.length === 0) {
            return
        }

        const filesToUpload = files.filter((item) => item.file instanceof File)
        if (filesToUpload.length === 0) {
            return
        }

        try {
            setIsUploadingEvidence(true)

            for (const item of filesToUpload) {
                const formData = new FormData()
                formData.append("progress_report_id", activeReportId)
                formData.append("file", item.file)

                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/progress/upload-bukti`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                )

                if (response.data === false || response.data?.status === false) {
                    throw new Error(response.data?.message ?? "Upload dokumen bukti gagal.")
                }
            }

            await fetchProgressReport()
            setUploadedFiles([])
            toast({
                title: "Upload berhasil.",
                description: "Dokumen bukti berhasil ditambahkan.",
                duration: 3000,
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Peringatan!",
                description: "Gagal upload dokumen bukti.",
                duration: 3000,
            })
        } finally {
            setIsUploadingEvidence(false)
        }
    }

    const fetchProgressReport = async () => {
        setLoading(true)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/progress/${activeReportId}`)
            .then(response => {
                setLoading(false)
                if(response.data.status){
                    setDataProgress(response.data.data)
                }

            })
            .catch(error => {
                setLoading(false)
                console.error(error);
            });
    }
    useEffect(() => {
        if (activeReportId) {
            fetchProgressReport()
        } else {
            setLoading(false)
        }
    }, [activeReportId])

    const removeInvalidTasks = () => {
        const updatedJobs = dataProgress.spk.job.map((job) => {
            const completedTasks: JobTask[] = job.task_done || [];
            const filteredTasks = job.tasks.filter((task) => {
                // tampilkam semua task per job
                const allOldTasksForThisId = dataProgress.old_job?.flatMap((oldJob) =>
                    oldJob.tasks.filter(t => t.job_task_id === task.id)
                ) || [];

                // cek jika ada tanggal_selesai !== ""
                const isCompletedSomewhere = allOldTasksForThisId.find(t => t.tanggal_selesai !== "");
                if (isCompletedSomewhere) {
                    const newJobTask = {
                        ...task,
                        tanggal_selesai: isCompletedSomewhere.tanggal_selesai // ambil dari versi lama
                    };
                    completedTasks.push(newJobTask);
                    //completedTasks.push(task);
                }
                // pertahankan task jika belum completed
                return !isCompletedSomewhere;
            });

            return {
                ...job,
                tasks: filteredTasks,
                task_done: completedTasks
            };
        });

        setDataProgress((prev) => ({
            ...prev,
            spk: {
                ...prev.spk,
                job: updatedJobs
            },
        }));
    }
    useEffect(() => {
        removeInvalidTasks(); //hanya di eksekusi 1x
    }, []);

    const normalizedStatusProgress = (dataProgress.status_progress || "").trim().toLowerCase()
    const shouldHideRequestApprovalButton =
        hideRequestApprovalButton ||
        ["approve", "approved", "reject", "rejected"].includes(normalizedStatusProgress)
    const canShowEvidenceSection = ["approve", "approved", "success"].includes(normalizedStatusProgress)
    const canUploadEvidenceDocument = ["approve", "approved"].includes(normalizedStatusProgress)
    const uploadedEvidencePreviewUrl = dataProgress.upload_bukti?.preview_url?.startsWith("http")
        ? dataProgress.upload_bukti.preview_url
        : dataProgress.upload_bukti?.preview_url
            ? `${import.meta.env.VITE_API_URL}${dataProgress.upload_bukti.preview_url}`
            : ""

    if(loading){
        return (
            <div className={`${embedded ? "py-0 px-0" : "container mx-auto py-8 px-4 max-w-4xl"}`}>
                {!hidePageHeader ? (
                    <div className="flex items-center mb-6">
                        {!embedded ? (
                            <Button variant="ghost" onClick={goToProgressList} className="mr-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        ) : null}
                        <h1 className="text-2xl font-bold">Detail Progress Report</h1>
                    </div>
                ) : null}

                {/* Job Details Loading Skeleton */}
                <Card className="mb-8">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div className="col-span-2">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-5 w-48" />
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>

                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                        <div className="grid mt-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="border rounded-md p-4"><Skeleton className="h-5 w-48" /></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    return (
        <div className={`${embedded ? "w-full" : "container mx-auto py-8 px-4 max-w-4xl"}`}>
            {!hidePageHeader ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-6">
                        {!embedded ? (
                            <Button variant="ghost" onClick={goToProgressList} className="mr-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        ) : null}
                        <h1 className="text-2xl font-bold">Detail Progress Report</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {!shouldHideRequestApprovalButton ? (
                            <Button
                                onClick={handleRequestApproval}
                                disabled={isSharingApproval}
                                variant="default"
                                className="flex items-center gap-2"
                            >
                                {isSharingApproval ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Menyiapkan...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Meminta Persetujuan
                                    </>
                                )}
                            </Button>
                        ) : null}
                        {!embedded ? (
                            <Button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4" />
                                        Export PDF
                                    </>
                                )}
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}
            <Card className="mb-8">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Progress Report</CardTitle>
                    </div>

                </CardHeader>
                <CardContent>
                    <div ref={reportRef} className="grid gap-6">
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-3">{dataProgress.nomor}</h3>
                                </div>
                                <div className="text-sm text-right mr-8">
                                    <strong>Tanda Tangan</strong>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Tanggal</Label>
                                    <p className="font-medium">{convertIndonesiaFormat(dataProgress.tanggal)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Client</Label>
                                    <p className="font-medium">{dataProgress.client.company_name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Nama Jasa</Label>
                                    <p className="font-medium">{dataProgress.spk.nama_jasa}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Periode</Label>
                                    <p className="font-medium">{bulanIndo[dataProgress.bulan !== "" ? parseInt(dataProgress.bulan) - 1 : 0]} - {dataProgress.tahun}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Nama Pembuat</Label>
                                    <p className="font-medium">{dataProgress.pembuat?.employee_name || ""}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            {dataProgress.spk.job && dataProgress.spk.job.map((job) => {
                                let no = 0
                                return (
                                    <div key={job.id}>
                                        {/* Task yang sudah selesai */}
                                        {job.task_done && job.task_done.length > 0 ? (
                                            <div className="bg-gray-50 p-1">
                                                {job.task_done.map((task, index2) => (
                                                    <div key={index2} className="mb-2">
                                                        <div className="flex items-center justify-between p-1">
                                                            <div className="flex-1">{task.task_name}</div>
                                                            <div className="flex-1 text-xs text-foreground text-right">
                                                                Telah selesai diperiksa & diolah tanggal {convertIndonesiaFormat(task.tanggal_selesai || "")}
                                                            </div>
                                                        </div>

                                                        {/* Catatan dari old_job */}
                                                        {dataProgress.old_job && dataProgress.old_job.length > 0 &&
                                                            dataProgress.old_job.flatMap((jb) =>
                                                                jb.tasks
                                                                    .filter((t) => t.job_task_id === task.id)
                                                                    .flatMap((t) =>
                                                                        t.job_task_note.map((note) => (
                                                                            <div key={`old-${note.id}`} className="flex items-center justify-between gap-2">
                                                                                <div className="flex-1">
                                                                                    <p className="p-1 ml-2"> - {note.note || ""}</p>
                                                                                    <div className="ml-2">
                                                                                        <NoteImages note={note} />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="text-xs text-foreground mb-3">
                                                                                        {jb.progress_report.nomor} / {convertIndonesiaFormat(jb.progress_report.tanggal)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )
                                                            )
                                                        }

                                                        {/* Catatan dari task itu sendiri */}
                                                        {task.job_task_note?.map((note, index3) => (
                                                            <div key={`note-${index3}`} className="p-1 ml-2">
                                                                <div>- {note.note}</div>
                                                                <NoteImages note={note} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}

                                        {/* Task yang belum selesai */}
                                        {job.tasks.map((task) => {
                                            const hasTaskNote = task.job_task_note && task.job_task_note.length > 0;
                                            const hasTodoWithNotes = task.todo && task.todo.some(td => td.job_task_note && td.job_task_note.length > 0);

                                            if (!hasTaskNote && !hasTodoWithNotes) {
                                                return null;
                                            }

                                            no = no + 1;

                                            return (
                                                <div key={task.id}>
                                                    <div className="p-1">
                                                        {no}. {task.task_name}{" "}
                                                        {task.tanggal_selesai !== '' && task.tanggal_selesai !== null && (
                                                            <Label className="text-muted-foreground">
                                                                Telah selesai diperiksa & diolah tanggal {convertIndonesiaFormat(task.tanggal_selesai || "")}
                                                            </Label>
                                                        )}
                                                    </div>

                                                    {/* Catatan dari old_job untuk task utama */}
                                                    {dataProgress.old_job &&
                                                        dataProgress.old_job.length > 0 &&
                                                        dataProgress.old_job.flatMap((jb) =>
                                                            jb.tasks
                                                                .filter((t) => t.job_task_id === task.job_task_id)
                                                                .flatMap((t) =>
                                                                    t.job_task_note.map((note) => (
                                                                        <div key={note.id} className="flex items-center justify-between gap-2">
                                                                            <div className="flex-1">
                                                                                <p className="p-1 ml-2"> - {note.note || ""}</p>
                                                                                <div className="ml-2">
                                                                                    <NoteImages note={note} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-sm text-foreground mb-3">
                                                                                    {jb.progress_report.nomor} {convertIndonesiaFormat(jb.progress_report.tanggal)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )
                                                        )
                                                    }

                                                    {/* Catatan dari task utama */}
                                                    {task.todo && task.todo.length == 0 && task.job_task_note?.map((note) => {
                                                        return (
                                                            <div key={note.id} className="p-1 ml-2">
                                                                <div>- {note.note}</div>
                                                                <NoteImages note={note} />
                                                            </div>
                                                        )
                                                    })}

                                                    {/* Todo (child tasks) dengan notes */}
                                                    {task.todo && task.todo.length > 0 && task.todo.map((td) => {
                                                        const hasTodoNote = td.job_task_note && td.job_task_note.length > 0;
                                                        if (!hasTodoNote) return null;

                                                        return (
                                                            <div key={td.id} className="ml-4 mt-2">
                                                                <div className="p-1 font-medium text-sm">
                                                                    • {td.task_name}
                                                                </div>

                                                                {/* Notes dari todo */}
                                                                {td.job_task_note?.map((note) => {
                                                                    return (
                                                                        <div key={note.id} className="p-1 ml-4 text-sm">
                                                                            <div>- {note.note}</div>
                                                                            <NoteImages note={note} />
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold mb-3">Temuan</h3>
                            {dataProgress.spk.job && dataProgress.spk.job.map((job) => {
                                return (
                                    <div key={job.id}>
                                        {job.tasks.map((task, index2) => {
                                            if(task.kasus && task.kasus.length > 0) {
                                                return (
                                                    <div key={task.id}>
                                                        <div className="p-1"> {index2 + 1}. {task.task_name}</div>
                                                        {dataProgress.old_job &&
                                                            dataProgress.old_job.length > 0 &&
                                                            dataProgress.old_job.flatMap((jb) =>
                                                                jb.tasks
                                                                    .filter((t) => t.job_task_id === task.id)
                                                                    .flatMap((t) =>
                                                                        t.kasus?.map((note) => (
                                                                            <div key={note.id} className="flex items-start space-x-3">
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="p-1 ml-2"> - {note.note || ""}</p>
                                                                                    <div className="ml-2">
                                                                                        <NoteImages note={note} />
                                                                                    </div>

                                                                                    {t.reply && t.reply.length > 0 && (
                                                                                        <div className="space-y-2">
                                                                                            {t.reply.map((childReply) => (
                                                                                                <p key={childReply.id} className="p-1 ml-4 text-sm text-foreground">
                                                                                                    - {childReply.note || ""}
                                                                                                </p>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )
                                                            )
                                                        }
                                                        {task.kasus?.map((note) => {
                                                            return (
                                                                <div key={note.id} className="p-1 ml-2">
                                                                    <div>- {note.note}</div>
                                                                    <NoteImages note={note} />
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )
                                            }
                                            return null;
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold mb-3">Informasi Lain</h3>
                            {dataProgress.informasi_lain && dataProgress.informasi_lain.map((info, index) => {
                                return (
                                    <div key={index} className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                                        {info.note}
                                    </div>
                                )
                            })}
                            {dataProgress.files && dataProgress.files.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-3">Attachments ({dataProgress.files.length})</h3>
                                        <div className="space-y-2">
                                            {dataProgress.files.map((attachedFile) => {
                                                const FileIcon = getFileIcon(attachedFile.file)
                                                const filePreview = attachedFile && attachedFile?.preview?.startsWith('http') ? attachedFile.preview : `${import.meta.env.VITE_API_URL}${attachedFile.preview}`
                                                return (
                                                    <div key={attachedFile.id} className="flex items-center space-x-2 text-sm">
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
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            {canShowEvidenceSection ? (
                <Card className="mb-8">
                    <CardHeader className="pb-3">
                        <CardTitle>Upload Dokumen / Gambar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dataProgress.upload_bukti ? (
                            <div className="mb-4 rounded-lg border bg-muted/40 p-4">
                                <p className="mb-3 text-sm font-medium">Dokumen Bukti Terupload</p>
                                <div className="flex items-center space-x-2 text-sm">
                                    <FileText className="h-4 w-4" />
                                    <a
                                        href={uploadedEvidencePreviewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline text-blue-600"
                                    >
                                        {dataProgress.upload_bukti.original_name}
                                    </a>
                                    <Badge variant="secondary" className="text-xs">
                                        {formatFileSize(dataProgress.upload_bukti.size || 0)}
                                    </Badge>
                                </div>
                            </div>
                        ) : null}
                        {canUploadEvidenceDocument ? (
                            <>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Tambahkan dokumen pendukung atau image tambahan pada progress report ini.
                                </p>
                                {isUploadingEvidence ? (
                                    <p className="mb-4 text-sm text-muted-foreground">Mengupload dokumen PDF...</p>
                                ) : null}
                                <SingleFileUpload
                                    fileUploads={uploadedFiles}
                                    onSelectFiles={handleSelectUploadFiles}
                                    accept=".pdf,application/pdf"
                                    title="Upload Dokumen PDF"
                                    description="Drag and drop file PDF di sini atau klik untuk memilih dokumen."
                                />
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}
        </div>
    )
}

export default DetailProgressReportPage
