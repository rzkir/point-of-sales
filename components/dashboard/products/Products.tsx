"use client"

import * as React from "react"

import Link from "next/link"

import { IconFilter, IconPackage, IconPlus } from "@tabler/icons-react"

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { AppSkeleton, CardSkeleton } from "@/components/dashboard/AppSkelaton"

import { DeleteProduct } from "@/components/dashboard/products/modal/DeleteModal"

import SupplierModal from "@/components/dashboard/products/modal/SupplierModal"

import BranchModal from "@/components/dashboard/products/modal/BranchModal"

import ProductsDetails from "@/components/dashboard/products/modal/ProductsDetails"

import { ProductFiltersSheet } from "@/components/BottomSheets"

import { useStateProducts } from "@/services/products/useStateProducts"

import { createColumns } from "@/components/dashboard/products/modal/CreateColumsProducts"

export default function Products() {
    const {
        products,
        isLoading,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        loadProducts,
        activeCount,
        handlePageChange,
        handleLimitChange,
        selectedProduct,
        showDeleteDialog,
        setShowDeleteDialog,
        showDetailsDialog,
        setShowDetailsDialog,
        showSupplierDialog,
        setShowSupplierDialog,
        showBranchDialog,
        setShowBranchDialog,
        supplier,
        isLoadingSupplier,
        branch,
        isLoadingBranch,
        supplierName,
        branchName,
        categoryName,
        handleOpenDeleteDialog,
        handleViewDetails,
        handleViewSupplier,
        handleViewBranch,
    } = useStateProducts()

    const [filterSheetOpen, setFilterSheetOpen] = React.useState(false)

    const branchOptions = React.useMemo(
        () =>
            Array.from(
                new Set(
                    products
                        .map((product) => product.branch_name)
                        .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
                )
            ),
        [products]
    )

    const categoryOptions = React.useMemo(
        () =>
            Array.from(
                new Set(
                    products
                        .map((product) => product.category_name)
                        .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
                )
            ),
        [products]
    )

    const supplierOptions = React.useMemo(
        () =>
            Array.from(
                new Set(
                    products
                        .map((product) => product.supplier_name)
                        .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
                )
            ),
        [products]
    )

    const columns = React.useMemo(
        () =>
            createColumns({
                onDelete: (product) => handleOpenDeleteDialog(product),
                onViewSupplier: (product) => void handleViewSupplier(product),
                onViewBranch: (product) => void handleViewBranch(product),
                onViewDetails: (product) => handleViewDetails(product),
            }),
        [handleOpenDeleteDialog, handleViewSupplier, handleViewBranch, handleViewDetails]
    )

    const handleApplyProductFilters = React.useCallback(
        (branch: string, category: string, supplier: string, status: string) => {
            setColumnFilters((prev) => {
                const rest = prev.filter(
                    (f) =>
                        !["branch_name", "category_name", "supplier_name", "is_active"].includes(
                            f.id
                        )
                )
                const next = [...rest]
                if (branch) next.push({ id: "branch_name", value: branch })
                if (category) next.push({ id: "category_name", value: category })
                if (supplier) next.push({ id: "supplier_name", value: supplier })
                if (status) next.push({ id: "is_active", value: status })
                return next
            })
        },
        [setColumnFilters]
    )

    const branchFilter =
        (columnFilters.find((f) => f.id === "branch_name")?.value as string) ?? ""
    const categoryFilter =
        (columnFilters.find((f) => f.id === "category_name")?.value as string) ?? ""
    const supplierFilter =
        (columnFilters.find((f) => f.id === "supplier_name")?.value as string) ?? ""
    const statusFilter =
        (columnFilters.find((f) => f.id === "is_active")?.value as string) ?? ""

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: products,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
    })

    return (
        <section className="space-y-6">
            <Card className="border-2 bg-linear-to-br from-card via-card to-muted/20 shadow-lg overflow-hidden">
                <CardContent>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-lg ring-2 ring-primary/20">
                                    <IconPackage className="size-7" />
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        Products
                                    </h1>
                                    {!isLoading && total > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                            {total} {total === 1 ? "product" : "products"}
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Manage your product catalog. Create, edit, and organize all your items in one place.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                            <Button asChild>
                                <Link href="/dashboard/products/create">
                                    <IconPlus className="mr-2 size-4" />
                                    Add Product
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <CardSkeleton count={3} />
                ) : (
                    <>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Total Products</span>
                                    <IconPackage className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{total}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Active Products</span>
                                    <div className="size-2 rounded-full bg-green-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Displayed</span>
                                    <IconPackage className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{products.length}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Card className="border-2">
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Search product name..."
                                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                    onChange={(event) =>
                                        table.getColumn("name")?.setFilterValue(event.target.value)
                                    }
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setFilterSheetOpen(true)}
                                className="shrink-0"
                            >
                                <IconFilter className="mr-2 size-4" />
                                Filter
                                {(branchFilter || categoryFilter || supplierFilter || statusFilter) && (
                                    <span className="ml-2 size-2 rounded-full bg-primary" />
                                )}
                            </Button>
                        </div>
                        <Button variant="outline" onClick={() => loadProducts()}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-hidden">
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
                                    <AppSkeleton rows={5} />
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
                                                    <IconPackage className="size-8 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold">No products found</h3>
                                                    <p className="text-sm text-muted-foreground max-w-sm">
                                                        Get started by creating your first product
                                                    </p>
                                                </div>
                                                <Button asChild>
                                                    <Link href="/dashboard/products/create">
                                                        <IconPlus className="mr-2 size-4" />
                                                        Add Product
                                                    </Link>
                                                </Button>
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
                        Showing <span className="font-semibold text-foreground">
                            {products.length > 0 ? (page - 1) * limit + 1 : 0}
                        </span> to{" "}
                        <span className="font-semibold text-foreground">
                            {Math.min(page * limit, total)}
                        </span> of{" "}
                        <span className="font-semibold text-foreground">{total}</span> product{total !== 1 ? "s" : ""}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Rows per page:</span>
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

            {/* Global dialogs for product actions */}
            {selectedProduct && (
                <DeleteProduct
                    product={selectedProduct}
                    onUpdate={loadProducts}
                    isOpen={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                />
            )}

            <ProductsDetails
                open={showDetailsDialog}
                onOpenChange={setShowDetailsDialog}
                product={selectedProduct}
                supplierName={supplierName}
                branchName={branchName}
                categoryName={categoryName}
            />

            <SupplierModal
                open={showSupplierDialog}
                onOpenChange={setShowSupplierDialog}
                supplier={supplier}
                isLoading={isLoadingSupplier}
            />

            <BranchModal
                open={showBranchDialog}
                onOpenChange={setShowBranchDialog}
                branch={branch}
                isLoading={isLoadingBranch}
            />

            <ProductFiltersSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
                branchFilter={branchFilter}
                categoryFilter={categoryFilter}
                supplierFilter={supplierFilter}
                statusFilter={statusFilter}
                onApply={handleApplyProductFilters}
                branchOptions={branchOptions}
                categoryOptions={categoryOptions}
                supplierOptions={supplierOptions}
            />
        </section>
    )
}
