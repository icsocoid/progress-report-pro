import * as React from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
    type RowSelectionState,
} from "@tanstack/react-table";

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {Link} from "react-router-dom";

interface GenericPaginatedTableProps<TData> {
    title: string;
    description: string;
    columns: ColumnDef<TData>[];
    data: TData[];
    loading: boolean;
    pagination: { pageIndex: number; pageSize: number };
    totalPages: number;
    setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    globalFilter: string;
    setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
    onRowClick?: (data: TData) => void;
    addUrl?: string;
    onSelectionChange?: (rows: TData[]) => void;
}

export function GenericPaginatedTable<TData>({
                                                 title,
                                                 description,
                                                 columns,
                                                 data,
                                                 loading,
                                                 pagination,
                                                 totalPages,
                                                 setPagination,
                                                 globalFilter,
                                                 setGlobalFilter,
                                                 onRowClick,
                                                 addUrl,
                                                 onSelectionChange,
                                             }: GenericPaginatedTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});


    const table = useReactTable({
        data,
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
    });

    React.useEffect(() => {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
        onSelectionChange?.(selectedRows);
    }, [rowSelection]);

    return (
        <Card className="min-w-0">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
                <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nomor..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="h-10 w-full pl-8 sm:w-[250px] lg:w-[300px]"
                            />
                        </div>
                    </div>
                    {
                        addUrl !== "" ? <div className="flex gap-2">
                            <Link to={addUrl || ""} className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah
                            </Link>
                        </div> : null
                    }

                </div>

                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <>
                                    <TableRow><TableCell colSpan={columns.length}><Skeleton className="h-9 w-full" /></TableCell></TableRow>
                                    <TableRow><TableCell colSpan={columns.length}><Skeleton className="h-9 w-full" /></TableCell></TableRow>
                                </>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer hover:bg-muted/40"
                                        onClick={() => onRowClick?.(row.original)}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
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

                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-end">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Page {pagination.pageIndex + 1} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
