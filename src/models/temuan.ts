import {type Client, InitClient} from "@/models/client.ts";
import type {FileWithPreview} from "@/models/progress.ts";
import type {Job, JobTask, Note} from "@/models/job.ts";
import type {User} from "@/models/user.ts";

export interface Temuan{
    id: string
    nomor: string
    tanggal: string
    client_code: string
    client: Client
    user_id: string
    note: TemuanNote[]
    files?: FileWithPreview[]
    team?: NotulenTim[]
    created_at: string
    updated_at: string
    job_id?: string
    job?: Job
    informasi_lain?: Note[]
    pembuat?: User
}

export const InitTemuan: Temuan = {
    client: InitClient,
    client_code: "",
    created_at: "",
    id: "",
    nomor: "",
    note: [],
    files: [],
    tanggal: "",
    updated_at: "",
    user_id: ""

}

export interface TemuanNote {
    id: string
    temuan_id: string
    note: string
    job_task_id?: string
    job_task?: JobTask & {
        parent?: JobTask
    }
    solusi?: string
    reply?: TemuanNoteReply[]
}

export const InitTemuanNote: TemuanNote = {
    id: crypto.randomUUID(), note: "", temuan_id: ""

}

export const createTemuanNote = (jobId: string): TemuanNote => ({
    id: crypto.randomUUID(),
    note: "",
    temuan_id: "",
    job_task_id: jobId
})

export interface TemuanNoteReply {
    id: string
    temuan_note_id: string
    note: string
    user_id: string
    created_at: string
    updated_at: string
}

export const InitTemuanNoteReply: TemuanNote = {
    id: "", note: "", temuan_id: ""

}

export interface TemuanFile {
    id: string
    temuan_id: string
    file_path: string
    original_name: string
    created_at: string
    updated_at: string
}

export const InitTemuanFile: TemuanFile = {
    created_at: "", file_path: "", id: "", original_name: "", temuan_id: "", updated_at: ""

}

export interface NotulenTim {
    id: string
    temuan_id: string
    nama: string
}

export const createNotulenTim = (): NotulenTim => ({
    id: crypto.randomUUID(),
    nama: "",
    temuan_id: ""
})
