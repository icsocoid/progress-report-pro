import {type Client, InitClient} from "@/models/client.ts"

export interface Representative {
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
    job_task: JobTask[]
    progress: PeriodeProgress[]
}

interface PeriodeProgress{
    periode: JobTaskPeriode
}

interface JobTaskPeriode{
    bulan: string
    tahun: string
    task: Progress[]
    informasi: informasi[]
}

interface informasi {
    id: string
    progress_report_id: string
    note: string
}

interface Progress {
    id: string
    task_name: string
    job_id: string
    selesai: string
    progress: Masalah[]
}

interface JobTask {
    id: string
    task_name: string
    job_id: string
    masalah: Masalah[]
}

interface Masalah{
    id: string
    progress_report_id: string
    note: string
    job_task_id: string
    progress_job_task_id: string
    solusi: string
    nomor: string
    tanggal: string
}

export const InitRepresentative: Representative = {
    bulan: "",
    client: InitClient,
    client_code: "",
    created_at: "",
    id: "",
    job_task: [],
    no_spk: "",
    nomor: "",
    status_progress: "",
    tahun: "",
    tanggal: "",
    updated_at: "",
    user_id: "",
    progress: []

}