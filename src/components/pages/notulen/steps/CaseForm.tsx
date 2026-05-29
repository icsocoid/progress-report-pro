import type {DataTemuan} from "@/utils/vartype.ts";
import {Button} from "@/components/ui/button.tsx";
import {PlusCircle, Trash2} from "lucide-react";
import {Textarea} from "@/components/ui/textarea.tsx";
import {createTemuanNote} from "@/models/temuan.ts";

const CaseForm = ({dataTemuan, setDataTemuan}: DataTemuan) => {
    const removeNote = (noteId: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    note: prevData.note.filter(note => note.id !== noteId)
                }
            }
        )
    }

    const addNote = (taskId: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    note: [...(prevData.note || []), createTemuanNote(taskId)]
                }
            }
        )
    }

    const updateNote = (noteId: string,newValue: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    note: prevData.note.map(catatan =>
                        catatan.id === noteId ? { ...catatan, note: newValue } : catatan
                    )
                }
            }
        )
    }

    return (
        <div className="grid gap-6">
            <div key={dataTemuan.job_id} className="border rounded-md overflow-hidden">
                <div className="p-4">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Temuan</h5>

                        </div>

                        <div className="border rounded-md divide-y">
                            {
                                dataTemuan.job && dataTemuan.job.tasks && dataTemuan.job.tasks.length > 0 && dataTemuan.job.tasks.map((task) => {
                                    return(
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
                                                            onClick={() => addNote(task.id)}>
                                                        <PlusCircle className="h-4 w-4 mr-2"/>
                                                        Tambah
                                                    </Button>
                                                </div>
                                                {
                                                    dataTemuan.note && dataTemuan.note.length > 0 && dataTemuan.note.map(note => (
                                                        note.job_task_id === task.id ? <div key={note.id} className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <Textarea
                                                                    placeholder="Tulis Note..."
                                                                    value={note.note}
                                                                    onChange={(e) => updateNote(note.id, e.target.value)}
                                                                    className="min-h-[80px] resize-none"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeNote(note.id)}
                                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                                <span className="sr-only">Remove Temuan</span>
                                                            </Button>
                                                        </div> : null
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                })

                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )

}

export default CaseForm
