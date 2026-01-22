"use client"

import * as React from "react"
import Link from "next/link"
import { IconDotsVertical, IconPackage, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AppSkeleton, CardSkeleton } from "../AppSkelaton"
import { fetchProducts, deleteProduct, type ProductRow } from "@/lib/config"

const formatCurrency = (value?: number) => {
    const n = Number(value ?? 0)
    if (Number.isNaN(n)) return "-"
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)
}

const createColumns = (onUpdate: () => void): ColumnDef<ProductRow>[] => [
    {
        accessorKey: "name",
        header: () => <span className="font-semibold">Name</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconPackage className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{row.getValue("name")}</div>
                    <div className="text-xs text-muted-foreground truncate">
                        {row.original.barcode ? `Barcode: ${row.original.barcode}` : "No barcode"}
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "price",
        header: () => <span className="font-semibold">Price</span>,
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatCurrency(row.getValue("price"))}</span>,
    },
    {
        accessorKey: "stock",
        header: () => <span className="font-semibold">Stock</span>,
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{String(row.getValue("stock") ?? 0)}</span>,
    },
    {
        accessorKey: "is_active",
        header: () => <span className="font-semibold">Status</span>,
        cell: ({ row }) => {
            const isActive = Boolean(row.getValue("is_active"))
            return (
                <Badge className={isActive ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        header: () => <span className="font-semibold">Actions</span>,
        cell: ({ row }) => <ProductActions product={row.original} onUpdate={onUpdate} />,
    },
]

function ProductActions({ product, onUpdate }: { product: ProductRow; onUpdate: () => void }) {
    const isDeletingRef = React.useRef(false)

    const handleDelete = async () => {
        if (isDeletingRef.current) return
        isDeletingRef.current = true
        try {
            await deleteProduct(product.id)
            toast.success("Product deleted")
            onUpdate()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete product")
        } finally {
            isDeletingRef.current = false
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 flex size-9 transition-colors"
                    size="icon"
                >
                    <IconDotsVertical className="size-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/dashboard/products/edit?id=${encodeURIComponent(String(product.id))}`}>
                        <IconPencil className="mr-2 size-4" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => {
                        e.preventDefault()
                        void handleDelete()
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <IconTrash className="mr-2 size-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function Products() {
    const [products, setProducts] = React.useState<ProductRow[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    // Pagination state
    const [page, setPage] = React.useState(1)
    const [limit, setLimit] = React.useState(10)
    const [total, setTotal] = React.useState(0)
    const [totalPages, setTotalPages] = React.useState(0)
    const [hasNext, setHasNext] = React.useState(false)
    const [hasPrev, setHasPrev] = React.useState(false)

    const loadProducts = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetchProducts(page, limit)

            setProducts(response.data || [])

            // Update pagination metadata
            if (response.pagination) {
                setTotal(response.pagination.total || 0)
                setTotalPages(response.pagination.totalPages || 0)
                setHasNext(response.pagination.hasNext || false)
                setHasPrev(response.pagination.hasPrev || false)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch products")
        } finally {
            setIsLoading(false)
        }
    }, [page, limit])

    React.useEffect(() => {
        void loadProducts()
    }, [loadProducts])

    const columns = React.useMemo(() => createColumns(() => loadProducts()), [loadProducts])

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
        manualPagination: true, // Server-side pagination
    })

    const activeCount = products.filter((p) => p.is_active).length

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage)
        }
    }

    const handleLimitChange = (newLimit: string) => {
        const limitNum = parseInt(newLimit, 10)
        setLimit(limitNum)
        setPage(1) // Reset to first page when limit changes
    }

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
                        <div className="max-w-sm">
                            <Input
                                placeholder="Search product name..."
                                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                            />
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
        </section>
    )
}
