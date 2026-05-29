import type React from "react"
import type { FC } from "react"

import {useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {AlertTriangle, Check, Loader2, PlusCircle, Trash2} from "lucide-react"
import {InitJasa, InitProgress, type Jasa, type Job, type JobTask} from "@/models/job.ts";
import { useToast } from "@/hooks/use-toast"
import axios from "axios";
import {SearchableSelect} from "@/components/SearchableSelect.tsx";
import {useUser} from "@/models/user.ts";
import {makeTodoTask} from "@/models/todo.ts";

type JobsProps = {
    jobData: Job,
    onSuccess: (cond: boolean) => void
}

export const AddJobForm: FC<JobsProps> = (props) => {
    const [jobName, setJobName] = useState<Jasa>(InitJasa)
    const [tasks, setTasks] = useState<{ id: string; task_name: string, todo: JobTask[] }[]>([{ id: crypto.randomUUID(), task_name: "", todo: [] }])
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const user = useUser()

    useEffect(() => {
        if(props.jobData.id !== '') {
            setJobName(props.jobData.jasa)
            setSelectedJasa(props.jobData.jasa)
            setTasks(props.jobData.tasks.map((task) => ({ id: task.id, task_name: task.task_name, todo: task.todo ?? [] })))
        }

    }, [props.jobData])

    const urlJasa = user ? `https://${user.asal_pt}/`: 'https://als_pro.icso.biz.id/'

    const addTask = () => {
        setTasks([...tasks, { id: crypto.randomUUID(), task_name: "", todo: [] }])
    }

    const addTodo = (taskId: string) => {
        setTasks(tasks.map((task) =>
            task.id === taskId
                ? { ...task, todo: [...(task.todo || []), makeTodoTask(taskId)] }
                : task
        ))
    }

    const setSelectedJasa = (jasaVar?: Jasa) => {
        setJobName(jasaVar || InitJasa)
    }

    const removeTask = (id: string) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter((task) => task.id !== id))
        }
    }

    const updateTaskName = (id: string, task_name: string) => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, task_name } : task)))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!jobName.product_name) {
            setError("Nama pekerjaan tidak boleh kosong")
            return
        }

        const emptyTasks = tasks.filter((task) => !task.task_name.trim())
        if (emptyTasks.length > 0) {
            setError("Task masih belum ada")
            return
        }

        setError("")

        const formattedTasks: JobTask[] = tasks.map((task) => ({
            id: props.jobData.id !== '' ? task.id : "",
            job_id: "",
            task_name: task.task_name.trim(),
            completed: false,
            job_task_note: [],
            showReply: false,
             todo: task.todo
        }))
        setIsLoading(true)
        // Submit data
        const submitJobs: Job = {jasa: jobName, tasks: formattedTasks, id: props.jobData.id, task_count: 0, created_at: "", description: "", updated_at: "", progress_report: InitProgress}
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/save`, submitJobs);

            if (response.data.status) {
                props.onSuccess(true)
                toast({
                    title: "Pekerjaan berhasil disimpan!",
                    description: `"${jobName.product_name}" dengan ${formattedTasks.length} tasks telah ditambahkan.`,
                    duration: 3000,
                    action: (
                        <Check className="h-4 w-4 text-green-600" />
                    ),
                })

                // You can redirect, show a message, etc.
            } else {
                props.onSuccess(false)
                toast({
                    title: "Peringatan!",
                    description:  response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })

            }
        } catch (error: any) {
            props.onSuccess(false)
            if (error.response && error.response.data) {
                toast({
                    title: "Peringatan!",
                    description:  error.response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })

            } else {
                toast({
                    title: "Peringatan!",
                    description:  error.response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })
            }
        }finally {
            setIsLoading(false); // Stop loading
        }

        // Reset form
        setJobName(InitJasa)
        setTasks([{ id: "", task_name: "", todo: [] }])
    }

    const mapJasa = (jasa: Jasa) => ({
        value: jasa,
        label: `${jasa.product_name} (${jasa.product_code})`,
    })

    const isEqualJasa = (a?: Jasa, b?: Jasa) => a?.id === b?.id

    const updateTodoNote = (taskId: string, todoId: string, note: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? {
                    ...task,
                    todo: task.todo.map(td =>
                        td.id === todoId ? { ...td, task_name: note } : td
                    )
                }
                : task
        ));
    };

    const removeTodo = (taskId: string, todoId: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, todo: task.todo.filter(td => td.id !== todoId) }
                : task
        ));
    };



    return (
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
            {/* Job Name */}
            <div className="grid gap-2">
                <label className="text-sm font-medium">Nama Jasa</label>
                <SearchableSelect<Jasa>
                    apiUrl={`${urlJasa}api/services/search`}
                    value={jobName}
                    placeholder={"Pilih Nama Jasa/Pekerjaan"}
                    onChange={(jasa) => setSelectedJasa(jasa)}
                    mapOption={mapJasa}
                    isEqual={isEqualJasa}
                />
            </div>

            {/* Tasks */}
            <div className="grid gap-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pekerjaan</label>
                    <Button type="button" variant="outline" size="sm" onClick={addTask}>
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        Tambah Pekerjaan
                    </Button>
                </div>

                {tasks.map((task, index) => (
                    <div key={task.id}>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder={`Nama pekerjaan ${index + 1}`}
                                    value={task.task_name}
                                    onChange={(e) => updateTaskName(task.id, e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTask(task.id)}
                                disabled={tasks.length === 1}
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4"/>
                                <span className="sr-only">Remove task</span>
                            </Button>
                        </div>
                        <div className="m-1 flex items-center justify-between">
                            <label className="text-sm font-medium">Todo</label>
                            <Button type="button" variant="outline" size="sm" onClick={() => addTodo(task.id)}>
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                Tambah Todo
                            </Button>
                        </div>
                        <div className="m-2">
                            {
                                task.todo && task.todo.length > 0 ? task.todo.map((td, ind) => (
                                    <div key={ind} className="flex items-center gap-2 mt-1">
                                        <div className="flex-1">
                                            <Input
                                                placeholder={`todo ${task.task_name}`}
                                                value={td.task_name}
                                                onChange={(e) => updateTodoNote(task.id, td.id, e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTodo(task.id, td.id)}
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                            <span className="sr-only">Remove</span>
                                        </Button>
                                    </div>
                                )) : null
                            }
                        </div>
                    </div>
                ))}
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                    </>
                ) : (
                "Simpan"
                )}
            </Button>
        </form>
    )
}
