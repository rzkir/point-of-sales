"use client"

import * as React from "react"

import { IconBuilding, IconMapPin } from "@tabler/icons-react"

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { AppSkeleton, CardSkeleton } from "@/components/dashboard/AppSkelaton"

import { useStateBranches } from "@/services/branches/useStateBranches"

import { BranchCreateForm } from "@/components/dashboard/branches/modal/ModalBranch"

import { createColumns } from "@/components/dashboard/branches/modal/CreateColumns"

export default function Branches() {
    const {
        branches,
        isLoading,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        loadBranches,
    } = useStateBranches()

    const columns = React.useMemo(() => createColumns(loadBranches), [loadBranches])

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: branches,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <section className="space-y-6">
            {/* Header Section */}
            <Card className="border-2 bg-linear-to-br from-card via-card to-muted/20 shadow-lg overflow-hidden">
                <CardContent>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-lg ring-2 ring-primary/20">
                                    <IconBuilding className="size-7" />
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        Cabang
                                    </h1>
                                    {!isLoading && branches.length > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                            {branches.length} {branches.length === 1 ? 'cabang' : 'cabang'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Kelola lokasi dan informasi cabang Anda. Buat, edit, dan atur semua cabang bisnis Anda di satu tempat.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <BranchCreateForm onUpdate={loadBranches} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <CardSkeleton count={3} />
                ) : (
                    <>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Total Cabang</span>
                                    <IconBuilding className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{branches.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Ditampilkan</span>
                                    <IconMapPin className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{table.getRowModel().rows.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <div className="size-2 rounded-full bg-green-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">Aktif</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Table Card */}
            <Card className="border-2">
                <CardContent className="p-0">
                    <div className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-b-2">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="h-12 px-6">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <AppSkeleton rows={5} />
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-6 py-4">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={table.getAllColumns().length}
                                            className="h-64 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                                                    <IconBuilding className="size-8 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold">No branches found</h3>
                                                    <p className="text-sm text-muted-foreground max-w-sm">
                                                        Get started by creating your first branch location
                                                    </p>
                                                </div>
                                                <BranchCreateForm onUpdate={loadBranches} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Info */}
            {!isLoading && branches.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan <span className="font-semibold text-foreground">{table.getRowModel().rows.length}</span> dari{" "}
                        <span className="font-semibold text-foreground">{branches.length}</span> cabang
                    </div>
                </div>
            )}
        </section>
    )
}
