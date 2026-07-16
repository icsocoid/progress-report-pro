import type {DataProgress} from "@/utils/vartype.ts"
import {Button} from "@/components/ui/button.tsx"
import {PlusCircle, Trash2, ReplyIcon, Send, ChevronDown, ChevronRight } from "lucide-react"
import {Textarea} from "@/components/ui/textarea.tsx"
import {Card, CardContent} from "@/components/ui/card.tsx"
import {convertIndonesiaFormat} from "@/utils/helpers.ts";
import NoteImageUpload from "@/components/pages/progress/NoteImageUpload.tsx";
import type {FileWithPreview} from "@/models/progress.ts";

const CaseForm = ({dataProgress, setDataProgress}: DataProgress) => {

    const addCase = (jobId: string, taskId: string) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                spk: {
                    ...prev.spk,
                    job: prev.spk.job.map(job =>
                        job.id === jobId
                            ? {
                                ...job,
                                tasks: job.tasks.map(task =>
                                    task.id === taskId
                                        ? {
                                            ...task,
                                            kasus: [
                                                ...(task.kasus ?? []), // ✅ default ke array kosong
                                                { id: crypto.randomUUID(), note: "", images: [] }
                                            ]
                                        }
                                        : task
                                )
                            }
                            : job
                    )
                }
            };
        });
    }

    const setIsCollapsed = (jobId: string, taskId: string, noteId: string, newIsCollapsed: boolean) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                old_job: prev.old_job?.map(job =>
                    job.id === jobId
                        ? {
                            ...job,
                            tasks: job.tasks.map(task =>
                                task.id === taskId
                                    ? {
                                        ...task,
                                        kasus: task.kasus?.map(note =>
                                            note.id === noteId
                                                ? { ...note, isCollapsed: newIsCollapsed }
                                                : note
                                        )
                                    }
                                    : task
                            )
                        }
                        : job
                )
            };
        });
    }

    const setShowReplyForm = (jobId: string, taskId: string, noteId: string, newShowReply: boolean) => {

        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                old_job: prev.old_job?.map(job =>
                    job.id === jobId
                        ? {
                            ...job,
                            tasks: job.tasks.map(task =>
                                task.id === taskId
                                    ? {
                                        ...task,
                                        kasus: task.kasus?.map(note =>
                                            note.id === noteId
                                                ? { ...note, showReply: newShowReply }
                                                : note
                                        )
                                    }
                                    : task
                            )
                        }
                        : job
                )
            };
        });
    }

    const updateNote = (jobId: string, taskId: string, noteId: string, newValue: string) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                spk: {
                    ...prev.spk,
                    job: prev.spk.job.map(job =>
                        job.id === jobId
                            ? {
                                ...job,
                                tasks: job.tasks.map(task =>
                                    task.id === taskId
                                        ? {
                                            ...task,
                                            kasus: task.kasus?.map(note =>
                                                note.id === noteId
                                                    ? { ...note, note: newValue }
                                                    : note
                                            )
                                        }
                                        : task
                                )
                            }
                            : job
                    )
                }
            };
        });
    }

    const removeCase = (jobId: string, taskId: string, noteId: string) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                spk: {
                    ...prev.spk,
                    job: prev.spk.job.map(job =>
                        job.id === jobId
                            ? {
                                ...job,
                                tasks: job.tasks.map(task =>
                                    task.id === taskId
                                        ? {
                                            ...task,
                                            kasus: task.kasus?.filter(note => note.id !== noteId)
                                        }
                                        : task
                                )
                            }
                            : job
                    )
                }
            };
        });
    }

    const updateCaseImages = (jobId: string, taskId: string, noteId: string, images: FileWithPreview[]) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                spk: {
                    ...prev.spk,
                    job: prev.spk.job.map(job =>
                        job.id === jobId
                            ? {
                                ...job,
                                tasks: job.tasks.map(task =>
                                    task.id === taskId
                                        ? {
                                            ...task,
                                            kasus: task.kasus?.map(note =>
                                                note.id === noteId
                                                    ? { ...note, images }
                                                    : note
                                            )
                                        }
                                        : task
                                )
                            }
                            : job
                    )
                }
            };
        });
    }

    const removeReply = (jobId: string, taskId: string, noteId: string, replyId: string) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                old_job: prev.old_job?.map(job =>
                    job.id === jobId
                        ? {
                            ...job,
                            tasks: job.tasks.map(task =>
                                task.id === taskId
                                    ? {
                                        ...task,
                                        kasus: task.kasus?.map(note =>
                                            note.id === noteId
                                                ? { ...note, reply: note.reply?.filter(rep => rep.id !== replyId)}
                                                : note
                                        )
                                    }
                                    : task
                            )
                        }
                        : job
                )
            };
        });
    }

    const handleSubmitReply = (jobId: string, taskId: string, noteId: string) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                old_job: prev.old_job?.map(job =>
                    job.id === jobId
                        ? {
                            ...job,
                            tasks: job.tasks.map(task =>
                                task.id === taskId
                                    ? {
                                        ...task,
                                        kasus: task.kasus?.map(note =>
                                            note.id === noteId
                                                ? {...note,
                                                    reply: [...(note.reply ?? []), {
                                                        id: crypto.randomUUID(),
                                                        note: note.replyContent ?? "",
                                                        progress_case_id: noteId
                                                    }],
                                                    replyContent: ""
                                                }
                                                : note
                                        )
                                    }
                                    : task
                            )
                        }
                        : job
                )
            };
        });

    }

    const setReplyContent = (jobId: string, taskId: string, noteId: string, newValue: string) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                old_job: prev.old_job?.map(job =>
                    job.id === jobId
                        ? {
                            ...job,
                            tasks: job.tasks.map(task =>
                                task.id === taskId
                                    ? {
                                        ...task,
                                        kasus: task.kasus?.map(note =>
                                            note.id === noteId
                                                ? { ...note, replyContent: newValue }
                                                : note
                                        )
                                    }
                                    : task
                            )
                        }
                        : job
                )
            };
        });
    }

    return (
        <div>
            {dataProgress.spk.job.length > 0 ? (
                <div className="grid gap-6">
                    {dataProgress.spk.job.map((jobProgress) => {
                        return (
                            <div key={jobProgress.id} className="border rounded-md overflow-hidden">
                                <div className="bg-muted p-4 flex items-center justify-between">
                                    <h4 className="font-medium">{jobProgress?.jasa.product_name || "New Job"}</h4>
                                </div>

                                <div className="p-4">
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-sm font-medium">Temuan</h5>

                                        </div>

                                        <div className="border rounded-md divide-y">
                                            {jobProgress.tasks.map((task) => {

                                                return (
                                                    <div key={task.id} className="p-4">
                                                        <div className="grid gap-4">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="gap-3">
                                                                    <label
                                                                        htmlFor={`task-${task.id}`}
                                                                        className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        {task.task_name}
                                                                    </label>
                                                                </div>
                                                                <Button type="button" variant="outline" size="sm"
                                                                        onClick={() => addCase(jobProgress.id, task.id)}>
                                                                    <PlusCircle className="h-4 w-4 mr-2"/>
                                                                    Tambah
                                                                </Button>
                                                            </div>
                                                            {dataProgress.old_job &&
                                                                dataProgress.old_job.length > 0 &&
                                                                dataProgress.old_job.flatMap((jb) =>
                                                                    jb.tasks
                                                                        .filter((t) => t.job_task_id === task.id)
                                                                        .flatMap((t) =>
                                                                            t.kasus?.map((note) => (
                                                                                note.solusi === "" || note.solusi === null ? (
                                                                                    <Card key={note.id} className="mb-3">
                                                                                        <CardContent className="p-4">
                                                                                            <div className="flex items-start justify-between space-x-3">
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <div className="flex-1">
                                                                                                        <p className="text-sm text-foreground mb-3">{note.note || ""}</p>
                                                                                                    </div>
                                                                                                    <div className="text-right">
                                                                                                        <p className="text-sm text-foreground mb-3">{jb.progress_report.nomor} {convertIndonesiaFormat(jb.progress_report.tanggal)}</p>
                                                                                                    </div>
                                                                                                    <div className="flex items-center space-x-2">
                                                                                                        <Button
                                                                                                            variant="ghost"
                                                                                                            size="sm"
                                                                                                            onClick={() => setShowReplyForm(jb.id, t.id,note.id,!note.showReply)}
                                                                                                            className="h-7 px-2 text-xs">
                                                                                                            <ReplyIcon className="w-3 h-3 mr-1" />
                                                                                                            Reply
                                                                                                        </Button>
                                                                                                        {note.reply && note.reply.length > 0 && (
                                                                                                            <Button
                                                                                                                variant="ghost"
                                                                                                                size="sm"
                                                                                                                onClick={() => setIsCollapsed(jb.id, t.id, note.id,!note.isCollapsed)}
                                                                                                                className="h-7 px-2 text-xs"
                                                                                                            >
                                                                                                                {note.isCollapsed ? (
                                                                                                                    <>
                                                                                                                        <ChevronRight className="w-3 h-3 mr-1" />
                                                                                                                        Show {note.reply.length} {note.reply.length === 1 ? "reply" : "replies"}
                                                                                                                    </>
                                                                                                                ) : (
                                                                                                                    <>
                                                                                                                        <ChevronDown className="w-3 h-3 mr-1" />
                                                                                                                        Hide {note.reply.length} {note.reply.length === 1 ? "reply" : "replies"}
                                                                                                                    </>
                                                                                                                )}
                                                                                                            </Button>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            {note.reply && note.reply.length > 0 && !note.isCollapsed && (
                                                                                                <div className="space-y-2">
                                                                                                    {note.reply.map((childReply) => (
                                                                                                        <Card key={childReply.id} className="mb-3">
                                                                                                            <CardContent className="p-4">
                                                                                                                <div className="flex items-start space-x-3">
                                                                                                                    <div className="flex-1 min-w-0">
                                                                                                                        <p className="text-sm text-foreground mb-3">{childReply.note || ""}</p>
                                                                                                                        <div className="flex items-center space-x-2">
                                                                                                                            <Button
                                                                                                                                variant="ghost"
                                                                                                                                size="sm"
                                                                                                                                onClick={() => removeReply(jb.id, t.id, note.id,childReply.id)}
                                                                                                                                className="h-7 px-2 text-xs">
                                                                                                                                <Trash2 className="w-3 h-3 mr-1" />
                                                                                                                                Hapus
                                                                                                                            </Button>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </CardContent>
                                                                                                        </Card>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                            {note.showReply && (
                                                                                                <div className="mt-4 ml-11">
                                                                                                    <Textarea
                                                                                                        placeholder="Write a reply..."
                                                                                                        value={note.replyContent}
                                                                                                        onChange={(e) => setReplyContent(jb.id, t.id, note.id, e.target.value)}
                                                                                                        className="min-h-[80px] resize-none"
                                                                                                    />
                                                                                                    <div className="flex justify-end space-x-2 mt-2">
                                                                                                        <Button
                                                                                                            variant="outline"
                                                                                                            size="sm"
                                                                                                            onClick={() => {
                                                                                                                setShowReplyForm(jb.id, t.id,note.id, !note.showReply)
                                                                                                            }}
                                                                                                        >
                                                                                                            Cancel
                                                                                                        </Button>
                                                                                                        <Button size="sm" onClick={() => handleSubmitReply(jb.id, t.id, note.id)}>
                                                                                                            <Send className="w-3 h-3 mr-1" />
                                                                                                            Reply
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </CardContent>
                                                                                    </Card>
                                                                                ) : ""
                                                                            ))
                                                                        )
                                                                )}
                                                            {task.kasus && task.kasus.map((note, index) => (
                                                                <div key={note.id} className="flex items-center gap-2">
                                                                    <div className="flex-1">
                                                                        <Textarea
                                                                            key={index}
                                                                            placeholder="Keterangan..."
                                                                            value={note.note || ""}
                                                                            onChange={(e) =>
                                                                                updateNote(jobProgress.id, task.id, note.id, e.target.value)
                                                                            }
                                                                            className="min-h-[80px]"
                                                                        />
                                                                        <div className="mt-2">
                                                                            <NoteImageUpload
                                                                                images={note.images ?? []}
                                                                                onChange={(images) => updateCaseImages(jobProgress.id, task.id, note.id, images)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeCase(jobProgress.id, task.id, note.id)}
                                                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                                                        <Trash2 className="h-4 w-4"/>
                                                                        <span className="sr-only">Hapus Masalah</span>
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                    Daftar Pekerjaan masih kosong. Silahkan tambahkan pekerjaan dulu.
                </div>
            )}
        </div>
    )
}

export default CaseForm
