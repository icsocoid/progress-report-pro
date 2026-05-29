import { Button } from "@/components/ui/button";
import type {DataProgress} from "@/utils/vartype.ts";
import {AlertTriangle, PlusCircle, Trash2, X} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import { Textarea } from "@/components/ui/textarea";
import {useEffect} from "react";
import {convertIndonesiaFormat} from "@/utils/helpers.ts";
import type {JobTask} from "@/models/job.ts";
import {useToast} from "@/hooks/use-toast.ts";

const TodoPekerjaanForm = ({dataProgress, setDataProgress}: DataProgress) => {

    //fungsi buat hapus dari array jika ada pekerjaan yang sudah tercentang
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

    const handleRemoveJob = (jobId: string) => {
        setDataProgress(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                spk: {
                    ...prev.spk,
                    job: prev.spk.job.filter(job => job.id !== jobId)
                }
            }
        })
    }

    const addNoteToTask = (jobId: string, parentTaskId: string, todoId?: string) => {
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
                                tasks: job.tasks.map(task => {
                                    if (task.id === parentTaskId) {
                                        // Jika todoId ada, tambahkan note ke todo (child task)
                                        if (todoId && task.todo) {
                                            return {
                                                ...task,
                                                todo: task.todo.map(td =>
                                                    td.id === todoId
                                                        ? {
                                                            ...td,
                                                            job_task_note: [
                                                                ...(td.job_task_note ?? []),
                                                                { id: crypto.randomUUID(), note: "" }
                                                            ]
                                                        }
                                                        : td
                                                )
                                            };
                                        }
                                        // Jika tidak ada todoId, tambahkan ke task utama
                                        return {
                                            ...task,
                                            job_task_note: [
                                                ...(task.job_task_note ?? []),
                                                { id: crypto.randomUUID(), note: "" }
                                            ]
                                        };
                                    }
                                    return task;
                                })
                            }
                            : job
                    )
                }
            };
        });
    };

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
                                tasks: job.tasks.map(task => {
                                    // Cek apakah note ada di task utama
                                    if (task.id === taskId && task.job_task_note) {
                                        return {
                                            ...task,
                                            job_task_note: task.job_task_note.map(note =>
                                                note.id === noteId
                                                    ? { ...note, note: newValue }
                                                    : note
                                            )
                                        };
                                    }

                                    // Cek apakah note ada di dalam todo (child tasks)
                                    if (task.todo) {
                                        const updatedTodo = task.todo.map(td => {
                                            if (td.id === taskId && td.job_task_note) {
                                                return {
                                                    ...td,
                                                    job_task_note: td.job_task_note.map(note =>
                                                        note.id === noteId
                                                            ? { ...note, note: newValue }
                                                            : note
                                                    )
                                                };
                                            }
                                            return td;
                                        });

                                        return {
                                            ...task,
                                            todo: updatedTodo
                                        };
                                    }

                                    return task;
                                })
                            }
                            : job
                    )
                }
            };
        });
    };

    const removeNote = (jobId: string, taskId: string, noteId: string) => {
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
                                tasks: job.tasks.map(task => {
                                    // Cek apakah note ada di task utama
                                    if (task.id === taskId && task.job_task_note) {
                                        return {
                                            ...task,
                                            job_task_note: task.job_task_note.filter(note => note.id !== noteId)
                                        };
                                    }

                                    // Cek apakah note ada di dalam todo (child tasks)
                                    if (task.todo) {
                                        const updatedTodo = task.todo.map(td => {
                                            if (td.id === taskId && td.job_task_note) {
                                                return {
                                                    ...td,
                                                    job_task_note: td.job_task_note.filter(note => note.id !== noteId)
                                                };
                                            }
                                            return td;
                                        });

                                        return {
                                            ...task,
                                            todo: updatedTodo
                                        };
                                    }

                                    return task;
                                })
                            }
                            : job
                    )
                }
            };
        });
    };
    const handleTaskCheckChange = (jobId: string, taskId: string, checked: boolean) => {

        setDataProgress(prevReport => ({
            ...prevReport,
            spk: {
                ...prevReport.spk,
                job: prevReport.spk.job.map(job =>
                    job.id === jobId
                        ? {
                            ...job,
                            tasks: job.tasks.map(task =>
                                task.id === taskId
                                    ? { ...task, completed: checked, status_task: checked ? "1" : "0" }
                                    : task
                            )
                        }
                        : job
                )
            }
        }))
    }

    const { toast } = useToast()

    return (
        <div>
            {dataProgress.spk.job.length > 0 ? (
                <div className="grid gap-6">
                    {dataProgress.spk.job.map((jobProgress) => {
                        return (
                            <div key={jobProgress.id} className="border rounded-md overflow-hidden">
                                <div className="bg-muted p-4 flex items-center justify-between">
                                    <h4 className="font-medium">{jobProgress?.jasa.product_name || "New Job"}</h4>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveJob(jobProgress.id)}>
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove job</span>
                                    </Button>
                                </div>

                                <div className="p-4">
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-sm font-medium">Tasks</h5>

                                        </div>

                                        <div className="border rounded-md divide-y">
                                            {jobProgress.tasks.map((task) => {
                                                const allOldTasksForThisId = dataProgress.old_job?.flatMap((oldJob) =>
                                                    oldJob.tasks.filter(t => t.job_task_id === task.id)
                                                ) || [];

                                                // cek jika ada tanggal_selesai !== ""
                                                const isCompletedSomewhere = allOldTasksForThisId.find(t => t.tanggal_selesai !== "");
                                                if(isCompletedSomewhere) return null;
                                                return (
                                                    <div key={task.id} className="p-4">
                                                        <div className="grid gap-4">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="gap-3">
                                                                    <Checkbox
                                                                        id={`task-${task.id}`}
                                                                        checked={task?.completed || false}
                                                                        onCheckedChange={(checked) => {
                                                                            const hasNote = task.job_task_note?.some((note) => note.note?.trim() !== "") ?? false;

                                                                            // Hanya izinkan centang jika sudah ada isi note
                                                                            if (checked && !hasNote) {
                                                                                toast({
                                                                                    title: "Peringatan!",
                                                                                    description:  "Silahkan isi todo pekerjaan terlebih dahulu",
                                                                                    duration: 3000,
                                                                                    action: (
                                                                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                                                                    ),
                                                                                })
                                                                                return;
                                                                            }
                                                                            handleTaskCheckChange(task.job_id, task.id, checked as boolean)
                                                                        }}
                                                                    />
                                                                    <label
                                                                        htmlFor={`task-${task.id}`}
                                                                        className="mx-1 font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        {task.task_name}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                            {

                                                                task.todo && task.todo.length > 0 && task.todo.map((tsk) => {
                                                                    return(
                                                                        <>
                                                                        <div className="flex items-center justify-between gap-3 mb-2">
                                                                            <div className="gap-3">
                                                                                <Checkbox
                                                                                    id={`task-${tsk.id}`}
                                                                                />
                                                                                <label
                                                                                    htmlFor={`task-${tsk.id}`}
                                                                                    className="mx-1 font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                                >
                                                                                    {tsk.task_name}
                                                                                </label>
                                                                            </div>
                                                                            <Button type="button" variant="outline" size="sm" onClick={() => addNoteToTask(jobProgress.id, task.id, tsk.id)}>
                                                                                <PlusCircle className="h-4 w-4 mr-2"/>
                                                                                Tambah
                                                                            </Button>
                                                                        </div>
                                                                        {tsk.job_task_note && tsk.job_task_note.length > 0 && (
                                                                            <div className="ml-8 space-y-2">
                                                                                {tsk.job_task_note.map((note, index) => (
                                                                                    <div key={note.id} className="flex items-center gap-2">
                                                                                        <div className="flex-1">
                                                                                            <Textarea
                                                                                                placeholder="Keterangan..."
                                                                                                value={note.note || ""}
                                                                                                onChange={(e) =>
                                                                                                    updateNote(jobProgress.id, tsk.id, note.id, e.target.value)
                                                                                                }
                                                                                                className="min-h-[80px]"
                                                                                            />
                                                                                        </div>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => removeNote(jobProgress.id, tsk.id, note.id)}
                                                                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4"/>
                                                                                            <span className="sr-only">Remove note</span>
                                                                                        </Button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        </>
                                                                    )
                                                                })
                                                            }
                                                                {dataProgress.old_job &&
                                                                    dataProgress.old_job.length > 0 &&
                                                                    dataProgress.old_job.flatMap((jb) =>
                                                                        jb.tasks
                                                                            .filter((t) => t.job_task_id === task.id)
                                                                            .flatMap((t) =>
                                                                                t.job_task_note.map((note) => (
                                                                                    <div key={note.id} className="flex items-center justify-between gap-2">
                                                                                        <div className="flex-1">
                                                                                            <p className="text-sm text-foreground mb-3">{note.note || ""}</p>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <p className="text-sm text-foreground mb-3">{jb.progress_report.nomor} {convertIndonesiaFormat(jb.progress_report.tanggal)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            )
                                                                    )}

                                                                {/* Tampilkan notes untuk todo ini */}

                                                            </div>

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

export default TodoPekerjaanForm