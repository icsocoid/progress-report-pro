import {useEffect, useState} from "react";
import {InitTemuan, type Temuan} from "@/models/temuan.ts";
import {useToast} from "@/hooks/use-toast.ts";
import {
    type ColumnDef,
} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {AlertTriangle, ArrowUpDown, Check, Trash} from "lucide-react";
import {convertIndonesiaFormat} from "@/utils/helpers.ts";
import axios from "axios";
import DeleteConfirmation from "@/components/DeleteConfirmation.tsx";
import {GenericPaginatedTable} from "@/components/GenericPaginatedTable.tsx";
import {SOLUSITYPE} from "@/utils/vartype.ts";

const NotulenList= () => {

    const apiUrl = import.meta.env.VITE_API_URL
    const [temuan, setTemuan] = useState<Temuan[]>([])
    const [loading, setLoading] = useState(true)
    const [globalFilter, setGlobalFilter] = useState("")
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [totalPages, setTotalPages] = useState(1)
    const { toast } = useToast()
    const [isDeleteTemuanOpen, setDeleteTemuanOpen] = useState(false)
    const [dataSelected, setDataSelected] = useState(InitTemuan)

    const onDeleteAction = (temu: Temuan) => {
        setDataSelected(temu)
        setDeleteTemuanOpen(true)
    }

    const onConfirmDeleteAction = async () => {
        try {
            const res = await axios.delete(`${apiUrl}/api/temuan/delete/${dataSelected.id}`)
            if (res.data.status) {
                toast({ title: "Temuan berhasil dihapus!", action: <Check className="h-4 w-4 text-green-600" /> })
                fetchTemuan()
            } else {
                toast({ title: "Peringatan!", description: res.data.message, action: <AlertTriangle className="h-4 w-4 text-red-600" /> })
            }
        } catch {
            toast({ title: "Peringatan!", description: "Gagal menghapus data.", action: <AlertTriangle className="h-4 w-4 text-red-600" /> })
        } finally {
            setDeleteTemuanOpen(false)
        }
    }

    const fetchTemuan = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${apiUrl}/api/temuan/list`, {
                params: { page: pagination.pageIndex + 1, per_page: pagination.pageSize, tipe: SOLUSITYPE.NOTULEN },
            })
            setTemuan(res.data.data)
            setTotalPages(res.data.last_page)
        } catch (err) {
            console.error("Error fetching temuan", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTemuan()
    }, [pagination, globalFilter])

    const goToDetailPage = (row: Temuan) => {
        window.open(`/notulen/detail/${row.id}`, "_blank")
    }

    const columns: ColumnDef<Temuan>[] = [
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
            <GenericPaginatedTable<Temuan>
                title="Notulen Meeting"
                description="Daftar Notulen Meeting"
                data={temuan}
                columns={columns}
                loading={loading}
                pagination={pagination}
                totalPages={totalPages}
                setPagination={setPagination}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onRowClick={goToDetailPage}
                addUrl={`/addnotulen`}
            />
            {isDeleteTemuanOpen && (
                <DeleteConfirmation
                    showModal={isDeleteTemuanOpen}
                    onClose={() => setDeleteTemuanOpen(false)}
                    onSubmit={onConfirmDeleteAction}
                />
            )}
        </>
    )
}

export default NotulenList