import type {DataProgress} from "@/utils/vartype.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    bulanIndo,
    convertIndonesiaFormat,
    formatFileSize,
    getCurrentDateFormatted,
    getFileIcon
} from "@/utils/helpers.ts";
import { Badge } from "@/components/ui/badge";

const ReviewForm = ({dataProgress}: DataProgress) => {
    return (
        <div>
            <Card className="overflow-y-auto max-h-[930px]">
                <CardHeader>
                    <CardTitle>Review</CardTitle>
                    <CardDescription>Silahkan cek ulang sebelum dilakukan submit data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6">
                        <div>
                            <h3 className="font-semibold mb-3">Informasi</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Tanggal</Label>
                                    <p className="font-medium">{dataProgress.tanggal !== '' ? convertIndonesiaFormat(dataProgress.tanggal) : getCurrentDateFormatted('indonesian')}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Client</Label>
                                    <p className="font-medium">{dataProgress.client.company_name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Pekerjaan</Label>
                                    <p className="font-medium">{dataProgress.spk.nama_jasa}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Periode</Label>
                                    <p className="font-medium">{bulanIndo[dataProgress.bulan !== "" ? parseInt(dataProgress.bulan) - 1 : 0]} - {dataProgress.tahun}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold mb-3">Pekerjaan</h3>

                            {dataProgress.spk.job && dataProgress.spk.job.map((job, index) => {
                                return (
                                    <div key={index}>
                                        <div className="p-1">{job.tasks && job.tasks.length > 0 ? job.jasa.product_name : ""}</div>

                                        {/* Task yang sudah selesai (task_done) */}
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
                                                                - {note.note}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}

                                        {/* Task yang belum selesai */}
                                        {job.tasks.map((task, index2) => {
                                            const hasTaskNote = task.job_task_note && task.job_task_note.length > 0;
                                            const hasTodoWithNotes = task.todo && task.todo.some(td => td.job_task_note && td.job_task_note.length > 0);

                                            if (!hasTaskNote && !hasTodoWithNotes) {
                                                return null;
                                            }

                                            return (
                                                <div key={index2}>
                                                    <div className="p-1">
                                                        {index2 + 1}. {task.task_name}{" "}
                                                        {task.completed && (
                                                            <Label className="text-muted-foreground"> (Selesai)</Label>
                                                        )}
                                                    </div>

                                                    {/* Catatan dari old_job untuk task utama */}
                                                    {dataProgress.old_job &&
                                                        dataProgress.old_job.length > 0 &&
                                                        dataProgress.old_job.flatMap((jb) =>
                                                            jb.tasks
                                                                .filter((t) => t.job_task_id === task.id)
                                                                .flatMap((t) =>
                                                                    t.job_task_note.map((note) => (
                                                                        <div key={note.id} className="flex items-center justify-between gap-2">
                                                                            <div className="flex-1">
                                                                                <p className="p-1 ml-2"> - {note.note || ""}</p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-xs text-foreground mb-3">
                                                                                    {jb.progress_report.nomor} {convertIndonesiaFormat(jb.progress_report.tanggal)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )
                                                        )
                                                    }

                                                    {/* Catatan dari task utama */}
                                                    {task.job_task_note?.map((note, index3) => {
                                                        if (note.note !== '') {
                                                            return (
                                                                <div key={index3} className="p-1 ml-2">
                                                                    - {note.note}
                                                                </div>
                                                            )
                                                        }
                                                    })}

                                                    {/* Todo (child tasks) */}
                                                    {task.todo && task.todo.length > 0 && task.todo.map((td, tdIndex) => {
                                                        const hasTodoNote = td.job_task_note && td.job_task_note.length > 0;
                                                        if (!hasTodoNote) return null;

                                                        return (
                                                            <div key={tdIndex} className="ml-4 mt-2">
                                                                <div className="p-1 font-medium text-sm">
                                                                    • {td.task_name}
                                                                </div>

                                                                {/* Notes dari todo */}
                                                                {td.job_task_note?.map((note, noteIndex) => {
                                                                    if (note.note !== '') {
                                                                        return (
                                                                            <div key={noteIndex} className="p-1 ml-4 text-sm">
                                                                                - {note.note}
                                                                            </div>
                                                                        )
                                                                    }
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
                            <h3 className="font-semibold mb-3">Masalah</h3>
                            {dataProgress.spk.job && dataProgress.spk.job.map((job, index) => {
                                const hasKasus = job.tasks?.some(task => task.kasus && task.kasus.length > 0);
                                return (
                                    <div key={index}>
                                        <div className="p-1">{hasKasus ? job.jasa.product_name : ""}</div>
                                        {job.tasks.map((task, index2) => {
                                            const hasMultipleCurrentKasus = task.kasus && task.kasus.length > 0

                                            const hasMultipleOldKasus = dataProgress.old_job && dataProgress.old_job.length > 0 && dataProgress.old_job.some(jb =>
                                                jb.tasks.some(t =>
                                                    t.kasus?.some(
                                                        kas => t.job_task_id === task.id && ((t.kasus && t.kasus.length > 0) || (kas.reply && kas.reply.length > 0))
                                                    )
                                                )
                                            );
                                            return (
                                                <div key={index2}>
                                                    <div className="p-1">
                                                        {hasMultipleCurrentKasus || hasMultipleOldKasus ? `${index2 + 1}. ${task.task_name}` : ""}
                                                    </div>
                                                    {dataProgress.old_job &&
                                                        dataProgress.old_job.length > 0 &&
                                                        dataProgress.old_job.flatMap((jb) =>
                                                            jb.tasks
                                                                .filter((t) => t.job_task_id === task.id)
                                                                .flatMap((t) =>
                                                                    t.kasus?.map((note) => (
                                                                        note.solusi !== "" ? (
                                                                            <div key={note.id} className="flex items-start space-x-3">
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="p-1 ml-2"> - {note.note || ""}</p>

                                                                                    {note.reply && note.reply.length > 0 && (
                                                                                        <div className="space-y-2">
                                                                                            {note.reply.map((childReply) => (
                                                                                                <p key={childReply.id} className="p-1 ml-5 text-sm text-foreground">
                                                                                                    - {childReply.note || ""}
                                                                                                </p>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : null
                                                                    ))
                                                                )
                                                        )
                                                    }

                                                    {task.kasus?.map((note, index3) => {
                                                        if (note.note !== '') {
                                                            return (
                                                                <div key={index3} className="p-1 ml-2">
                                                                    - {note.note}
                                                                </div>
                                                            )
                                                        }
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
                            <h3 className="font-semibold mb-3">Informasi Lain</h3>
                            {dataProgress.informasi_lain && dataProgress.informasi_lain.map((info, index) => {
                                return (
                                    <div key={index} className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                                        {info.note}
                                    </div>
                                )
                            })}
                            {dataProgress.files.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-3">Attachments ({dataProgress.files.length})</h3>
                                        <div className="space-y-2">
                                            {dataProgress.files.map((attachedFile) => {
                                                const FileIcon = getFileIcon(attachedFile.file)
                                                return (
                                                    <div key={attachedFile.id} className="flex items-center space-x-2 text-sm">
                                                        <FileIcon className="w-4 h-4"/>
                                                        <span>{attachedFile.file.name}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {formatFileSize(attachedFile.file.size)}
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
        </div>
    )
}

export default ReviewForm