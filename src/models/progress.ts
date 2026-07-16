import {InitJobTask, InitSpk, type Job, type JobTask, type Note, type Spk} from "@/models/job.ts"
import {type Client, InitClient} from "@/models/client.ts";
import type {User} from "@/models/user.ts";




export interface ProgressReport {
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
    client: Client
    jenis_spk: string
    nama_jasa: string
    periode_spk: string
    spk: Spk
    spks?: Spk[]
    informasi_lain: Note[]
    files: FileWithPreview[]
    progress_job_task: ProgressReportTask[]
    job_progress: JobProgress[]
    tanggal_periode: Date | null | undefined,
    old_job ?: Job[]
    masalah?: Masalah[]
    pembuat?: User
    approval_history?: ApprovalHistory
    upload_bukti?: UploadBukti | null
}

export interface ApprovalHistory  {
    id: number,
    progress_report_id: number,
    status_progress: string,
    approval_note: string,
    approved_by: number,
    approved_by_name: string,
    asal_pt: string,
    created_at: string,
    updated_at: string
}

export interface UploadBukti {
    id: number
    progress_report_id: number
    file_path: string
    original_name: string
    mime_type: string
    size: number
    created_at: string
    updated_at: string
    preview_url: string
}

export interface JobProgress {
    job_id: string
    tasks: JobTask[]
    task_progress: ProgressReportTask[]
}

export const InitProgressReport: ProgressReport = {
    files: [], informasi_lain: [],
    tanggal_periode: undefined,
    nama_jasa: "", periode_spk: "",
    spk: InitSpk,
    jenis_spk: "",
    job_progress: [],
    status_progress: "",
    client: InitClient,
    tanggal: "",
    progress_job_task: [],
    bulan: "", client_code: "", created_at: "", id: "", no_spk: "", nomor: "", tahun: "", updated_at: "", user_id: "",
    old_job:[],
    upload_bukti: null
}

export interface ProgressReportTask {
    id: string
    progress_report_id: string
    job_task_id: string
    task_status: string
    completed: boolean
    keterangan: string
    tanggal_selesai: string
    job_task: JobTask
}

export interface FileWithPreview {
    preview?: string
    progress?: number
    id: string
    file: File,
    name?: string,
    size?: number
    type?: string
}

export const InitProgressReportTask: ProgressReportTask = {
    job_task: InitJobTask,
    completed: false,
    id: "",
    progress_report_id: "",
    job_task_id: "",
    task_status: "",
    keterangan: "",
    tanggal_selesai: ""
}

export interface PaginatedProgress {
    data: ProgressReport[]
    client?: Client[]
    current_page: number
    last_page: number
    total: number
}

interface Masalah{
    id: string
    progress_report_id: string
    note: string
    job_task: JobTask
    solusi?: string
}
