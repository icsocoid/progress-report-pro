import type {DataTemuan} from "@/utils/vartype.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Label} from "@/components/ui/label.tsx";
import {convertIndonesiaFormat, formatFileSize, getCurrentDateFormatted, getFileIcon} from "@/utils/helpers.ts";
import {Separator} from "@/components/ui/separator.tsx";
import {Badge} from "@/components/ui/badge.tsx";

const ReviewForm = ({dataTemuan}: DataTemuan) => {
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
                                    <p className="font-medium">{dataTemuan.tanggal !== '' ? convertIndonesiaFormat(dataTemuan.tanggal) : getCurrentDateFormatted('indonesian')}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Client</Label>
                                    <p className="font-medium">{dataTemuan.client.company_name}</p>
                                </div>
                            </div>
                        </div>
                        <Separator/>
                        <div>
                            <h3 className="font-semibold mb-3">Peserta</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {
                                    // 3 baris × 4 kolom = 12 slot → loop 12 kali
                                    Array.from({ length: 12 }).map((_, index) => {
                                        // rumus untuk ambil data secara column-first
                                        const rowCount = 3;
                                        const col = Math.floor(index / rowCount); // 0–3
                                        const row = index % rowCount;             // 0–2
                                        const dataIndex = row + col * rowCount;

                                        const team = dataTemuan.team?.[dataIndex];

                                        return (
                                            <div key={team?.id || `empty-${index}`} className="border p-2 rounded shadow-sm min-h-[60px]">
                                                {team ? (
                                                    <label
                                                        htmlFor={`task-${team.id}`}
                                                        className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block"
                                                    >
                                                        {dataIndex + 1}. {team.nama}
                                                    </label>
                                                ) : (
                                                    <span className="text-gray-400">{dataIndex + 1}. -</span>
                                                )}
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                        <Separator/>
                        <div>
                            <h3 className="font-semibold mb-3">Temuan</h3>
                            {
                                dataTemuan.job?.tasks?.map((task) => {
                                    const taskNotes = dataTemuan.note?.filter(note =>
                                        note.job_task_id === task.id && note.note?.trim().length > 0
                                    ) ?? [];

                                    return taskNotes.length > 0 ? (
                                        <div key={task.id} className="p-1">
                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="gap-3">
                                                        <label
                                                            htmlFor={`task-${task.id}`}
                                                            className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            {task.task_name}
                                                        </label>
                                                    </div>
                                                </div>

                                                {taskNotes.map(note => (
                                                    <div key={note.id} className="flex items-center">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="ml-2">- {note.note}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null;
                                })
                            }
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold mb-3">Informasi Lain</h3>
                            {dataTemuan.informasi_lain && dataTemuan.informasi_lain.map((info, index) => {
                                return <><div key={index} className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">{info.note}</div></>
                            })}
                            {dataTemuan.files && dataTemuan.files.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-3">Attachments ({dataTemuan.files?.length})</h3>
                                        <div className="space-y-2">
                                            {dataTemuan.files?.map((attachedFile) => {
                                                const FileIcon = getFileIcon(attachedFile.file)
                                                return <><div key={attachedFile.id}
                                                              className="flex items-center space-x-2 text-sm">
                                                    <FileIcon className="w-4 h-4"/>
                                                    <span>{attachedFile.file.name}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {formatFileSize(attachedFile.file.size)}
                                                    </Badge>
                                                </div></>
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