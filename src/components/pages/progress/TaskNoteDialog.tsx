// components/TaskNoteDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {ArrowUpDown} from "lucide-react";
import * as React from "react";
import {
    type ColumnDef
} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import type {TodoList} from "@/models/todo.ts";
import {convertIndonesiaFormat} from "@/utils/helpers.ts";
import axios from "axios";
import {useEffect, useState} from "react";
import {GenericPaginatedTable} from "@/components/GenericPaginatedTable.tsx";
import {toast} from "@/hooks/use-toast.ts";

interface TaskNoteDialogProps {
    open: boolean
    onOpenChange: (val: boolean) => void
    onSelectedRows: (jobId: string, taskId: string, note: string, taskTodoId: string) => void
    task_id: string
    job_id: string
    client_code: string
}

export function TaskNoteDialog({ open, onOpenChange, task_id, job_id, onSelectedRows, client_code }: TaskNoteDialogProps) {
    const [todoList, setTodoList] = React.useState<TodoList[]>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const apiUrl = import.meta.env.VITE_API_URL
    const [selectedRows, setSelectedRows] = useState<TodoList[]>([]);

    const fetchTodoNote = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${apiUrl}/api/todo/pending-tasks/${task_id}`, {
                params: { page: pagination.pageIndex + 1, per_page: pagination.pageSize, client_code: client_code },
            })
            setTodoList(res.data.data.data)
            setTotalPages(res.data.last_page)
        } catch (err) {
            console.error("Error fetching solusi", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTodoNote()
    }, [task_id, pagination, globalFilter])

    const columns: ColumnDef<TodoList>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
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
            accessorKey: "task.note",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Note <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.original.task.note}</div>,
        },
    ]

    const goToDetailPage = () => {

    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Daftar Todo: {task_id}</DialogTitle>
                </DialogHeader>
                <div className="overflow-x-auto">
                    <GenericPaginatedTable<TodoList>
                        title="Solusi"
                        description="Daftar Temuan & Solusi"
                        data={todoList}
                        columns={columns}
                        loading={loading}
                        pagination={pagination}
                        totalPages={totalPages}
                        setPagination={setPagination}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        onRowClick={goToDetailPage}
                        addUrl={""}
                        onSelectionChange={setSelectedRows}
                    />
                </div>
                <Button
                    type="button"
                    onClick={async () => {
                        if (selectedRows.length === 0) {
                            toast({
                                title: "Peringatan",
                                description: "Pilih minimal satu baris untuk di-insert.",
                                variant: "destructive"
                            });
                            return;
                        }
                        selectedRows && selectedRows.length > 0 && selectedRows.map(item => {
                            onSelectedRows(job_id, item.task.job_task_id, item.task.note, item.task.id)
                        })
                        onOpenChange(false)
                    }}>Pilih</Button>


            </DialogContent>
        </Dialog>
    )
}