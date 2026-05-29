export interface Client {
    id: string
    company_name: string
    address: string
    phone: string
    email: string
    npwmp: string
    customer_code: string
    customer_name: string
}

export const InitClient: Client ={
    id: '',
    company_name: '',
    address: '',
    phone: '',
    email: '',
    npwmp: '',
    customer_code: '',
    customer_name: ''
}

export interface PaginatedClients {
    data: Client[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}