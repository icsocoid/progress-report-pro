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
import {
    ArrowUpDown,
    Search,
    Plus,
    Filter,
    ChevronDown,
    Check,
    AlertTriangle,
    Trash,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios";
import {InitProgressReport, type ProgressReport} from "@/models/progress.ts";
import {Link} from "react-router-dom";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {bulanIndo, convertIndonesiaFormat} from "@/utils/helpers.ts";
import { Label } from "@/components/ui/label"
import {type Client} from "@/models/client.ts";
import {SearchableSelect} from "@/components/SearchableSelect.tsx";
import MonthYearPicker from "@/components/MonthYearPicker.tsx";
import {useUser} from "@/models/user.ts";
import {type Jasa} from "@/models/job.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {useState} from "react";
import {useToast} from "@/hooks/use-toast.ts";
import DeleteConfirmation from "@/components/DeleteConfirmation.tsx";

// Define the columns for the table


export function ProgressTable() {

    const [progressReports, setProgressReports] = React.useState<ProgressReport[]>([])
    const apiUrl = import.meta.env.VITE_API_URL
    const [loading, setLoading] = React.useState(true)
    const [selectedClient, setSelectedClient] = React.useState<Client>()
    const [selectedJasa, setSelectedJasa] = React.useState<Jasa>()
    const [tanggalPeriode, setTanggalPeriode] = React.useState<Date>(new Date())
    const [bulan, setBulan] = React.useState("0")
    const [tahun, setTahun] = React.useState("")
    const user = useUser()
    const urlJasa = user ? `https://${user.asal_pt}/`: 'https://als_pro.icso.biz.id/'

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    //const navigate = useNavigate()
    const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    const [isDeleteProgressOpen, setDeleteProgressOpen] = useState(false)
    const [dataSelected, setDataSelected] = useState(InitProgressReport)
    const { toast } = useToast()
    const [pagination, setPagination] = React.useState({
        pageIndex: 0, // 0-based
        pageSize: 10,
    })
    const [totalPages, setTotalPages] = React.useState(1)
    const [isClear, setIsClear] = React.useState(false)

    const goToDetailPage = (progress: ProgressReport) => {
        //navigate(`/progress/detail/${progress.id}`);
        window.open(`/progress/detail/${progress.id}`, '_blank');
    }




    const getStatusBadgeClass = (status?: string) => {
        switch ((status ?? "").toLowerCase()) {
            case "done":
            case "selesai":
            case "completed":
            case "approved":
                return "border-green-200 bg-green-50 text-green-700"
            case "progress":
            case "in progress":
            case "on progress":
                return "border-blue-200 bg-blue-50 text-blue-700"
            case "pending":
            case "draft":
                return "border-amber-200 bg-amber-50 text-amber-700"
            case "rejected":
            case "reject":
                return "border-red-200 bg-red-50 text-red-700"
            default:
                return "border-slate-200 bg-slate-50 text-slate-700"
        }
    }

    const columns: ColumnDef<ProgressReport>[] = [
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
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Tanggal
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="font-medium">{convertIndonesiaFormat(row.original.tanggal)}</div>
                </div>
            ),
        },
        {
            accessorKey: "nomor",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        No Ticket
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        {row.original.nomor}
                    </div>
                )
            },
        },
        {
            accessorKey: "client.company_name",
            header: "Client",
            cell: ({ row }) => {
                const client = row.original.client;
                return (<div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="font-medium">{client.company_name}</span>
                        <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                </div>)
            },
        },
        {
            accessorKey: "spk.nama_jasa",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Pekerjaan
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        {row.original.spk.nama_jasa}
                    </div>
                )
            },
        },
        {
            accessorKey: "prog.bulan",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Periode
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const prog = row.original
                const bulan = bulanIndo[parseInt(prog.bulan)-1]
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                            {bulan} - {prog.tahun}
                        </Badge>
                    </div>
                )
            },
        },
        {
            accessorKey: "status_progress",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status = row.original.status_progress || "-"

                return (
                    <Badge variant="outline" className={`rounded-full capitalize ${getStatusBadgeClass(status)}`}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const progress = row.original

                return (
                    <div className="flex items-center gap-1">

                        <Button
                            onClick={(e) => {
                                e.stopPropagation()
                                onDeleteAction(progress)
                            }}
                            variant="ghost"
                            className="h-8 w-8 p-0"
                        >
                            <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>

                )
            },
        },
    ]

    const onDeleteAction = (progress: ProgressReport) => {
        setDataSelected(progress)
        setDeleteProgressOpen(true)
    }


    const fetchDeleteProgress = async () => {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/progress/delete/${dataSelected.id}`)
            .then(response => {
                if(response.data.status){
                    toast({
                        title: "Progress report berhasil dihapus!",
                        description: `Data Progress report berhasil dihapus`,
                        duration: 3000,
                        action: (
                            <Check className="h-4 w-4 text-green-600" />
                        ),
                    })
                    fetchProgressReport()
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
                console.error("Gagal untuk hapus progress report:", error)
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
        fetchDeleteProgress()
        setDeleteProgressOpen(false)
    }

    const onCloseDeleteAction = () => {
        setDeleteProgressOpen(false)
    }

    const fetchProgressReport = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${apiUrl}/api/progress/list`,{
                params: {
                    client_code: selectedClient?.customer_code ?? "",
                    tingkatan_jabatan: user?.jabatan.tingkat,
                    user_id: user?.id,
                    bulan: bulan !== "0" ? bulan : "",
                    tahun: tahun,
                    job_code: selectedJasa?.product_code,
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize
                }
            })

            console.log(user?.jabatan.tingkat)
            setProgressReports(response.data.data)
            setTotalPages(response.data.last_page)
        } catch (error) {
            console.error("Failed to fetch jobs:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchProgressReport()
    }, [pagination, isClear, globalFilter])

    const table = useReactTable({
        data: progressReports,
        columns,
        manualPagination: true,
        pageCount: totalPages,
        onPaginationChange: setPagination,
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
            pagination,
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })

    const getFilterSummary = () => {
       const totalFilters =
            (selectedClient ? 1 : 0) +
            (selectedJasa ? 1 : 0) +
            (bulan !== "0" ? 1 : 0) +
            (tahun !== "" ? 1 : 0)
        if (totalFilters === 0) return "Select filters"
        return `${totalFilters} filter${totalFilters > 1 ? "s" : ""} selected`
    }

    const applyFilters = () => {
        fetchProgressReport()
    }

    const clearFilters = () => {
        setSelectedClient(undefined)
        setSelectedJasa(undefined)
        setBulan("0")
        setTahun("")
        setIsClear(true)
    }

    const handleMonthYearPickerChange = (tgl: Date) => {
        setTanggalPeriode(tgl)
        const month = tgl.getMonth() + 1; // getMonth() returns 0-11
        const year = tgl.getFullYear();
        setBulan(month.toString())
        setTahun(year.toString())
    }

    const mapClient = (client: any) => ({
        value: client,
        label: `${client.company_name} (${client.customer_code})`,
    })

    const isEqualClient = (a?: Client, b?: Client) => a?.id === b?.id

    const mapJasa = (jasa: Jasa) => ({
        value: jasa,
        label: `${jasa.product_name} (${jasa.product_code})`,
    })

    const isEqualJasa = (a?: Jasa, b?: Jasa) => a?.id === b?.id

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progress Report</CardTitle>
                <CardDescription>Daftar Progress Report</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari...."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="h-10 w-full pl-8 sm:w-[250px] lg:w-[300px]"
                            />
                        </div>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="min-w-[200px] justify-between">
                                    <Filter className="w-4 h-4 mr-2" />
                                    {getFilterSummary()}
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-80 p-4" align="end">
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-gray-900">Filter Options</div>

                                    {/* Client filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Client</Label>
                                        <SearchableSelect<Client>
                                            apiUrl={`${urlMarketing}client/search-by`}
                                            value={selectedClient}
                                            onChange={(client) => setSelectedClient(client)}
                                            mapOption={mapClient}
                                            isEqual={isEqualClient}
                                        />
                                    </div>

                                    {/* Periode filter (MonthYearPicker) */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Periode</Label>
                                        <MonthYearPicker
                                            month={bulan}
                                            year={tahun}
                                            value={tanggalPeriode}
                                            onChange={(date) => handleMonthYearPickerChange(date)}
                                        />
                                    </div>

                                    {/* Pekerjaan filter */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Pekerjaan</Label>
                                        <SearchableSelect<Jasa>
                                            apiUrl={`${urlJasa}api/services/search`}
                                            value={selectedJasa}
                                            placeholder={"Pilih Nama Jasa/Pekerjaan"}
                                            onChange={(jasa) => setSelectedJasa(jasa)}
                                            mapOption={mapJasa}
                                            isEqual={isEqualJasa}
                                        />
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 pt-2 border-t">
                                        <Button onClick={() => {
                                            applyFilters()
                                            setIsPopoverOpen(false)
                                        }} className="flex-1">
                                            Apply Filters
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                clearFilters()
                                                setIsPopoverOpen(false)
                                            }}
                                            className="flex-1"
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/addprogress" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah
                        </Link>
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
                            {loading ? (
                                <>
                                    <TableRow key={'1'}>
                                        <TableCell colSpan={7} key={"12"}><Skeleton className="h-9 w-full" /></TableCell>
                                    </TableRow>
                                    <TableRow key={'2'}>
                                        <TableCell colSpan={7} key={"13"}><Skeleton className="h-9 w-full" /></TableCell>
                                    </TableRow>
                                </>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} onClick={() => goToDetailPage(row.original)}
                                              className="cursor-pointer hover:bg-muted/40" data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Page {pagination.pageIndex + 1} of {totalPages}
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
                isDeleteProgressOpen ? <DeleteConfirmation showModal={isDeleteProgressOpen} onClose={onCloseDeleteAction} onSubmit={onConfirmDeleteAction} /> : null
            }
        </Card>
    )
}
