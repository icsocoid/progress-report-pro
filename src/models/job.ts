import type {FileWithPreview} from "@/models/progress.ts";
import type {SolusiNote} from "@/models/solusi.ts";
// import type {TodoTask} from "@/models/todo.ts";

export interface Progress {
    id: string
    tanggal: string
    nomor: string
    no_spk: string
    client_code: string
    bulan: string
    tahun: string
    created_at: string
    updated_at: string
    user_id: string
    status_progress: string
    jenis_spk: string
    nama_jasa: string
    periode_spk: string

}

export interface Job {
    id: string
    description: string
    created_at: string
    updated_at: string
    task_count: number
    todo_count?: number
    jasa: Jasa
    tasks: JobTask[]
    task_done?: JobTask[]
    progress_report:Progress
}

export const InitProgress: Progress = {
    bulan: "",
    client_code: "",
    created_at: "",
    id: "",
    jenis_spk: "",
    nama_jasa: "",
    no_spk: "",
    nomor: "",
    periode_spk: "",
    status_progress: "",
    tahun: "",
    tanggal: "",
    updated_at: "",
    user_id: ""

}


export interface Jasa {
    id: string
    product_code: string
    product_name: string
    descriptions: string
    product_price: number
}

export const InitJasa: Jasa = {
    descriptions: "", id: "", product_code: "", product_name: "", product_price: 0

}

export const InitJob: Job = {
    progress_report: InitProgress,
    task_count: 0,
    todo_count: 0,
    jasa: InitJasa,
    tasks: [],
    id: '',
    description: '',
    created_at: '',
    updated_at: ''
}

export interface Spk {
    id: string
    no_spk: string
    tanggal: string
    customer_code: string
    customer_name: string
    jenis: string
    periode: string
    nama_jasa: string
    job: Job[]
    periode_spk: string
    periode_akhir: string
}

export const InitSpk: Spk = {
    job: [],
    nama_jasa: "", periode_spk: "",
    jenis: "", periode: "", periode_akhir: "",
    id: '',
    no_spk: '',
    tanggal: '',
    customer_code: '',
    customer_name: ''
}

export interface JobTask {
    id: string
    job_id: string
    task_name: string
    completed: boolean
    parent_id?: string
    todo_id?: string
    status_task?: string
    job_task_id?:string
    job_task_note: JobTaskNote[]
    todo?: JobTask[]
    kasus?: JobTaskNote[]
    reply?: ReplyNote[]
    showReply: boolean
    replyContent?: string
    isCollapsed?: boolean
    tanggal_selesai?: string
}

export const InitJobTask: JobTask = {
    showReply: false,
    id: '',
    job_id: '',
    task_name: '',
    status_task: '0',
    completed: false,
    job_task_note: [],
    kasus: []

}

export interface Note {
    id: string
    note: string
    task_todo_id?: string
}

export interface JobTaskNote extends Note{
    solusi?: SolusiNote[] | string
    reply?: ReplyNote[]
    showReply?: boolean
    replyContent?: string
    isCollapsed?: boolean
    images?: FileWithPreview[]
    image_index?: number
}

export interface ReplyNote extends Note{
    progress_case_id: string
}

export const InitNote: Note = {
    id: crypto.randomUUID(), note: ""
}

export const InitJobTaskNote: JobTaskNote = {
    id: crypto.randomUUID(), note: ""
}
