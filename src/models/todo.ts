import {type Client, InitClient} from "@/models/client.ts";
import type {Job, JobTask} from "@/models/job.ts";
import {InitUser, type User} from "@/models/user.ts";

export interface Todo{
    id: string
    nomor: string
    tanggal: string
    client_code: string
    client: Client
    user_id: string
    created_at: string
    updated_at: string
    job_id?: string
    job?: Job
    tasks: JobTask[]
    user: User
}

export interface TodoTask {
    id: string
    todo_id: string
    note: string
    job_task_id: string
    status_progress: string
}

export interface TodoList {
    tanggal: string
    task: TodoTask
}

export const InitTodo: Todo = {
    user: InitUser,
    client: InitClient, client_code: "", created_at: "", id: "", nomor: "", tanggal: "", updated_at: "", user_id: "", tasks: []

}

export const createTodoTask=(jobTaskId: string): TodoTask =>({
    id: crypto.randomUUID(),
    todo_id: "",
    note: "",
    job_task_id: jobTaskId,
    status_progress: ""
})

export const makeTodoTask=(jobTaskId: string): JobTask =>({
    id: crypto.randomUUID(),
    todo_id: "",
    task_name: "",
    parent_id: jobTaskId,
    job_id: "",
    completed: false,
    job_task_note: [],
    showReply: false
})