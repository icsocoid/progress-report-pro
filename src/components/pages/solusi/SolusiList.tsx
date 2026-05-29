import {
    type ColumnDef
} from "@tanstack/react-table"
import {ArrowUpDown, Check, AlertTriangle, Trash} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import {InitSolusi, type Solusi} from "@/models/solusi.ts"
import {convertIndonesiaFormat} from "@/utils/helpers.ts"
import {useToast} from "@/hooks/use-toast.ts"
import {useEffect, useState} from "react"
import DeleteConfirmation from "@/components/DeleteConfirmation.tsx"
import {GenericPaginatedTable} from "@/components/GenericPaginatedTable.tsx"

// Define the columns for the table


const SolusiTable = () => {

    const apiUrl = import.meta.env.VITE_API_URL
    const [solusi, setSolusi] = useState<Solusi[]>([])
    const [loading, setLoading] = useState(true)
    const [globalFilter, setGlobalFilter] = useState("")
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [totalPages, setTotalPages] = useState(1)
    const { toast } = useToast()
    const [isDeleteSolusiOpen, setDeleteSolusiOpen] = useState(false)
    const [dataSelected, setDataSelected] = useState(InitSolusi)

    const onDeleteAction = (sol: Solusi) => {
        setDataSelected(sol)
        setDeleteSolusiOpen(true)
    }

    const onConfirmDeleteAction = async () => {
        try {
            const res = await axios.delete(`${apiUrl}/api/solusi/delete/${dataSelected.id}`)
            if (res.data.status) {
                toast({ title: "Solusi berhasil dihapus!", action: <Check className="h-4 w-4 text-green-600" /> })
                fetchSolusi()
            } else {
                toast({ title: "Peringatan!", description: res.data.message, action: <AlertTriangle className="h-4 w-4 text-red-600" /> })
            }
        } catch {
            toast({ title: "Peringatan!", description: "Gagal menghapus data.", action: <AlertTriangle className="h-4 w-4 text-red-600" /> })
        } finally {
            setDeleteSolusiOpen(false)
        }
    }

    const fetchSolusi = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${apiUrl}/api/solusi/list`, {
                params: { page: pagination.pageIndex + 1, per_page: pagination.pageSize },
            })
            setSolusi(res.data.data)
            setTotalPages(res.data.last_page)
        } catch (err) {
            console.error("Error fetching solusi", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSolusi()
    }, [pagination, globalFilter])

    const goToDetailPage = (row: Solusi) => {
        window.open(`/solusi/detail/${row.id}`, "_blank")
    }

    const columns: ColumnDef<Solusi>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "tanggal",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Tanggal <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{convertIndonesiaFormat(row.original.tanggal)}</div>,
        },
        {
            accessorKey: "nomor",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Nomor <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.original.nomor}</div>,
        },
        {
            accessorKey: "client.company_name",
            header: "Client",
            cell: ({ row }) => <div>{row.original.client.company_name}</div>,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button onClick={(e) => { e.stopPropagation(); onDeleteAction(row.original) }} variant="ghost" className="h-8 w-8 p-0">
                    <Trash className="h-4 w-4" />
                </Button>
            ),
        },
    ]

    return (
        <>
            <GenericPaginatedTable<Solusi>
                title="Solusi"
                description="Daftar Temuan & Solusi"
                data={solusi}
                columns={columns}
                loading={loading}
                pagination={pagination}
                totalPages={totalPages}
                setPagination={setPagination}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onRowClick={goToDetailPage}
                addUrl={`/addsolusi`}
            />
            {isDeleteSolusiOpen && (
                <DeleteConfirmation
                    showModal={isDeleteSolusiOpen}
                    onClose={() => setDeleteSolusiOpen(false)}
                    onSubmit={onConfirmDeleteAction}
                />
            )}
        </>
    )
}

export default SolusiTable
