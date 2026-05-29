import {type Client, InitClient} from "@/models/client.ts";
import type {User} from "@/models/user.ts";

export interface Solusi {
    id: string
    nomor: string
    tanggal: string
    client_code: string
    client: Client
    kasus: Kasus[]
    solusi_items: SolusiNote[]
    user_id: string
    created_at: string
    updated_at: string
    pembuat?: User
}

export const InitSolusi: Solusi = {
    solusi_items: [],
    kasus: [],
    id: '',
    nomor: '',
    tanggal: '',
    user_id: '',
    client_code: '',
    client: InitClient,
    created_at: '',
    updated_at: ''
}

export interface SolusiNote {
    id: string
    progress_report_case_id: string
    progress_solusi_id: string
    note: string
}

export interface KasusSolusi{
    job_task_id: string
    notes: Kasus[]
    task_name: string
}

export interface Kasus {
    id: string
    progress_report_id: string
    note: string
    nomor: string
    tanggal: string
    solusi: SolusiNote[]
    reply?: Reply[]
    tipe?: string
    temuan_id?: string
    temuan?: string
    bulan?: string
    tahun?: string
    isCollapsed?: boolean
    showReply?: boolean
    replyContent?: string
}

export const InitSolusiNote: SolusiNote = {
    progress_report_case_id: "",
    id: '',
    progress_solusi_id: '',
    note: ''
}

interface Reply {
    id: string
    progress_case_id: string
    note: string
}

export interface DetailKasus {
    job_task_id: string
    task_name: string
    notes: Kasus[]
}