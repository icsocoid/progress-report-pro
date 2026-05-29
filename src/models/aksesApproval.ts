import type { User } from "@/models/user";

export interface AksesApproval {
    id: number;
    asal_pt: string;
    nama_karyawan?: string;
    user_id?: string;
    user_ids: string[];
    users?: User[];
    create_at?: string;
    update_at?: string;
    created_at?: string;
    updated_at?: string;
}




export const InitAksesApproval: AksesApproval = {
    id: 0,
    asal_pt: "",
    nama_karyawan: "",
    user_id: "",
    user_ids: [],
    users: [],
    create_at: "",
    update_at: "",
    created_at: "",
    updated_at: "",
};
