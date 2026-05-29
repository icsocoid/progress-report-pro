import {useEffect, useState} from "react";
import {useToast} from "@/hooks/use-toast.ts";
import axios from "axios";
import {AlertTriangle, ArrowUpDown, Check, Trash} from "lucide-react";
import type {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {convertIndonesiaFormat} from "@/utils/helpers.ts";
import {GenericPaginatedTable} from "@/components/GenericPaginatedTable.tsx";
import DeleteConfirmation from "@/components/DeleteConfirmation.tsx";
import {InitTodo, type Todo} from "@/models/todo.ts";

const TodoList = () => {
    const apiUrl = import.meta.env.VITE_API_URL
    const [todo, setTodo] = useState<Todo[]>([])
    const [loading, setLoading] = useState(true)
    const [globalFilter, setGlobalFilter] = useState("")
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [totalPages, setTotalPages] = useState(1)
    const { toast } = useToast()
    const [isDeleteTodoOpen, setDeleteTodoOpen] = useState(false)
    const [dataSelected, setDataSelected] = useState(InitTodo)

    const onDeleteAction = (input: Todo) => {
        setDataSelected(input)
        setDeleteTodoOpen(true)
    }

    const onConfirmDeleteAction = async () => {
        try {
            const res = await axios.delete(`${apiUrl}/api/todo/delete/${dataSelected.id}`)
            if (res.data.status) {
                toast({ title: "Todo berhasil dihapus!", action: <Check className="h-4 w-4 text-green-600" /> })
                fetchTodo()
            } else {
                toast({ title: "Peringatan!", description: res.data.message, action: <AlertTriangle className="h-4 w-4 text-red-600" /> })
            }
        } catch {
            toast({ title: "Peringatan!", description: "Gagal menghapus data.", action: <AlertTriangle className="h-4 w-4 text-red-600" /> })
        } finally {
            setDeleteTodoOpen(false)
        }
    }

    const fetchTodo = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${apiUrl}/api/todo/list`, {
                params: { page: pagination.pageIndex + 1, per_page: pagination.pageSize },
            })
            setTodo(res.data.data)
            setTotalPages(res.data.last_page)
        } catch (err) {
            console.error("Error fetching temuan", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTodo()
    }, [pagination, globalFilter])

    const goToDetailPage = (row: Todo) => {
        window.open(`/todo/detail/${row.id}`, "_blank")
    }

    const columns: ColumnDef<Todo>[] = [
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
            accessorKey: "user.employee_name",
            header: "Pembuat",
            cell: ({ row }) => <div>{row.original.user.employee_name}</div>,
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
            <GenericPaginatedTable<Todo>
                title="Todo"
                description="Daftar Todo"
                data={todo}
                columns={columns}
                loading={loading}
                pagination={pagination}
                totalPages={totalPages}
                setPagination={setPagination}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onRowClick={goToDetailPage}
                addUrl={`/addtodo`}
            />
            {isDeleteTodoOpen && (
                <DeleteConfirmation
                    showModal={isDeleteTodoOpen}
                    onClose={() => setDeleteTodoOpen(false)}
                    onSubmit={onConfirmDeleteAction}
                />
            )}
        </>
    )
}

export default TodoList