"use client"

import * as React from "react"

import { IconReceipt, IconRefresh, IconFilter, IconSearch } from "@tabler/icons-react"

import {
    flexRender,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Input } from "@/components/ui/input"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { AppSkeleton, CardSkeleton } from "@/components/dashboard/AppSkelaton"

import { useStateTransactions } from "@/services/transactions/useStateTransactions"

import { TransactionFiltersSheet } from "@/components/BottomSheets"

import TransactionItem from "@/components/dashboard/transactions/modal/TransactionItem"

export default function Partial() {
    const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false)
    const [selectedTransaction, setSelectedTransaction] = React.useState<TransactionRow | null>(null)
    const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false)

    const handleViewItems = React.useCallback((transaction: TransactionRow) => {
        setSelectedTransaction(transaction)
        setIsItemDialogOpen(true)
    }, [])

    const {
        transactions,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        loadTransactions,
        handlePageChange,
        handleLimitChange,
        statusFilter,
        paymentStatusFilter,
        branchFilter,
        searchQuery,
        searchInput,
        setStatusFilter,
        setPaymentStatusFilter,
        setBranchFilter,
        setSearchInput,
        handleApplySearch,
        completedCount,
        pendingCount,
        totalDebt,
        isLoadingBranches,
        branches,
        table,
    } = useStateTransactions(handleViewItems, "partial")

    const hasActiveFilters = !!(statusFilter || branchFilter || searchQuery)

    return (
        <section className="space-y-6">
            <Card className="border-2 bg-linear-to-br from-card via-card to-muted/20 shadow-lg overflow-hidden">
                <CardContent>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-lg ring-2 ring-primary/20">
                                    <IconReceipt className="size-7" />
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        Transaksi Partial
                                    </h1>
                                    {!isLoading && total > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                            {total} {total === 1 ? "transaksi" : "transaksi"}
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Lihat dan kelola semua transaksi dengan pembayaran partial. Lacak pembayaran yang belum lunas dan hutang pelanggan.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <CardSkeleton count={3} />
                ) : (
                    <>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Total Hutang</span>
                                    <div className="size-2 rounded-full bg-red-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(totalDebt)}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Menunggu</span>
                                    <div className="size-2 rounded-full bg-yellow-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Selesai</span>
                                    <div className="size-2 rounded-full bg-green-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{completedCount}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Card className="border-2">
                <CardHeader className="pb-3">
                    <div className="space-y-4">
                        {/* Search and Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 items-center gap-2 max-w-md">
                                <Input
                                    placeholder="Cari nomor transaksi atau pelanggan..."
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleApplySearch()
                                        }
                                    }}
                                />
                                <Button onClick={handleApplySearch} size="sm">
                                    <IconSearch className="mr-2 size-4" />
                                    Terapkan
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => setIsFilterSheetOpen(true)}>
                                    <IconFilter className="mr-2 size-4" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                            Active
                                        </span>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => loadTransactions()}>
                                    <IconRefresh className="mr-2 size-4" />
                                    Muat Ulang
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-b-2">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="h-12 px-6">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <AppSkeleton rows={limit} columns={table.getAllColumns().length} />
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className="border-b transition-colors hover:bg-muted/50">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-6 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={table.getAllColumns().length} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                                                    <IconReceipt className="size-8 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold">Tidak ada transaksi partial ditemukan</h3>
                                                    <p className="text-sm text-muted-foreground max-w-sm">
                                                        Transaksi dengan pembayaran partial akan muncul di sini
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {!isLoading && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan <span className="font-semibold text-foreground">
                            {transactions.length > 0 ? (page - 1) * limit + 1 : 0}
                        </span> hingga{" "}
                        <span className="font-semibold text-foreground">
                            {Math.min(page * limit, total)}
                        </span> dari{" "}
                        <span className="font-semibold text-foreground">{total}</span> transaksi
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Baris per halaman:</span>
                            <Select value={String(limit)} onValueChange={handleLimitChange}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {totalPages > 0 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(page - 1)}
                                            className={!hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (page <= 3) {
                                            pageNum = i + 1
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = page - 2 + i
                                        }

                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(pageNum)}
                                                    isActive={page === pageNum}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(page + 1)}
                                            className={!hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </div>
            )}

            <TransactionFiltersSheet
                open={isFilterSheetOpen}
                onOpenChange={setIsFilterSheetOpen}
                statusFilter={statusFilter}
                paymentStatusFilter={paymentStatusFilter}
                branchFilter={branchFilter}
                setStatusFilter={setStatusFilter}
                setPaymentStatusFilter={setPaymentStatusFilter}
                setBranchFilter={setBranchFilter}
                branches={branches}
                isLoadingBranches={isLoadingBranches}
                hidePaymentStatusFilter
            />

            <TransactionItem
                open={isItemDialogOpen}
                onOpenChange={(open) => {
                    setIsItemDialogOpen(open)
                    if (!open) {
                        setSelectedTransaction(null)
                    }
                }}
                transaction={selectedTransaction}
            />
        </section>
    )
}
