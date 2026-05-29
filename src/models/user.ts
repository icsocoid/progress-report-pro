import {useMemo} from "react";

export interface User {
    id: string
    employee_name: string
    email: string
    npwmp: string
    phone: string
    address: string
    asal_pt: string
    is_partner: number
    ktp: string
    jabatan: JabatanUser
}


export interface JabatanUser {
    id: string
    kode_jabatan: string
    nama_jabatan: string
    tingkat: number
}

export const InitJabatan: JabatanUser = {
    id: '',
    kode_jabatan: '',
    nama_jabatan: '',
    tingkat: 0
}

export const InitUser: User = {
    id: '',
    employee_name: '',
    email: '',
    npwmp: '',
    phone: '',
    address: '',
    asal_pt: '',
    is_partner: 0,
    ktp: '',
    jabatan: InitJabatan
}



export const useUser = (): User | null => {
    return useMemo(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                return JSON.parse(storedUser) as User;
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
            }
        }
        return null;
    }, []);
};