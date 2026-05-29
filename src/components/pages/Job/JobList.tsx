import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {ArrowUpDown, MoreHorizontal, Search, Plus, AlertTriangle, Check} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {InitJob, type Job} from "@/models/job.ts";
import axios from "axios";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {AddJobForm} from "@/components/pages/Job/AddJobForm.tsx";
import {useState} from "react"
import {useNavigate} from "react-router-dom";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import DeleteConfirmation from "@/components/DeleteConfirmation.tsx";
import {useToast} from "@/hooks/use-toast.ts";


export function JobsTable() {

    const [jobs, setJobs] = React.useState<Job[]>([])
    const apiUrl = import.meta.env.VITE_API_URL
    const [dataSelected, setDataSelected] = useState(InitJob)
    const [loading, setLoading] = React.useState(true)
    const { toast } = useToast()

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

    const [isAddJobOpen, setIsAddJobOpen] = useState(false)
    const [isDeleteJobOpen, setDeleteJobOpen] = useState(false)
    const navigate = useNavigate()

    const onEditAction = (job: Job) => {
        setDataSelected(job)
        setIsAddJobOpen(true)
    }

    const onDeleteAction = (job: Job) => {
        setDataSelected(job)
        setDeleteJobOpen(true)
    }

    const addNewJobAction = (open: boolean) => {
        setDataSelected(InitJob)
        setIsAddJobOpen(open)
    }

    const fetchDeleteJob = async () => {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/delete/${dataSelected.id}`)
            .then(response => {
                if(response.data.status){
                    toast({
                        title: "Pekerjaan berhasil dihapus!",
                        description: `Data pekerjaan berhasil dihapus`,
                        duration: 3000,
                        action: (
                            <Check className="h-4 w-4 text-green-600" />
                        ),
                    })
                    fetchJobs()
                } else {
                    toast({
                        title: "Peringatan!",
                        description:  response.data.message,
                        duration: 3000,
                        action: (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        ),
                    })
                }

            })
            .catch(error => {
                console.error("Failed to delete job:", error)
                toast({
                    title: "Peringatan!",
                    description:  "Ada kesalahan saat menghapus data. Silahkan coba lagi.",
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })
            });
    }

    const onConfirmDeleteAction = () => {
        fetchDeleteJob()
        setDeleteJobOpen(false)
    }

    const onCloseDeleteAction = () => {
        setDeleteJobOpen(false)
    }

    const onSuccessForm = (condition: boolean) => {
        if(condition){
            fetchJobs()
        }
    }

    const goToDetailPage = (job: Job) => {
        navigate(`/job/edit/${job.id}`);
    }

// Define the columns for the table
    const columns: ColumnDef<Job>[] = [
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
            accessorKey: "job_name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Nama Pekerjaan
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="font-medium">{row.original.jasa.product_name}</div>
                </div>
            ),
        },
        {
            accessorKey: "task_count",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Jumlah Task
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                            {row.original.task_count}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "todo_count",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Jumlah Todo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                            {row.original.todo_count}
                        </Badge>
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const job = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => goToDetailPage(job)}>Detail</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEditAction(job)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDeleteAction(job)} className="text-red-600">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${apiUrl}/api/jobs/list`)
            setJobs(response.data.data)
        } catch (error) {
            console.error("Failed to fetch jobs:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchJobs()
    }, [])

    const table = useReactTable({
        data: jobs,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Master Pekerjaan </CardTitle>
                <CardDescription>Daftar master Pekerjaan</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search produk jasa..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="h-10 w-full pl-8 sm:w-[250px] lg:w-[300px]"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isAddJobOpen} onOpenChange={addNewJobAction}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Pekerjaan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="z-[9999] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Tambah Pekerjaan Baru</DialogTitle>
                                </DialogHeader>
                                <AddJobForm jobData={dataSelected} onSuccess={onSuccessForm} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {
                                loading ? (
                                    <>
                                    <TableRow key={'1'}>
                                        <TableCell colSpan={4} key={"12"}><Skeleton className="h-9 w-full" /></TableCell>
                                    </TableRow>
                                    <TableRow key={'2'}>
                                        <TableCell colSpan={4} key={"13"}><Skeleton className="h-9 w-full" /></TableCell>
                                    </TableRow>
                                    </>
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Data masih kosong.
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
            {
                isDeleteJobOpen ? <DeleteConfirmation showModal={isDeleteJobOpen} onClose={onCloseDeleteAction} onSubmit={onConfirmDeleteAction} /> : null
            }
        </Card>

    )
}
